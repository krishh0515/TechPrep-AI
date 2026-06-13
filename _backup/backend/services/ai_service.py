import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

GEMINI_KEY = os.getenv("GEMINI_API_KEY")

def ask_gemini(prompt: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key={GEMINI_KEY}"
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    response = requests.post(url, json=payload)
    data = response.json()
    
    # If error, print what came back
    if "candidates" not in data:
        print("Gemini Error Response:", data)
        raise Exception(f"Gemini API error: {data}")
    
    return data["candidates"][0]["content"]["parts"][0]["text"]

def generate_question(topic: str) -> str:
    return ask_gemini(
        f"You are a technical interviewer. Ask ONE clear {topic} interview question. Just the question, nothing else."
    )

def evaluate_answer(question: str, answer: str) -> dict:
    result = ask_gemini(
        f"Evaluate this interview answer. Return valid JSON only, no extra text, no markdown:\n"
        f'Example format: {{"score": 7, "feedback": "good", "improvements": "add more", "ideal_answer": "..."}}\n'
        f"Question: {question}\n"
        f"Answer: {answer}"
    )
    cleaned = result.strip().replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)

def explain_code(code: str) -> str:
    return ask_gemini(
        f"Explain this code simply for a beginner. Use bullet points.\n\n{code}"
    )