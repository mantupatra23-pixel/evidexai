import os

EXPERIENTIAL_API_KEY = os.getenv("EXPERIENTIAL_API_KEY", "")
EXPERIENTIAL_BASE_URL = os.getenv("EXPERIENTIAL_BASE_URL", "https://api.experientiallabs.ai/v1")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./evidex.db")
JWT_SECRET = os.getenv("JWT_SECRET", "evidex_clinical_jwt_secret_key_2026")

EXPERIENTIAL_FREE_MODELS = [
    "deepseek-v4-flash",
    "qwen-3.5-27b",
    "gpt-5.6-luna",
    "gemma-3-12b-it",
    "gemini-2.5-flash-lite"
]
