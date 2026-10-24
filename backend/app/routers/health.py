from datetime import datetime, timezone
from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """
    Health check endpoint reporting system status and AI provider configuration.
    """
    return {
        "status": "ok",
        "service": "SkillForge AI",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ai_inference": {
            "configured": settings.is_ai_configured,
            "provider": settings.INFERENCE_PROVIDER_NAME,
            "model": settings.INFERENCE_MODEL,
            "base_url": settings.INFERENCE_BASE_URL,
            "requires_key": not settings.is_ai_configured,
        },
    }
