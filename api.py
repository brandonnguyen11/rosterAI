from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Literal
from google import genai
from google.genai import types
from nfl_scraper import (
    match_titles_only,
    collect_candidate_links_nfl,
    collect_candidate_links_espn,
    create_driver,
)
import os
from dotenv import load_dotenv
import json

# -------------------- Load Gemini API --------------------
load_dotenv("api.env")
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

# -------------------- Pydantic models --------------------
class Athlete(BaseModel):
    name: str
    team: str

class ArticleInput(BaseModel):
    teamName: str
    playerName: str
    articleTitle: str
    sourceURL: str
    sourceHost: str
    date: str
    bodyText: str

class ArticleOutput(ArticleInput):
    summary: str
    sentiment: Literal["Positive", "Negative"]

class ArticleList(BaseModel):
    articles: List[ArticleOutput]

# -------------------- FastAPI --------------------
app = FastAPI(title="Fantasy News Pipeline with Gemini")

@app.post("/articles_with_analysis", response_model=ArticleList)
def articles_with_analysis(athletes: List[Athlete]):
    athletes_data = [a.dict() for a in athletes]

    driver = create_driver()
    try:
        # -------------------- Scrape articles --------------------
        nfl_articles = collect_candidate_links_nfl(driver, "https://www.nfl.com/news/series/analysis-news")
        espn_articles = collect_candidate_links_espn(driver, "https://www.espn.com/espn/latestnews")
        all_articles = nfl_articles + espn_articles

        # -------------------- Match titles to athletes --------------------
        matched_results = match_titles_only(athletes_data, all_articles)

        enriched_articles = []
        for article in matched_results:
            # Only send the article body to Gemini for summary + sentiment
            gemini_prompt = {
                "articleText": article["bodyText"]
            }

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=(
                    f"Given this article text {json.dumps(gemini_prompt)}, "
                    "return JSON with only two fields: "
                    "1) summary: a two-sentence brief summary, "
                    "2) sentiment: Positive or Negative for the player's overall outlook, make sure to choose fairly between and don't only lean to one side. Look at fantasy outlook the article is presenting"
                ),
                config={
                    "response_mime_type": "application/json",
                    "thinking_config": types.ThinkingConfig(thinking_budget=0),
                },
            )

            gemini_result = json.loads(response.text)
            # Merge summary + sentiment into original article
            enriched_articles.append({
                **article,
                "summary": gemini_result.get("summary", ""),
                "sentiment": gemini_result.get("sentiment", "Positive"),
            })

        return {"articles": enriched_articles}

    except Exception as e:
        return {"error": str(e)}
    finally:
        driver.quit()
