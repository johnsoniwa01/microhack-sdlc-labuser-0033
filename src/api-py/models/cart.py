from __future__ import annotations

from pydantic import BaseModel


class CartItemRequest(BaseModel):
    productId: int
    quantity: int


class CheckoutRequest(BaseModel):
    branchId: int = 1
    customerName: str = "Guest Customer"
    items: list[CartItemRequest]


class CheckoutItemResponse(BaseModel):
    productId: int
    quantity: int
    unitPrice: float
    lineTotal: float


class CheckoutResponse(BaseModel):
    orderId: int
    branchId: int
    customerName: str
    status: str
    total: float
    items: list[CheckoutItemResponse]
