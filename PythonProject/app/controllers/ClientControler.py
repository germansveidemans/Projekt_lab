from flask import Blueprint, request, jsonify, render_template
from app.services.ClientService import ClientService

client_bp = Blueprint("clients", __name__, url_prefix="/clients")

@client_bp.get("/ui")
def client_page():
    return render_template("clients.html")

@client_bp.get("/")
def list_clients():
    clients = ClientService.list_clients()
    return jsonify([
        {
            "id": c.id,
            "name_surname": c.name_surname,
            "email": c.email,
            "address": c.address,
            "phone_number": c.phone_number
        }
        for c in clients
    ])


@client_bp.get("/<int:client_id>")
def get_client(client_id):
    client = ClientService.get_client(client_id)
    if not client:
        return jsonify({"error": "Client not found"}), 404

    return jsonify({
        "id": client.id,
        "name_surname": client.name_surname,
        "email": client.email,
        "address": client.address,
        "phone_number": client.phone_number
    })


@client_bp.post("/")
def create_client():
    data = request.get_json() or {}

    required = ["name_surname", "email", "address", "phone_number"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    client = ClientService.create_client(
        data["name_surname"],
        data["email"],
        data["address"],
        data["phone_number"]
    )

    return jsonify({"id": client.id}), 201


@client_bp.put("/<int:client_id>")
def update_client(client_id):
    data = request.get_json() or {}

    required = ["name_surname", "email", "address", "phone_number"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    client = ClientService.update_client(
        client_id,
        data["name_surname"],
        data["email"],
        data["address"],
        data["phone_number"]
    )

    if not client:
        return jsonify({"error": "Client not found"}), 404

    return jsonify({"status": "updated"})


@client_bp.delete("/<int:client_id>")
def delete_client(client_id):
    deleted = ClientService.delete_client(client_id)
    if not deleted:
        return jsonify({"error": "Client not found"}), 404

    return jsonify({"status": "deleted"})

