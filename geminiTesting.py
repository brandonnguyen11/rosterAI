from dotenv import load_dotenv
import os
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import List, Literal


# Load the Gemini API key from your file
load_dotenv(dotenv_path="api.env")
api_key = os.getenv("GEMINI_API_KEY")

print("Gemini API Key loaded:", bool(api_key))

# Initialize the Gemini client
client = genai.Client(api_key=api_key)


class Team(BaseModel):
    insights: List[str] # list overall team insights
    

class Player(BaseModel):
    name: str  # Name of the player
    insights: List[str]  # List of three insights/sentences
    roster_status: Literal["sit", "start"]  # either sit or start
    trade_status: Literal["trade", "hold"]  # either trade or hold

class PlayersList(BaseModel):
    players: List[Player]  # List of Player objects

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="""
    Act as an **Elite Fantasy Football Data Analyst**.

    Provide a concise, data-rich fantasy analysis for players listed in JSON file.

    For 'key stats,' use specific, **verifiable numerical values** for their **most recent two complete games (G1 and G2)**. Metrics must include: Fantasy Points (PPR), Passing Yards, Total TDs (Pass + Rush), and INTs.

    For 'future matchups,' state the upcoming opponent and the opposing defense's **current season average of Fantasy Points Allowed to respective position (FPA)** or their **current Defensive DVOA Rank against the pass**. **USE REAL RECENT DATA IF AVAILABLE, OTHERWISE, DON'T LIST ANYTHING** (e.g., 'Upcoming: vs. WAS (18.5 FPA)').

    For 'insights,' generate three expert, one-sentence analysis points **per player**. Each insight must be strictly under ten words and **incorporate at least one insight must include a specific numerical projection or metric from the key stats or matchup data** (e.g., "Dak's 7.8 Y/A sustains QB1 value."). The analysis must sound highly knowledgeable and decisive.

    Format the entire output as a single JSON object conforming to the provided 'PlayersList' schema.
    """,   config={
        "response_mime_type": "application/json",
        "response_schema": PlayersList,
    },
)
# Use the response as a JSON string.
print(response.text)

# Use instantiated objects.
