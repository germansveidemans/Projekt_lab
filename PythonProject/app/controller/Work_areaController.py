from flask import Blueprint, request, jsonify, abort
from app.config import get_db_connection
from app.utils.db_utils import serialize_rows

work_areas_bp = Blueprint("work_areas_bp", __name__)

@work_areas_bp.get("/")
def list_work_areas():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM work_areas ORDER BY id")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(serialize_rows(rows))

@work_areas_bp.get("/<int:wa_id>")
def get_work_area(wa_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM work_areas WHERE id = %s", (wa_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row: abort(404)
    return jsonify(serialize_rows([row])[0])

@work_areas_bp.post("/")
def create_work_area():
    data = request.get_json(force=True) or {}
    if not data.get("name"):
        abort(400, description="name ir obligāts")
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO work_areas (name) Values (%s)", (data["name"],))
    conn.commit()
    new_id = cur.lastrowid
    cur.close()
    conn.close()
    return jsonify({"id": new_id}), 201


@work_areas_bp.patch("/<int:wa_id>")
def update_work_area(wa_id):
    data = request.get_json(force=True) or {}
    if "name" not in data: abort(400)
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE work_areas SET name = %s WHERE id = %s", (data["name"], wa_id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"ok": True})

@work_areas_bp.delete("/<int:wa_id>")
def delete_work_area(wa_id):
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("DELETE FROM work_areas WHERE id=%s", (wa_id,))
    conn.commit(); cur.close(); conn.close()
    return "", 204
