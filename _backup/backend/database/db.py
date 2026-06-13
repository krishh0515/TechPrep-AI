# backend/database/db.py
from supabase import create_client
import os

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Save session to DB
def save_session(user_id, topic, score):
    supabase.table("sessions").insert({
        "user_id": user_id,
        "topic": topic,
        "score": score
    }).execute()

# Get user progress
def get_progress(user_id):
    return supabase.table("sessions")\
        .select("*")\
        .eq("user_id", user_id)\
        .execute()
