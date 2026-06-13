from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from services.ai_service import AIService
from utils.auth import get_current_user

router = APIRouter(prefix="/code", tags=["Code Explanation"])
ai_service = AIService()

class CodeRequest(BaseModel):
    code: str

@router.post("/explain")
def get_code_explanation(req: CodeRequest, user: dict = Depends(get_current_user)):
    try:
        explanation = ai_service.explain_code(req.code)
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
