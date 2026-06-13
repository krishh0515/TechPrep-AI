import requests
from fastapi import Depends, HTTPException, Header
from config import SUPABASE_URL, SUPABASE_KEY

def get_current_user(authorization: str = Header(None)):
    """Verify the Supabase JWT by calling the Supabase REST API /auth/v1/user endpoint."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    print(f"DEBUG: Auth Header present: {bool(authorization)}")
    try:
        token = authorization.split(" ")[1]
        print(f"DEBUG: Token extracted (first 10 chars): {token[:10]}...")
    except Exception as e:
        print(f"DEBUG: Token extraction failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid Authorization header format. Expected: 'Bearer <token>'")
    
    try:
        print(f"DEBUG: Calling Supabase URL: {SUPABASE_URL}/auth/v1/user")
        resp = requests.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_KEY,
            },
            timeout=10,
        )
        print(f"DEBUG: Supabase response status: {resp.status_code}")
        if resp.status_code != 200:
            print(f"DEBUG: Supabase error body: {resp.text}")
    except requests.RequestException as e:
        print(f"DEBUG: Network error calling Supabase: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Could not reach auth service: {str(e)}")
    
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_data = resp.json()
    return {
        "user_id": user_data.get("id"),
        "email": user_data.get("email"),
        "full_name": user_data.get("user_metadata", {}).get("full_name"),
    }
