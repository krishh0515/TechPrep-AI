# TechPrep AI — Deployment Guide

## Verify locally first

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Deploy backend (Render)

1. Push code to GitHub.
2. [Render](https://render.com) → New → Web Service → connect repo.
3. Settings:
   - **Root Directory**: `backend`
   - **Runtime**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Environment: add `GROQ_API_KEY` (and `GEMINI_API_KEY` if using).
5. Deploy → copy backend URL (e.g. `https://techprep-api.onrender.com`).

## Deploy frontend (Vercel)

1. [Vercel](https://vercel.com) → Add Project → import repo.
2. Settings:
   - **Root Directory**: `frontend`
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment: add `VITE_API_URL` = your Render backend URL.
4. Deploy.

## Notes

- Render free tier spins down after inactivity; first request may be slower.
- Ensure `GROQ_API_KEY` is set for AI features to work.
