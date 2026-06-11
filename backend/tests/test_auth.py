import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Funded-Shield API"


def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "funded-shield-api"
    assert "status" in data
    assert "database" in data


def test_register_and_login():
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "securepass123",
    }

    register_response = client.post("/api/v1/auth/register", json=payload)
    assert register_response.status_code == 201
    user = register_response.json()
    assert user["email"] == payload["email"]
    assert user["name"] == payload["name"]
    assert user["is_active"] is True

    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": payload["email"], "password": payload["password"]},
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token_data['access_token']}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == payload["email"]


def test_register_duplicate_email():
    payload = {
        "name": "Another User",
        "email": "duplicate@example.com",
        "password": "securepass123",
    }
    client.post("/api/v1/auth/register", json=payload)
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409


def test_login_invalid_credentials():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "nobody@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
