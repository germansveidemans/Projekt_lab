
from flask import Blueprint, request, jsonify
from app.services.CarService import CarService

car_bp = Blueprint("cars", __name__, url_prefix="/cars")

@car_bp.get("/")
def list_cars():
    try:
        cars = CarService.list_cars()
        return jsonify([
            {

"id": c.id,

"size": c.size,

"weight": c.weight,

"vehicle_number": c.vehicle_number,

"user_id": c.user_id
            }
            for c in cars
        ])
    except Exception as e:
        print(f"Error in list_cars: {e}")
        return jsonify({"error": str(e)}), 500


@car_bp.get("/<int:car_id>")
def get_car(car_id):
    car = CarService.get_car(car_id)
    if not car:
        return jsonify({"error":"Car not found"}), 404

    return jsonify({

"id": car.id,

"size": car.size,

"weight": car.weight,

"vehicle_number": car.vehicle_number,

"user_id": car.user_id
        })


@car_bp.post("/")
def create_car():
    data = request.get_json() or {}

    required = ["size","weight","vehicle_number","user_id"]
    for field in required:
        if field not in data:
            return jsonify({"error":f"{field} is required"}), 400

    try:
        size = float(data["size"])
        weight = float(data["weight"])
        if size <= 0:
            return jsonify({"error":"Size must be greater than 0"}), 400
        if weight <= 0:
            return jsonify({"error":"Weight must be greater than 0"}), 400
    except (ValueError, TypeError):
        return jsonify({"error":"Size and weight must be valid numbers"}), 400

    if not data.get("vehicle_number") or not data.get("vehicle_number").strip():
        return jsonify({"error":"Vehicle number is required"}), 400

    car = CarService.create_car(
        data["size"],
        data["weight"],
        data["vehicle_number"],
        data.get("user_id")
    )

    return jsonify({"id": car.id,

"status":"success"}), 201


@car_bp.put("/<int:car_id>")
def update_car(car_id):
    data = request.get_json() or {}

    required = ["size","weight","vehicle_number","user_id"]
    for field in required:
        if field not in data:
            return jsonify({"error":f"{field} is required"}), 400

    try:
        size = float(data["size"])
        weight = float(data["weight"])
        if size <= 0:
            return jsonify({"error":"Size must be greater than 0"}), 400
        if weight <= 0:
            return jsonify({"error":"Weight must be greater than 0"}), 400
    except (ValueError, TypeError):
        return jsonify({"error":"Size and weight must be valid numbers"}), 400

    if not data.get("vehicle_number") or not data.get("vehicle_number").strip():
        return jsonify({"error":"Vehicle number is required"}), 400

    car = CarService.update_car(
        car_id,
        data["size"],
        data["weight"],
        data["vehicle_number"],
        data.get("user_id")
    )

    if not car:
        return jsonify({"error":"Car not found"}), 404

    return jsonify({"status":"updated"})


@car_bp.delete("/<int:car_id>")
def delete_car(car_id):
    deleted = CarService.delete_car(car_id)
    if not deleted:
        return jsonify({"error":"Car not found"}), 404

    return jsonify({"status":"deleted"})
