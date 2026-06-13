import requests
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/leetcode", tags=["LeetCode"])


LEETCODE_GRAPHQL = "https://leetcode.com/graphql"
PUBLIC_STATS_FALLBACK = "https://leetcode-stats-api.herokuapp.com"


def _get_from_leetcode_graphql(username: str):
  query = """
  query ($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
      }
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
      }
      contributions {
        points
      }
    }
  }
  """
  payload = {"query": query, "variables": {"username": username}}
  headers = {"Content-Type": "application/json", "Referer": "https://leetcode.com"}

  resp = requests.post(LEETCODE_GRAPHQL, json=payload, headers=headers, timeout=10)
  if resp.status_code != 200:
    raise HTTPException(status_code=502, detail=f"LeetCode GraphQL error: HTTP {resp.status_code}")

  try:
    body = resp.json()
  except ValueError as exc:
    raise HTTPException(status_code=502, detail="Invalid response from LeetCode GraphQL") from exc

  if body.get("errors"):
    # Keep it user-friendly.
    raise HTTPException(status_code=404, detail="LeetCode username not found (GraphQL).")

  matched = (body.get("data") or {}).get("matchedUser")
  if not matched:
    raise HTTPException(status_code=404, detail="LeetCode username not found.")

  ac = (((matched.get("submitStats") or {}).get("acSubmissionNum")) or [])
  counts = {str(x.get("difficulty", "")).lower(): x.get("count", 0) for x in ac if isinstance(x, dict)}

  return {
    "username": matched.get("username") or username,
    "totalSolved": counts.get("all", 0),
    "easySolved": counts.get("easy", 0),
    "mediumSolved": counts.get("medium", 0),
    "hardSolved": counts.get("hard", 0),
    "ranking": (matched.get("profile") or {}).get("ranking"),
    "acceptanceRate": None,
    "contributionPoints": (matched.get("contributions") or {}).get("points"),
  }


def _get_from_public_fallback(username: str):
  url = f"{PUBLIC_STATS_FALLBACK}/{username}"
  resp = requests.get(url, timeout=8)
  if resp.status_code != 200:
    raise HTTPException(status_code=404, detail="LeetCode username not found.")
  try:
    data = resp.json()
  except ValueError as exc:
    raise HTTPException(status_code=502, detail="Invalid response from stats service") from exc

  return {
    "username": username,
    "totalSolved": data.get("totalSolved", 0),
    "easySolved": data.get("easySolved", 0),
    "mediumSolved": data.get("mediumSolved", 0),
    "hardSolved": data.get("hardSolved", 0),
    "ranking": data.get("ranking"),
    "acceptanceRate": data.get("acceptanceRate"),
    "contributionPoints": data.get("contributionPoints"),
  }


@router.get("/stats/{username}")
def get_leetcode_stats(username: str):
  """
  Safe LeetCode stats proxy.

  Uses LeetCode public GraphQL (no auth, no cookies) to fetch high-level stats
  for the given username. If LeetCode GraphQL fails due to rate limits / edge
  cases, we fall back to a public community stats API.

  We do NOT store any LeetCode credentials.
  """
  if not username:
    raise HTTPException(status_code=400, detail="Username is required")

  try:
    return _get_from_leetcode_graphql(username)
  except HTTPException as exc:
    # If username is genuinely not found, return that directly.
    if exc.status_code == 404:
      raise
    # Otherwise, try fallback.
    return _get_from_public_fallback(username)
  except Exception:
    # Fallback for unexpected issues.
    return _get_from_public_fallback(username)

