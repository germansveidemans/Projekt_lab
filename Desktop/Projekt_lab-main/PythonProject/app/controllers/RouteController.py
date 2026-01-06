
from flask import Blueprint, request, jsonify
from app.services.RouteService import RouteService
from app.services.UserService import UserService

route_bp = Blueprint("routes", __name__, url_prefix="/routes")


def route_to_dict(r):
    courier_name = None
    if r.courier_id:
        try:
            u = UserService.get_user(r.courier_id)
            if u:
                courier_name = getattr(u,'username', None)
        except Exception:
            courier_name = None
    
    distance_m = float(getattr(r,'total_distance', 0) or 0)
    distance_km = distance_m / 1000.0 if distance_m > 100 else distance_m
    
    time_minutes = int(getattr(r,'estimated_time_minutes', 0) or 0)
    hours = time_minutes // 60 if time_minutes > 0 else 0
    minutes = time_minutes % 60 if time_minutes > 0 else time_minutes
    time_display =f"{hours}h {minutes}min" if hours > 0 else (f"{minutes}min" if minutes > 0 else"0 min")

    return {

"id": r.id,

"courier_id": r.courier_id,

"courier_name": courier_name,

"total_orders": r.total_orders,

"total_distance": distance_m,

"total_distance_km": round(distance_km, 2),

"estimated_time_minutes": time_minutes,

"estimated_time_display": time_display,

"optimized_path": r.optimized_path,

"optimized_order_ids": r.optimized_order_ids,

"status": r.status,

"created_at": r.created_at.isoformat() if hasattr(r.created_at,"isoformat") else r.created_at,

"delivery_date": r.delivery_date.isoformat() if hasattr(r,'delivery_date') and r.delivery_date and hasattr(r.delivery_date,"isoformat") else (str(r.delivery_date) if hasattr(r,'delivery_date') and r.delivery_date else None),
    }


@route_bp.get("/")
def list_routes():
    print("[DEBUG] GET /routes/ called")
    routes = RouteService.list_routes()
    print(f"[DEBUG] Returning {len(routes)} routes")
    return jsonify([route_to_dict(r) for r in routes])


@route_bp.get("/<int:route_id>")
def get_route(route_id: int):
    route = RouteService.get_route(route_id)
    if not route:
        return jsonify({"error":"Route not found"}), 404
    return jsonify(route_to_dict(route))


@route_bp.post("/")
def create_route():
    data = request.get_json() or {}
    print(f"[DEBUG] /routes/ POST payload: {data}")

    required = ["total_orders","total_distance","status"]
    for field in required:
        if field not in data:
            return jsonify({"error":f"{field} is required"}), 400

    try:
        total_orders = int(data["total_orders"])
        total_distance = float(data["total_distance"])
        if total_orders <= 0:
            return jsonify({"error":"Total orders must be greater than 0"}), 400
        if total_distance < 0:
            return jsonify({"error":"Total distance must be >= 0"}), 400
    except (ValueError, TypeError):
        return jsonify({"error":"Total orders and distance must be valid numbers"}), 400

    route = RouteService.create_route(
        courier_id=data.get("courier_id"),
        total_orders=data["total_orders"],
        total_distance=data["total_distance"],
        optimized_path=data.get("optimized_path"),
        optimized_order_ids=data.get("optimized_order_ids"),
        status=data["status"],
    )

    return jsonify(route_to_dict(route)), 201


@route_bp.put("/<int:route_id>")
def update_route(route_id: int):
    data = request.get_json() or {}

    required = ["total_orders","total_distance","status"]
    for field in required:
        if field not in data:
            return jsonify({"error":f"{field} is required"}), 400

    try:
        total_orders = int(data["total_orders"])
        total_distance = float(data["total_distance"])
        if total_orders <= 0:
            return jsonify({"error":"Total orders must be greater than 0"}), 400
        if total_distance < 0:
            return jsonify({"error":"Total distance must be >= 0"}), 400
    except (ValueError, TypeError):
        return jsonify({"error":"Total orders and distance must be valid numbers"}), 400

    route = RouteService.update_route(
        route_id=route_id,
        courier_id=data.get("courier_id"),
        total_orders=data["total_orders"],
        total_distance=data["total_distance"],
        optimized_path=data.get("optimized_path"),
        optimized_order_ids=data.get("optimized_order_ids"),
        status=data["status"],
        estimated_time_minutes=data.get("estimated_time_minutes", 0),
        delivery_date=data.get("delivery_date"),
    )

    if not route:
        return jsonify({"error":"Route not found"}), 404

    if route.delivery_date and route.optimized_order_ids:
        from app.services.OrderService import OrderService
        for order_id in route.optimized_order_ids:
            try:
                OrderService.update_order_delivery_date(order_id, route.delivery_date)
                print(f"[DEBUG] Updated order {order_id} delivery date to {route.delivery_date}")
            except Exception as e:
                print(f"[WARNING] Failed to update order {order_id} delivery date: {e}")

    return jsonify(route_to_dict(route))


@route_bp.delete("/<int:route_id>")
def delete_route(route_id: int):
    deleted = RouteService.delete_route(route_id)
    if not deleted:
        return jsonify({"error":"Route not found"}), 404
    return jsonify({"status":"deleted"})


@route_bp.post("/<int:route_id>/complete")
def complete_route(route_id: int):
    completed = RouteService.complete_route(route_id)
    if not completed:
        return jsonify({"error":"Route not found or could not be completed"}), 404
    return jsonify({"status":"completed","message":"Route and orders marked as completed"})
