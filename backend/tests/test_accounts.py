import pytest
from decimal import Decimal
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def _register_and_login(email: str) -> str:
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Trader",
            "email": email,
            "password": "securepass123",
        },
    )
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": "securepass123"},
    )
    return response.json()["access_token"]


def test_account_crud():
    token = _register_and_login("trader-accounts@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    create_response = client.post(
        "/api/v1/accounts",
        headers=headers,
        json={
            "account_name": "FTMO 100K",
            "prop_firm": "FTMO",
            "platform": "MT5",
            "account_number": "12345678",
            "starting_balance": "100000.00",
            "daily_loss_limit": "5000.00",
            "max_drawdown": "10000.00",
            "status": "active",
        },
    )
    assert create_response.status_code == 201
    account = create_response.json()
    account_id = account["id"]
    assert account["prop_firm"] == "FTMO"
    assert account["platform"] == "MT5"

    list_response = client.get("/api/v1/accounts", headers=headers)
    assert list_response.status_code == 200
    data = list_response.json()
    assert data["total"] == 1
    assert data["active_count"] == 1

    get_response = client.get(f"/api/v1/accounts/{account_id}", headers=headers)
    assert get_response.status_code == 200

    update_response = client.put(
        f"/api/v1/accounts/{account_id}",
        headers=headers,
        json={"account_name": "FTMO 100K Updated"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["account_name"] == "FTMO 100K Updated"

    delete_response = client.delete(
        f"/api/v1/accounts/{account_id}",
        headers=headers,
    )
    assert delete_response.status_code == 204

    assert client.get(f"/api/v1/accounts/{account_id}", headers=headers).status_code == 404


def test_cannot_access_other_users_account():
    token_a = _register_and_login("trader-a@example.com")
    token_b = _register_and_login("trader-b@example.com")

    create_response = client.post(
        "/api/v1/accounts",
        headers={"Authorization": f"Bearer {token_a}"},
        json={
            "account_name": "Private Account",
            "prop_firm": "FTMO",
            "platform": "MT4",
            "account_number": "99999",
            "starting_balance": "50000",
            "daily_loss_limit": "2500",
            "max_drawdown": "5000",
        },
    )
    account_id = create_response.json()["id"]

    forbidden = client.get(
        f"/api/v1/accounts/{account_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert forbidden.status_code == 404
