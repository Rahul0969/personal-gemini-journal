from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class JournalRequest(BaseModel):
    text: str

@app.get("/")
def root():
    return {"message": "Personal Gemini Journal API"}

@app.post("/api/analyze")
def analyze_journal(request: JournalRequest):
    prompt = f"""
Analyze this personal journal entry.

Return ONLY valid JSON with exactly these fields:
summary
mood
moodScore
emotions
keyThemes
reflection
helpfulInsight
suggestedAction

Rules:
- mood must be one of: Happy, Calm, Neutral, Sad, Anxious, Angry, Stressed, Excited
- moodScore must be an integer from 1 to 10
- emotions must be an array of short emotion names
- keyThemes must be an array of short theme names
- Keep the response supportive and non-clinical
- Do not diagnose mental health conditions
- summary should be concise
- reflection should help the user understand their experience
- helpfulInsight should identify a useful pattern or perspective
- suggestedAction should be practical and achievable

Journal entry:
{request.text}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )

    return {"analysis": response.text}