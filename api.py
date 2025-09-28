from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
from nfl_scraper import run_pipeline


app = FastAPI()

class Athlete(BaseModel):
    name: str
    team: str

@app.post("/articles")
def get_articles(athletes: List[Athlete]):
    # Convert Pydantic models to plain dicts
    athletes_data = [a.dict() for a in athletes]
    results = run_pipeline(athletes_data)
    return {"articles": results}