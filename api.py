from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
from urllib.parse import urlparse
from nfl_scraper import match_titles_only, collect_candidate_links_nfl, collect_candidate_links_espn, get_article_body_text, create_driver
import json

app = FastAPI()

class Athlete(BaseModel):
    name: str
    team: str

@app.post("/articles")
def get_articles(athletes: List[Athlete]):
    # Convert Pydantic models to plain dicts
    athletes_data = [a.dict() for a in athletes]

    driver = create_driver()
    try:
        # Collect articles from NFL and ESPN
        nfl_articles = collect_candidate_links_nfl(driver, "https://www.nfl.com/news/series/analysis-news")
        espn_articles = collect_candidate_links_espn(driver, "https://www.espn.com/espn/latestnews")
        all_articles = nfl_articles + espn_articles

        # Match titles to athletes
        matched_results = match_titles_only(athletes_data, all_articles)

        # Ensure JSON serializable: convert None -> "", dates already formatted as strings
        for r in matched_results:
            for k, v in r.items():
                if v is None:
                    r[k] = ""

        # --- Write debug output to local JSON file ---
        with open("debug_output.json", "w", encoding="utf-8") as f:
            json.dump(matched_results, f, indent=2, ensure_ascii=False)

        return {"articles": matched_results}

    except Exception as e:
        return {"error": str(e)}
    finally:
        driver.quit()
