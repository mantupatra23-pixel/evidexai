import os

EXPERIENTIAL_API_KEY = os.getenv("EXPERIENTIAL_API_KEY", "")
EXPERIENTIAL_BASE_URL = os.getenv("EXPERIENTIAL_BASE_URL", "https://api.experientiallabs.ai/v1")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Sanitize DATABASE_URL: Agar Render me galti se https:// ya galat link ho to ignore karein
raw_db_url = os.getenv("DATABASE_URL", "")
if not raw_db_url or raw_db_url.startswith("http://") or raw_db_url.startswith("https://"):
    DATABASE_URL = "sqlite:///./evidex.db"
elif raw_db_url.startswith("postgres://"):
    DATABASE_URL = raw_db_url.replace("postgres://", "postgresql://", 1)
else:
    DATABASE_URL = raw_db_url

JWT_SECRET = os.getenv("JWT_SECRET", "evidex_clinical_jwt_secret_key_2026_enterprise")

EXPERIENTIAL_FREE_MODELS = [
    "deepseek-v4-flash",
    "qwen-3.5-27b",
    "gpt-5.6-luna",
    "gemma-3-12b-it",
    "gemini-2.5-flash-lite"
]
