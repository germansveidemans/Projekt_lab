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
                courier_name = getattr(u, 'username', None)
        except Exception:
            courier_name = None
    
    # Convert distance from meters to km for display
    distance_m = float(getattr(r, 'total_distance', 0) or 0)
    distance_km = distance_m / 1000.0 if distance_m > 100 else distance_m  # assume already in km if < 100
    
    # Convert minutes to hours and minutes format for display
    time_minutes = int(getattr(r, 'estimated_time_minutes', 0) or 0)
    hours = time_minutes // 60 if time_minutes > 0 else 0
    minutes = time_minutes % 60 if time_minutes > 0 else time_minutes
    time_display = f"{hours}h {minutes}min" if hours > 0 else (f"{minutes}min" if minutes > 0 else "0 min")

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
        "created_at": r.created_at.isoformat() if hasattr(r.created_at, "isoformat") else r.created_at,
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
        return jsonify({"error": "Route not found"}), 404
    return jsonify(route_to_dict(route))


@route_bp.post("/")
def create_route():
    data = request.get_json() or {}
    print(f"[DEBUG] /routes/ POST payload: {data}")

    required = ["total_orders", "total_distance", "status"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

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

    required = ["total_orders", "total_distance", "status"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    route = RouteService.update_route(
        route_id=route_id,
        courier_id=data.get("courier_id"),
        total_orders=data["total_orders"],
        total_distance=data["total_distance"],
        optimized_path=data.get("optimized_path"),
        optimized_order_ids=data.get("optimized_order_ids"),
        status=data["status"],
    )

    if not route:
        return jsonify({"error": "Route not found"}), 404

    return jsonify(route_to_dict(route))


@route_bp.delete("/<int:route_id>")
def delete_route(route_id: int):
    deleted = RouteService.delete_route(route_id)
    if not deleted:
        return jsonify({"error": "Route not found"}), 404
    return jsonify({"status": "deleted"})
