from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from services.ai_service import AIService
from utils.auth import get_current_user
import PyPDF2
import io

router = APIRouter(prefix="/resume", tags=["Resume Analyzer"])
ai_service = AIService()

@router.post("/analyze")
async def analyze_resume(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        content = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
            
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
            
        analysis = ai_service.analyze_resume(text)
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")
