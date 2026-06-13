from fastapi import APIRouter
from services.ai_service import explain_code

router = APIRouter()

@router.post("/explain")
def explain(data: dict):
    explanation = explain_code(data["code"])
    return {"explanation": explanation}