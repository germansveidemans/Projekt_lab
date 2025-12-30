from flask import Blueprint, request, jsonify
from app.services.Work_areaService import WorkAreaService

work_area_bp = Blueprint("work_areas", __name__, url_prefix="/work_areas")

@work_area_bp.get("/")
def list_work_areas():
    areas = WorkAreaService.list_work_areas()
    return jsonify([{"id": a.id, "name": a.name} for a in areas])


@work_area_bp.get("/<int:work_area_id>")
def get_work_area(work_area_id: int):
    area = WorkAreaService.get_work_area(work_area_id)
    if not area:
        return jsonify({"error": "Work area not found"}), 404
    return jsonify({"id": area.id, "name": area.name})


@work_area_bp.post("/")
def create_work_area():
    data = request.get_json() or {}
    name = data.get("name")
    if not name:
        return jsonify({"error": "name is required"}), 400
    try:
        area = WorkAreaService.create_work_area(name)
        return jsonify({"id": area.id, "name": area.name}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@work_area_bp.put("/<int:work_area_id>")
def update_work_area(work_area_id: int):
    data = request.get_json() or {}
    name = data.get("name")
    if not name:
        return jsonify({"error": "name is required"}), 400

    area = WorkAreaService.update_work_area(work_area_id, name)
    if not area:
        return jsonify({"error": "Work area not found"}), 404

    return jsonify({"id": area.id, "name": area.name})


@work_area_bp.delete("/<int:work_area_id>")
def delete_work_area(work_area_id: int):
    deleted = WorkAreaService.delete_work_area(work_area_id)
    if not deleted:
        return jsonify({"error": "Work area not found"}), 404

    return jsonify({"status": "deleted"})
