import re
import httpx
from typing import Optional
from fastapi import HTTPException
from app.config import settings


SYSTEM_PROMPT = """You are an expert AI Agent Systems Engineer specializing in creating open-source, reusable Agent Skills (SKILL.md).
An AI Skill is a modular capability definition that enables autonomous coding agents and LLM assistants to execute complex, specialized workflows reliably.

CRITICAL INSTRUCTIONS:
1. Your output MUST be ONLY the valid SKILL.md content.
2. It MUST start immediately with the YAML frontmatter enclosed in '---'.
3. The YAML frontmatter MUST contain:
   - name: kebab-case unique identifier (e.g., github-pr-reviewer, docker-optimizer)
   - description: 1-2 concise sentences summarizing what the skill does and exact triggers for when an agent should use it
   - version: 1.0.0
   - tags: list of relevant categories/topics
4. Following the closing '---' of the frontmatter, write comprehensive, production-grade Markdown instructions including:
   - # Overview & Capabilities
   - ## Prerequisites & Environment
   - ## Step-by-Step Workflow & Protocol
   - ## Best Practices & Edge Cases
   - ## Example Invocations & Commands
5. Do NOT wrap your entire output in backticks (e.g., do not put ```markdown at the start). Start immediately with ---.
"""


def clean_skill_output(raw_text: str) -> str:
    """Removes accidental outer markdown code block wrapping if present."""
    text = raw_text.strip()
    # Check if text is enclosed in ```markdown ... ``` or ``` ... ```
    match = re.match(r"^```(?:markdown|yaml|md)?\r?\n(.*?)\r?\n```$", text, re.DOTALL | re.IGNORECASE)
    if match:
        text = match.group(1).strip()
    return text


async def generate_skill_content(
    user_prompt: str,
    skill_name: Optional[str] = None,
    category: Optional[str] = None,
) -> str:
    """
    Calls the hosted open-weight AI inference API to generate a production-ready SKILL.md.
    Supports both Backboard (threads/messages) and OpenAI-compatible inference APIs (Groq, Together, HF).
    Strictly enforces that a configured provider and API key exist.
    """
    if not settings.is_ai_configured:
        raise HTTPException(
            status_code=503,
            detail=(
                "Open-weight AI inference provider is not configured. "
                "Please configure INFERENCE_API_KEY in backend/.env "
                f"(Provider: {settings.INFERENCE_PROVIDER_NAME}, Model: {settings.INFERENCE_MODEL})."
            ),
        )

    user_instructions = f"Skill Requirements / Description:\n{user_prompt.strip()}\n"
    if skill_name and skill_name.strip():
        user_instructions += f"\nRequested Skill Name: {skill_name.strip()}"
    if category and category.strip():
        user_instructions += f"\nSkill Category/Domain: {category.strip()}"

    is_backboard = "backboard" in settings.INFERENCE_PROVIDER_NAME.lower() or "backboard" in settings.INFERENCE_BASE_URL.lower()

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            if is_backboard:
                # Backboard AI endpoint
                api_url = f"{settings.INFERENCE_BASE_URL.rstrip('/')}/threads/messages"
                headers = {
                    "X-API-Key": settings.INFERENCE_API_KEY,
                    "Content-Type": "application/json",
                }
                payload = {
                    "content": user_instructions,
                    "llm_model": settings.INFERENCE_MODEL,
                    "system_prompt": SYSTEM_PROMPT,
                }
                response = await client.post(api_url, json=payload, headers=headers)
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=502,
                        detail=f"Backboard API returned error (HTTP {response.status_code}): {response.text}",
                    )
                data = response.json()
                raw_generated = data.get("content", "")
            else:
                # OpenAI-compatible hosted open-weight API (Groq, Together AI, Hugging Face, OpenRouter)
                api_url = f"{settings.INFERENCE_BASE_URL.rstrip('/')}/chat/completions"
                headers = {
                    "Authorization": f"Bearer {settings.INFERENCE_API_KEY}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "model": settings.INFERENCE_MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_instructions},
                    ],
                    "temperature": settings.INFERENCE_TEMPERATURE,
                    "max_tokens": settings.INFERENCE_MAX_TOKENS,
                }
                response = await client.post(api_url, json=payload, headers=headers)
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=502,
                        detail=f"Inference API returned error (HTTP {response.status_code}): {response.text}",
                    )
                data = response.json()
                choices = data.get("choices", [])
                if not choices:
                    raise HTTPException(
                        status_code=502,
                        detail="Inference API returned an empty choices list.",
                    )
                raw_generated = choices[0].get("message", {}).get("content", "")

            if not raw_generated.strip():
                raise HTTPException(
                    status_code=502,
                    detail="Inference API returned empty content.",
                )

            return clean_skill_output(raw_generated)

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=504,
            detail=f"Network error connecting to AI inference service: {str(exc)}",
        )
