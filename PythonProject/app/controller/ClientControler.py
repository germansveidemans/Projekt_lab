from flask import Blueprint, request, jsonify, abort
from app.config import get_db_connection
from app.utils.db_utils import serialize_rows, pagination_params

clients_bp = Blueprint("clients_bp", __name__)

@clients_bp.get("/")
def list_clients():
    limit, offset = pagination_params(request)
    s = request.args.get("search")
    sql = "SELECT id, name_surname, email, address, phone_number FROM clients WHERE 1=1"
    params = []
    if s:
        sql += " AND (name_surname LIKE %s OR email LIKE %s)"
        params += [f"%{s}%", f"%{s}%"]
    count_sql = f"SELECT COUNT(*) FROM ({sql}) t"
    sql += " ORDER BY id LIMIT %s OFFSET %s"
    params_page = params + [limit, offset]

    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    cur.execute(count_sql, params); total = cur.fetchone()["COUNT(*)"]
    cur.execute(sql, params_page); rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify({"items": serialize_rows(rows), "total": total, "limit": limit, "offset": offset})

@clients_bp.get("/<int:client_id>")
def get_client(client_id):
    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, name_surname, email, address, phone_number FROM clients WHERE id=%s", (client_id,))
    row = cur.fetchone(); cur.close(); conn.close()
    if not row: abort(404)
    return jsonify(serialize_rows([row])[0])

@clients_bp.post("/")
def create_client():
    data = request.get_json(force=True) or {}
    if not data.get("name_surname"): abort(400, description="name_surname ir obligāts")
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("INSERT INTO clients (name_surname, email, address, phone_number) VALUES (%s,%s,%s,%s)",
                (data["name_surname"], data.get("email"), data.get("address"), data.get("phone_number")))
    conn.commit(); new_id = cur.lastrowid; cur.close(); conn.close()
    return jsonify({"id": new_id}), 201

@clients_bp.patch("/<int:client_id>")
def update_client(client_id):
    data = request.get_json(force=True) or {}
    fields, params = [], []
    for f in ("name_surname","email","address","phone_number"):
        if f in data: fields.append(f"{f}=%s"); params.append(data[f])
    if not fields: abort(400)
    params.append(client_id)
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute(f"UPDATE clients SET {', '.join(fields)} WHERE id=%s", params)
    conn.commit(); cur.close(); conn.close()
    return jsonify({"ok": True})

@clients_bp.delete("/<int:client_id>")
def delete_client(client_id):
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("DELETE FROM clients WHERE id=%s", (client_id,))
    conn.commit(); cur.close(); conn.close()
    return "", 204
