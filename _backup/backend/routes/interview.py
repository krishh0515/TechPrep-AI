from fastapi import APIRouter
from services.ai_service import generate_question, evaluate_answer

router = APIRouter()

@router.get("/question")
def get_question(topic: str):
    question = generate_question(topic)
    return {"question": question}

@router.post("/evaluate")
def evaluate(data: dict):
    result = evaluate_answer(data["question"], data["answer"])
    return {"result": result}