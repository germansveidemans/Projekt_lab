
from flask import Blueprint, request, jsonify
from app.services.UserService import UserService

user_bp = Blueprint("users", __name__, url_prefix="/users")

@user_bp.get("/")
def list_users():
    try:
        users = UserService.list_users()
        return jsonify([
            {

"id": u.id,

"username": u.username,

"password": u.password,

"role": u.role,

"work_area_id": u.work_area_id
            }
            for u in users
        ])
    except Exception as e:
        print(f"Error in list_users: {e}")
        return jsonify({"error": str(e)}), 500


@user_bp.get("/<int:user_id>")
def get_user(user_id):
    user = UserService.get_user(user_id)
    if not user:
        return jsonify({"error":"User not found"}), 404

    return jsonify({

"id": user.id,

"username": user.username,

"password": user.password,

"role": user.role,

"work_area_id": user.work_area_id
    })


@user_bp.post("/")
def create_user():
    data = request.get_json() or {}

    required = ["username","password","role"]
    for field in required:
        if field not in data:
            return jsonify({"error":f"{field} is required"}), 400

    if not data.get("username") or not data.get("username").strip():
        return jsonify({"error":"Username is required"}), 400
    if not data.get("password") or not data.get("password").strip():
        return jsonify({"error":"Password is required"}), 400
    if len(data["username"].strip()) < 3:
        return jsonify({"error":"Username must be at least 3 characters"}), 400
    if len(data["password"].strip()) < 4:
        return jsonify({"error":"Password must be at least 4 characters"}), 400

    user = UserService.create_user(
        data["username"],
        data["password"],
        data["role"],
        data.get("work_area_id")
    )

    return jsonify({"id": user.id}), 201


@user_bp.put("/<int:user_id>")
def update_user(user_id):
    data = request.get_json() or {}

    required = ["username","password","role"]
    for field in required:
        if field not in data:
            return jsonify({"error":f"{field} is required"}), 400

    if not data.get("username") or not data.get("username").strip():
        return jsonify({"error":"Username is required"}), 400
    if not data.get("password") or not data.get("password").strip():
        return jsonify({"error":"Password is required"}), 400
    if len(data["username"].strip()) < 3:
        return jsonify({"error":"Username must be at least 3 characters"}), 400
    if len(data["password"].strip()) < 4:
        return jsonify({"error":"Password must be at least 4 characters"}), 400

    user = UserService.update_user(
        user_id,
        data["username"],
        data["password"],
        data["role"],
        data.get("work_area_id")
    )

    if not user:
        return jsonify({"error":"User not found"}), 404

    return jsonify({"status":"updated"})


@user_bp.delete("/<int:user_id>")
def delete_user(user_id):
    deleted = UserService.delete_user(user_id)
    if not deleted:
        return jsonify({"error":"User not found"}), 404

    return jsonify({"status":"deleted"})

