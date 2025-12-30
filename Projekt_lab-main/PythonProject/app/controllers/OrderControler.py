from flask import Blueprint, request, jsonify
from app.services.OrderService import OrderService

order_bp = Blueprint("orders", __name__, url_prefix="/orders")

def order_to_dict(o):
    return {
        "id": o.id,
        "size": o.size,
        "weight": o.weight,
        "client_id": o.client_id,
        "address": o.address,
        "expected_delivery_time": o.expected_delivery_time.isoformat() if o.expected_delivery_time else None,
        "route_status": o.route_status,
        "actual_delivery_time": o.actual_delivery_time.isoformat() if o.actual_delivery_time else None,
        "created_at": o.created_at.isoformat() if o.created_at else None,
        "updated_at": o.updated_at.isoformat() if o.updated_at else None,
    }


@order_bp.get("/")
def list_orders():
    try:
        orders = OrderService.list_orders()
        return jsonify([order_to_dict(o) for o in orders])
    except Exception as e:
        print(f"Error in list_orders: {e}")
        return jsonify({"error": str(e)}), 500


@order_bp.get("/<int:order_id>")
def get_order(order_id: int):
    order = OrderService.get_order(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(order_to_dict(order))


@order_bp.post("/")
def create_order():
    data = request.get_json() or {}

    required = ["size", "weight", "expected_delivery_time", "route_status"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    order = OrderService.create_order(
        size=data["size"],
        weight=data["weight"],
        client_id=data.get("client_id"),
        address=data.get("address"),
        expected_delivery_time=data["expected_delivery_time"],
        route_status=data["route_status"],
        actual_delivery_time=data.get("actual_delivery_time"),
    )

    return jsonify(order_to_dict(order)), 201


@order_bp.put("/<int:order_id>")
def update_order(order_id: int):
    data = request.get_json() or {}

    required = ["size", "weight", "expected_delivery_time", "route_status"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    order = OrderService.update_order(
        order_id=order_id,
        size=data["size"],
        weight=data["weight"],
        client_id=data.get("client_id"),
        address=data.get("address"),
        expected_delivery_time=data["expected_delivery_time"],
        route_status=data["route_status"],
        actual_delivery_time=data.get("actual_delivery_time"),
    )

    if not order:
        return jsonify({"error": "Order not found"}), 404

    return jsonify(order_to_dict(order))


@order_bp.delete("/<int:order_id>")
def delete_order(order_id: int):
    deleted = OrderService.delete_order(order_id)
    if not deleted:
        return jsonify({"error": "Order not found"}), 404
    return jsonify({"status": "deleted"})
