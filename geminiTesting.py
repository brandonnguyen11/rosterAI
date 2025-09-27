from dotenv import load_dotenv
import os
from google import genai
from google.genai import types

# Load the Gemini API key from your file
load_dotenv(dotenv_path="api.env")
api_key = os.getenv("GEMINI_API_KEY")

print("Gemini API Key loaded:", bool(api_key))

# Initialize the Gemini client
client = genai.Client(api_key=api_key)

# Send a prompt to the Gemini model
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explain what Georgia Tech is in three sentence",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
    ),
)
print(response.text)
