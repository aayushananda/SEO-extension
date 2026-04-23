import requests
import json
import os
from urllib.parse import urlparse

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")

print(f"[traffic_rank] Loading config from: {CONFIG_PATH}")

if not os.path.exists(CONFIG_PATH):
    print("config.json not found → traffic rank will return -1")
    CONFIG = {}
else:
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        CONFIG = json.load(f)
    print("[traffic_rank] config.json loaded")

try:
    with open(CONFIG_PATH, "r") as f:
        CONFIG = json.load(f)
except Exception as e:
    print(f"⚠️ Could not load config.json: {e}")
    CONFIG = {}

API_KEY = CONFIG.get("TRAFFIC_API_KEY", "")
API_HOST = "similarweb-api1.p.rapidapi.com"


def extract_domain(url: str):
    parsed = urlparse(url if url.startswith("http") else "https://" + url)
    return parsed.netloc


def get_traffic_rank(url: str):
    """Return {'rank': int or None, 'visits': int or None} from SimilarWeb."""
    try:
        domain = extract_domain(url)
        endpoint = f"https://{API_HOST}/v1/visitsInfo"

        headers = {
            "Content-Type": "application/json",
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": API_HOST,
        }

        body = {"q": domain}

        print(f"🔍 Fetching SimilarWeb visitsInfo for: {domain}")
        response = requests.post(endpoint, headers=headers, json=body, timeout=15)
        print(f"🔍 Status Code: {response.status_code}")

        if response.status_code not in (200, 201):
            print(f"❌ API Error: {response.text}")
            return None

        data = response.json()
        print("🔍 Parsed response keys:", list(data.keys()))

        # -------- Extract RANK ----------
        rank = None
        if "GlobalRank" in data and isinstance(data["GlobalRank"], dict):
            rank = data["GlobalRank"].get("Rank")

        # Convert rank
        try:
            rank = int(rank) if rank is not None else None
        except:
            rank = None

        # -------- Extract VISITS ----------
        visits = None
        if "Engagments" in data and isinstance(data["Engagments"], dict):
            raw_visits = data["Engagments"].get("Visits")
            try:
                visits = int(float(raw_visits))
            except:
                visits = None

        # -------- Extract Additional Data ----------
        top_keywords = data.get("TopKeywords", [])
        traffic_sources = data.get("TrafficSources", {})
        competitors = data.get("Competitors", {}).get("TopSimilarityCompetitors", []) if isinstance(data.get("Competitors"), dict) else data.get("Competitors", [])

        return {
            "rank": rank,
            "visits": visits,
            "top_keywords": top_keywords,
            "traffic_sources": traffic_sources,
            "competitors": competitors
        }

    except Exception as e:
        print(f"⚠️ Exception in get_traffic_rank(): {e}")
        return None


# Debug
if __name__ == "__main__":
    print(get_traffic_rank("webportal.jiit.ac.in/jiitwebkiosk/"))

    #trial
