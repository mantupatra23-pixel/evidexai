import os
from dotenv import load_dotenv

load_dotenv()

# Experiential API Configuration
EXPERIENTIAL_API_KEY = os.getenv("EXPERIENTIAL_API_KEY", "")
EXPERIENTIAL_BASE_URL = os.getenv("EXPERIENTIAL_BASE_URL", "https://api.experientiallabs.ai/v1")

# Default Free Models fallback (as verified on dashboard)
EXPERIENTIAL_DEFAULT_FREE_MODELS = [
    "deepseek-v4.1-flash",
    "deepseek-v4-flash",
    "gpt-5.6-luna",
    "qwen3.8-27b"
]

# Strict financial ceiling: never route to models above $0.15 / 1M tokens
MAX_ALLOWED_PRICE_PER_M = 0.15

# External High-Performance Free APIs
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# JWT & Database configurations
JWT_SECRET = os.getenv("JWT_SECRET", "supersecret-clinical-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "43200"))
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./evidex.db")
