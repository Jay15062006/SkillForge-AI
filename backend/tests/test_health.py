import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "SkillForge AI" in data["message"]
    assert data["hacktoberfest"] == "2026"


def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "SkillForge AI"
    assert "ai_inference" in data
    assert "configured" in data["ai_inference"]
    assert "provider" in data["ai_inference"]
