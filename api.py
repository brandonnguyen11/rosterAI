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

            with open("articlesEnhanced.json", "w", encoding="utf-8") as f:
                json.dump({"articles": enriched_articles}, f, ensure_ascii=False, indent=2)

        return {"articles": enriched_articles}

    except Exception as e:
        return {"error": str(e)}
    finally:
        driver.quit()


class Player(BaseModel):
    name: str
    team: str
    pos: str
    slot: str
    opp: str
    

class PlayerInsightOutput(BaseModel):
    playerName: str
    team: str
    pos: str
    opp: str
    recommendation: Literal["START", "SIT"]
    confidence: int
    insights: List[str]

class PlayerInsightList(BaseModel):
    players: List[PlayerInsightOutput]

@app.post("/generate_insights", response_model=PlayerInsightList)
@app.post("/generate_insights", response_model=PlayerInsightList)
def generate_insights(players: List[Player]):
    enriched_players = []

    try:
        with open("articlesEnhanced.json", "r", encoding="utf-8") as f:
            all_articles = json.load(f).get("articles", [])
    except Exception as e:
        all_articles = []
        print("Error loading articlesEnhanced.json:", e)

    for player in players:
        try:
            player_articles = [a for a in all_articles if a.get("playerName") == player.name]
            articles_json = json.dumps(player_articles, ensure_ascii=False)

            prompt_text = (
                f"Player: {player.name} ({player.team})\n"
                f"Position: {player.pos}\n"
                f"Slot: {player.slot}\n"
                f"Opponent: {player.opp}\n\n"
                f"Here are recent articles about this player:\n{articles_json}\n\n"
                "Provide fantasy football advice in JSON with the following fields. Act as a Fantasy expert who is very knowledgable about Fantasy and Football. Try to give the best advice possible.\n"
                "1) recommendation: 'START' or 'SIT'\n"
                "2) confidence: an integer 0-100\n"
                "3) insights: two-three sentences in a list describing key outlook. Each sentence MUST BE LESS THAN TEN WORDS.\n"
            )

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt_text,
                config={
                    "response_mime_type": "application/json",
                    "thinking_config": types.ThinkingConfig(thinking_budget=0),
                },
            )
            print(response)
            gemini_result = json.loads(response.text)

            # Normalize fields
            recommendation = gemini_result.get("recommendation", "SIT")
            if recommendation not in ["START", "SIT"]:
                recommendation = "SIT"

            confidence = gemini_result.get("confidence", 70)
            try:
                confidence = int(confidence)
            except:
                confidence = 70

            insights = gemini_result.get("insights", [])
            if isinstance(insights, str):
                insights = [insights]
            elif not isinstance(insights, list):
                insights = []

            enriched_players.append({
                "playerName": player.name,
                "team": player.team,
                "pos": player.pos,
                "opp": player.opp,
                "recommendation": recommendation,
                "confidence": confidence,
                "insights": insights,
            })

        except Exception as e:
            enriched_players.append({
                "playerName": player.name,
                "team": player.team,
                "pos": player.pos,
                "opp": player.opp,
                "recommendation": "SIT",
                "confidence": 70,
                "insights": [f"Error generating insights: {str(e)}"],
            })

    return {"players": enriched_players}
