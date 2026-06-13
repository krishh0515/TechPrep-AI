import requests
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/leetcode", tags=["LeetCode"])


LEETCODE_GRAPHQL = "https://leetcode.com/graphql"


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
  headers = {
    "Content-Type": "application/json",
    "Referer": "https://leetcode.com",
    "User-Agent": "Mozilla/5.0",
  }

  resp = requests.post(LEETCODE_GRAPHQL, json=payload, headers=headers, timeout=10)
  if resp.status_code != 200:
    raise HTTPException(status_code=502, detail=f"LeetCode GraphQL error: HTTP {resp.status_code}")

  try:
    body = resp.json()
  except ValueError as exc:
    raise HTTPException(status_code=502, detail="Invalid response from LeetCode GraphQL") from exc

  if body.get("errors"):
    raise HTTPException(status_code=404, detail="LeetCode username not found or profile is not public.")

  matched = (body.get("data") or {}).get("matchedUser")
  if not matched:
    raise HTTPException(status_code=404, detail="LeetCode username not found or profile is not public.")

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

@router.get("/stats/{username}")
def get_leetcode_stats(username: str):
  """
  Safe LeetCode stats proxy.

  Uses LeetCode public GraphQL (no auth, no cookies) to fetch high-level stats
  for the given username.

  We do NOT store any LeetCode credentials.
  """
  if not username:
    raise HTTPException(status_code=400, detail="Username is required")

  try:
    return _get_from_leetcode_graphql(username)
  except HTTPException as exc:
    raise exc
  except requests.RequestException as exc:
    raise HTTPException(
      status_code=502,
      detail="LeetCode stats are temporarily unavailable. Try again later or verify the username is public.",
    ) from exc
  except Exception as exc:
    raise HTTPException(
      status_code=502,
      detail="LeetCode stats are temporarily unavailable. Try again later or verify the username is public.",
    ) from exc

