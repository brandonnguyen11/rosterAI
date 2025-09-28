import json
import re
import time
from datetime import datetime
from dateutil import parser as dateparser
from urllib.parse import urlparse

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests

def run_pipeline(athletes_json):
    """Entry point: given athlete JSON from client, return matched articles."""
    driver = create_driver()
    try:
        nfl_articles = collect_candidate_links_nfl(driver, "https://www.nfl.com/news/series/analysis-news")
        espn_articles = collect_candidate_links_espn(driver, "https://www.espn.com/espn/latestnews")

        all_articles = nfl_articles + espn_articles
        print(f"Total collected articles: {len(all_articles)}")

        # Match players against collected articles
        results = match_titles_only(athletes_json, all_articles)
        return results
    finally:
        driver.quit()

# Create Selenium driver
def create_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--ignore-certificate-errors")
    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=options)

# Fetch NFL article date via requests + BeautifulSoup
def get_nfl_article_date(url, driver=None):
    """Fetch NFL article date from <span>Published: ...</span>"""
    try:
        # Try requests first
        headers = {"User-Agent": "Mozilla/5.0"}
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")

            # Grab the span that starts with "Published:"
            span = soup.find("span", string=lambda s: s and s.startswith("Published:"))
            if span:
                date_str = span.get_text().replace("Published:", "").strip()
                return dateparser.parse(date_str).date()

    except Exception:
        pass

    # Fallback to Selenium if requests failed
    if driver:
        try:
            driver.get(url)
            time.sleep(1)
            span = driver.find_element(By.XPATH, "//span[starts-with(text(),'Published:')]")
            if span:
                date_str = span.text.replace("Published:", "").strip()
                return dateparser.parse(date_str).date()
        except Exception:
            pass

    return None
    
# Collect NFL articles
def collect_candidate_links_nfl(driver, url):
    driver.get(url)

    # Wait until the article h3 elements are present (max 5 seconds)
    WebDriverWait(driver, 5).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "h3.d3-o-media-object__title"))
    )

    # Optional: scroll if you still want to load more content
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    WebDriverWait(driver, 3).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "h3.d3-o-media-object__title"))
    )

    articles = {}
    h3_elements = driver.find_elements(By.CSS_SELECTOR, "h3.d3-o-media-object__title")
    print(f"Found {len(h3_elements)} NFL h3 elements")

    for h3 in h3_elements:
        try:
            a = h3.find_element(By.XPATH, "./ancestor::a")
            href = a.get_attribute("href")
            title = h3.text.strip()
            if not href:
                continue

            # Use the new get_nfl_article_date function
            pub_date = get_nfl_article_date(href, driver)
            articles[href] = {
                "url": href,
                "title": title,
                "date": pub_date
            }
            print(f"NFL: Collected '{title}' with date {pub_date}")
        except Exception as e:
            print(f"Error collecting NFL article: {e}")
            continue

    return list(articles.values())

# Collect ESPN articles
def collect_candidate_links_espn(driver, url):
    driver.get(url)

    # Wait until the NFL heading and list items are loaded
    WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.XPATH, "//h3[text()='NFL']"))
    )

    out = {}
    try:
        nfl_heading = driver.find_element(By.XPATH, "//h3[text()='NFL']")
        nfl_ul = nfl_heading.find_element(By.XPATH, "following-sibling::ul[1]")
        list_items = nfl_ul.find_elements(By.TAG_NAME, "li")  # grab each <li>

        for li in list_items:
            try:
                a = li.find_element(By.TAG_NAME, "a")
                href = a.get_attribute("href")
                title = a.text.strip()
                if not href or not title:
                    continue

                # Grab the text of the <li> and remove the anchor text to get the date
                full_text = li.text.strip()
                date_text = full_text.replace(title, "").strip()  # what remains is date
                # Remove parentheses and ET
                date_text = date_text.strip("() ").replace("ET", "").strip()

                try:
                    pub_date = dateparser.parse(date_text).date()
                except Exception:
                    pub_date = None

                out[href] = {
                    "url": href,
                    "title": title,
                    "date": pub_date
                }
            except Exception:
                continue

    except Exception as e:
        print("Error collecting ESPN articles:", e)

    return list(out.values())


# Fetch article body text
def get_article_body_text(url):
    """
    Fetches the main body text of an article from the given URL.
    """
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code != 200:
            return None

        soup = BeautifulSoup(resp.text, "html.parser")

        # NFL or ESPN: grab all paragraphs inside the article
        paragraphs = soup.find_all("p")
        body_text = " ".join(p.get_text().strip() for p in paragraphs if p.get_text().strip())
        return body_text if body_text else None
    except Exception:
        return None


# Match athlete names and save results to JSON
def match_titles_only(athletes, articles):
    results = []
    athlete_patterns = [
        (athlete, re.compile(r"\b" + re.escape(athlete["name"]) + r"\b", flags=re.IGNORECASE))
        for athlete in athletes
    ]

    for art in articles:
        title = art.get("title", "")
        if not title:
            continue

        matched_athletes = [athlete for athlete, pattern in athlete_patterns if pattern.search(title)]
        if not matched_athletes:
            continue

        body_text = get_article_body_text(art["url"])

        for athlete in matched_athletes:
            pub_date = art.get("date")
            formatted_date = pub_date.strftime("%Y-%m-%d") if pub_date else None
            parsed_url = urlparse(art["url"])
            source_host = parsed_url.netloc.replace("www.", "") if parsed_url.netloc else ""

            results.append({
                "teamName": athlete.get("team"),
                "playerName": athlete["name"],
                "articleTitle": title,
                "sourceURL": art["url"],
                "sourceHost": source_host,
                "date": formatted_date,
                "bodyText": body_text
            })

    return results


# Main function
def main():
    athletes = load_athletes()
    driver = create_driver()
    try:
        print("Collecting NFL articles...")
        nfl_articles = collect_candidate_links_nfl(driver, "https://www.nfl.com/news/series/analysis-news")

        print("Collecting ESPN articles...")
        espn_articles = collect_candidate_links_espn(driver, "https://www.espn.com/espn/latestnews")

        all_articles = nfl_articles + espn_articles
        print(f"Total collected articles: {len(all_articles)}")

        match_titles_only_to_json(athletes, all_articles)
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
