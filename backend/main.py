from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import interview, code_explain

try:
    from routes import leetcode
except ImportError:  # pragma: no cover - defensive import
    leetcode = None

try:
    from routes import resume
except ImportError:  # pragma: no cover - defensive import
    resume = None

app = FastAPI(title="TechPrep AI Backend", description="API for TechPrep AI using Gemini API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tech-prep-ai-pi.vercel.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview.router)
app.include_router(code_explain.router)

if resume is not None:
    app.include_router(resume.router)

if leetcode is not None:
    app.include_router(leetcode.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to TechPrep AI Backend API"}
