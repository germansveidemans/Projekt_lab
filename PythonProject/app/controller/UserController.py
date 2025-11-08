from flask import Blueprint, request, jsonify, abort
from app.config import get_db_connection
from app.utils.db_utils import serialize_rows, pagination_params

users_bp = Blueprint("users_bp", __name__)

@users_bp.get("/")
def list_users():
    limit, offset = pagination_params(request)
    search = request.args.get("search")
    role = request.args.get("role")
    wa = request.args.get("work_area_id")

    sql = "SELECT id, username, role, work_area_id FROM users"
    params = []
    if search:
        sql += " AND username LIKE %s"
        params.append(f"%{search}%")
    if role:
        sql += " AND role = %s"
        params.append(role)
    if wa:
        sql += " AND work_area_id = %s"
        params.append(wa)
    count_sql = f"SELECT COUNT(*) FROM ({sql}) t"
    sql += " ORDER BY id LIMIT %s OFFSET %s"
    params_with_page = params + [limit, offset]

    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    cur.execute(count_sql, params); total = cur.fetchone()["COUNT(*)"]
    cur.execute(sql, params_with_page); rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify({"items": serialize_rows(rows), "total": total, "limit": limit, "offset": offset})

@users_bp.get("/<int:user_id>")
def get_user(user_id):
    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    cur.execute("SELECT username, role, work_area_id FROM users WHERE id=%s", (user_id,))
    row = cur.fetchone(); cur.close(); conn.close()
    if not row: abort(404)
    return jsonify(serialize_rows([row])[0])

@users_bp.post("/")
def create_user():
    data = request.get_json(force=True) or {}
    if not data.get("username") or not data.get("password"):
        abort(400, description="username un password ir obligāti")

    conn = get_db_connection(); cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO users (username, password, role, work_area_id) VALUES (%s,%s,%s,%s)",
            (data["username"], data["password"], data.get("role", "courier"), data.get("work_area_id"))
        )
        conn.commit()
        user_id = cur.lastrowid
    except Exception as e:
        conn.rollback(); cur.close(); conn.close()
        abort(409, description=str(e))
    cur.close(); conn.close()
    return jsonify({"id": user_id}), 201

@users_bp.patch("/<int:user_id>")
def update_user(user_id):
    data = request.get_json(force=True) or {}
    fields, params = [], []
    for f in ("username", "role", "work_area_id"):
        if f in data:
            fields.append(f"{f}=%s"); params.append(data[f])
    if not fields and "password" not in data:
        abort(400, description="nav ko jāatjauno")
    if "password" in data:
        fields.append("password=%s"); params.append(data["password"])
    params.append(user_id)

    conn = get_db_connection(); cur = conn.cursor()
    cur.execute(f"UPDATE users SET {', '.join(fields)} WHERE id=%s", params)
    conn.commit(); cur.close(); conn.close()
    return jsonify({"ok": True})

@users_bp.post("/<int:user_id>/change-password")
def change_password(user_id):
    data = request.get_json(force=True) or {}
    old, new = data.get("old_password"), data.get("new_password")
    if not old or not new: abort(400, description="old_password un new_password ir obligāti")

    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    cur.execute("SELECT password FROM users WHERE id=%s", (user_id,))
    row = cur.fetchone()
    if not row: cur.close(); conn.close(); abort(404)
    if not (row["password"], old):
        cur.close(); conn.close(); abort(403, description="veca parole nav pareiza")

    cur = conn.cursor()
    cur.execute("UPDATE users SET password=%s WHERE id=%s", (new, user_id))
    conn.commit(); cur.close(); conn.close()
    return jsonify({"ok": True})

@users_bp.delete("/<int:user_id>")
def delete_user(user_id):
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("DELETE FROM users WHERE id=%s", (user_id,))
    conn.commit(); cur.close(); conn.close()
    return "", 204
