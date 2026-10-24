from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

SAMPLE_MARKDOWN = """---
name: unit-test-agent
description: An agent skill designed for automated unit test authoring and assertions.
version: 1.0.0
---

# Unit Test Agent Skill

## Instructions
Write isolated tests with clear assertions.
"""


def test_validate_endpoint():
    response = client.post("/api/skills/validate", json={"content": SAMPLE_MARKDOWN})
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["frontmatter"]["name"] == "unit-test-agent"


def test_validate_endpoint_invalid():
    response = client.post("/api/skills/validate", json={"content": "invalid without frontmatter"})
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is False
    assert len(data["errors"]) > 0


def test_export_zip_endpoint():
    response = client.post(
        "/api/skills/export-zip",
        json={"name": "unit-test-agent", "content": SAMPLE_MARKDOWN},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"
    assert "attachment" in response.headers.get("content-disposition", "")
    assert len(response.content) > 0


def test_download_md_endpoint():
    response = client.post(
        "/api/skills/download-md",
        json={"name": "unit-test-agent", "content": SAMPLE_MARKDOWN},
    )
    assert response.status_code == 200
    assert "text/markdown" in response.headers["content-type"]
    assert "attachment" in response.headers.get("content-disposition", "")
    assert response.text == SAMPLE_MARKDOWN


def test_generate_endpoint_without_key_fails_cleanly():
    # When INFERENCE_API_KEY is unset or empty, it must return 503
    original_key = settings.INFERENCE_API_KEY
    try:
        settings.INFERENCE_API_KEY = ""
        response = client.post(
            "/api/skills/generate",
            json={"prompt": "Create an automated database migration skill"},
        )
        assert response.status_code == 503
        data = response.json()
        assert "not configured" in data["detail"].lower()
    finally:
        settings.INFERENCE_API_KEY = original_key
