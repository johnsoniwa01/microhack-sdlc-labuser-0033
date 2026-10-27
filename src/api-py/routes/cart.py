from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from models.cart import CheckoutItemResponse, CheckoutRequest, CheckoutResponse
from models.order import CreateOrderRequest
from models.order_detail import CreateOrderDetailRequest
from repositories.order_details import OrderDetailsRepository
from repositories.orders import OrdersRepository
from repositories.products import ProductsRepository
from utils.errors import NotFoundException, ValidationException

router = APIRouter(prefix="/api/cart", tags=["Cart"])
orders_repository = OrdersRepository()
order_details_repository = OrderDetailsRepository()
products_repository = ProductsRepository()


@router.post("/checkout", response_model=CheckoutResponse, status_code=201)
async def checkout(request: CheckoutRequest) -> CheckoutResponse:
    if request.branchId <= 0:
        raise ValidationException("branchId is required")
    if not request.customerName or not request.customerName.strip():
        raise ValidationException("customerName is required")
    if not request.items:
        raise ValidationException("cart is empty")

    order_total = 0.0
    response_items: list[CheckoutItemResponse] = []
    for item in request.items:
        if item.quantity <= 0:
            raise ValidationException(f"quantity for product {item.productId} must be greater than zero")

        product = await products_repository.find_by_id(item.productId)
        if product is None:
            raise NotFoundException("Product", item.productId)

        unit_price = product.price * (1 - (product.discount or 0))
        line_total = unit_price * item.quantity
        order_total += line_total

        response_items.append(
            CheckoutItemResponse(
                productId=item.productId,
                quantity=item.quantity,
                unitPrice=round(unit_price, 2),
                lineTotal=round(line_total, 2),
            )
        )

    order_date = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    order = await orders_repository.create(
        CreateOrderRequest(
            branchId=request.branchId,
            orderDate=order_date,
            name=request.customerName.strip(),
            description="Checkout created from shopping cart",
            status="pending",
        )
    )

    for item in request.items:
        product = await products_repository.find_by_id(item.productId)
        if product is None:
            raise NotFoundException("Product", item.productId)

        unit_price = product.price * (1 - (product.discount or 0))
        await order_details_repository.create(
            CreateOrderDetailRequest(
                orderId=order.orderId,
                productId=item.productId,
                quantity=item.quantity,
                unitPrice=unit_price,
                notes="Created from cart checkout",
            )
        )

    return CheckoutResponse(
        orderId=order.orderId,
        branchId=order.branchId,
        customerName=order.name,
        status=order.status,
        total=round(order_total, 2),
        items=response_items,
    )
