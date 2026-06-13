import os
from dotenv import load_dotenv

# Load .env from the same directory as this file
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# We will use the free Gemini API
GEMINI_API_KEY=os.getenv("GEMINI_API_KEY", "")
# We are switching to Groq for better reliability
GROQ_API_KEY=os.getenv("GROQ_API_KEY", "")
# Supabase credentials for later use
SUPABASE_URL=os.getenv("SUPABASE_URL", "")
SUPABASE_KEY=os.getenv("SUPABASE_KEY", "")
SUPABASE_JWT_SECRET=os.getenv("SUPABASE_JWT_SECRET", "")
