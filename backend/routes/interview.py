import json

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from services.ai_service import AIService
from utils.auth import get_current_user

router = APIRouter(prefix="/interview", tags=["Interview"])
ai_service = AIService()

class QuestionRequest(BaseModel):
    topic: str
    difficulty: str

class AnswerRequest(BaseModel):
    question: str
    answer: str

@router.post("/question")
def get_question(req: QuestionRequest, user: dict = Depends(get_current_user)):
    try:
        question = ai_service.generate_interview_question(req.topic, req.difficulty)
        return {"question": question}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate")
def evaluate_answer(req: AnswerRequest, user: dict = Depends(get_current_user)):
    try:
        feedback_text = ai_service.evaluate_interview_answer(req.question, req.answer)
        clean_text = feedback_text.strip()
        
        # Remove markdown JSON code blocks if they are present
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        elif clean_text.startswith("```"):
            clean_text = clean_text[3:]
        
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
            
        clean_text = clean_text.strip()
        
        try:
            feedback_json = json.loads(clean_text)
            return feedback_json
        except json.JSONDecodeError:
            # Fallback if Gemini failed to generate valid JSON
            return {"feedback": feedback_text, "score": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
