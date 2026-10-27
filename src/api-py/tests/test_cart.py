from __future__ import annotations

from fastapi.testclient import TestClient

from main import app


def test_cart_checkout_creates_order() -> None:
    with TestClient(app) as client:
        product_response = client.get("/api/products")
        assert product_response.status_code == 200
        products = product_response.json()
        assert products

        product_id = products[0]["productId"]
        response = client.post(
            "/api/cart/checkout",
            json={
                "branchId": 1,
                "customerName": "Test Customer",
                "items": [{"productId": product_id, "quantity": 2}],
            },
        )

    assert response.status_code == 201
    body = response.json()
    assert body["customerName"] == "Test Customer"
    assert body["branchId"] == 1
    assert body["items"][0]["productId"] == product_id
    assert body["items"][0]["quantity"] == 2
    assert body["total"] > 0


def test_cart_checkout_requires_items() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/cart/checkout",
            json={
                "branchId": 1,
                "customerName": "Test Customer",
                "items": [],
            },
        )

    assert response.status_code == 400
