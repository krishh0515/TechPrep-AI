from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import interview, code_explain, progress

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview.router, prefix="/interview")
app.include_router(code_explain.router, prefix="/code")
app.include_router(progress.router, prefix="/progress")