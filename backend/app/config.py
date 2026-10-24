import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Load .env file from the backend directory or current working directory
load_dotenv()


class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    # Hosted Open-Weight AI Inference Provider
    INFERENCE_PROVIDER_NAME: str = "groq"
    INFERENCE_BASE_URL: str = "https://api.groq.com/openai/v1"
    INFERENCE_API_KEY: str = ""
    INFERENCE_MODEL: str = "llama-3.3-70b-versatile"
    INFERENCE_MAX_TOKENS: int = 2500
    INFERENCE_TEMPERATURE: float = 0.2

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def is_ai_configured(self) -> bool:
        return bool(self.INFERENCE_API_KEY and self.INFERENCE_API_KEY.strip())


settings = Settings()
