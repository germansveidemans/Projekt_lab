from flask import Blueprint, request, jsonify
from app.services.RouteService import RouteService

route_bp = Blueprint("routes", __name__, url_prefix="/routes")


def route_to_dict(r):
    return {
        "id": r.id,
        "courier_id": r.courier_id,
        "work_time": r.work_time,
        "date": r.date.isoformat() if hasattr(r.date, "isoformat") else r.date,
        "total_orders": r.total_orders,
        "total_distance": r.total_distance,
        "optimized_path": r.optimized_path,
        "status": r.status,
    }


@route_bp.get("/")
def list_routes():
    routes = RouteService.list_routes()
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

    required = ["work_time", "date", "total_orders", "total_distance", "status"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    route = RouteService.create_route(
        courier_id=data.get("courier_id"),
        work_time=data["work_time"],
        date=data["date"],
        total_orders=data["total_orders"],
        total_distance=data["total_distance"],
        optimized_path=data.get("optimized_path"),
        status=data["status"],
    )

    return jsonify(route_to_dict(route)), 201


@route_bp.put("/<int:route_id>")
def update_route(route_id: int):
    data = request.get_json() or {}

    required = ["work_time", "date", "total_orders", "total_distance", "status"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    route = RouteService.update_route(
        route_id=route_id,
        courier_id=data.get("courier_id"),
        work_time=data["work_time"],
        date=data["date"],
        total_orders=data["total_orders"],
        total_distance=data["total_distance"],
        optimized_path=data.get("optimized_path"),
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
