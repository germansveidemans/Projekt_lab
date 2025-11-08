from flask import Blueprint, request, jsonify, abort
from app.config import get_db_connection
from app.utils.db_utils import serialize_rows, pagination_params

routes_bp = Blueprint("routes_bp", __name__)

def _route_to_dict_row(r):  # rows уже dict
    return r

@routes_bp.get("/")
def list_routes():
    limit, offset = pagination_params(request)
    courier_id = request.args.get("courier_id")
    date = request.args.get("date")
    status = request.args.get("status")

    sql = "SELECT id, courier_id, work_time, date, total_orders, total_distance, optimized_path, status FROM routes WHERE 1=1"
    params = []
    if courier_id: sql += " AND courier_id=%s"; params.append(courier_id)
    if date:       sql += " AND date=%s"; params.append(date)
    if status:     sql += " AND status=%s"; params.append(status)
    count_sql = f"SELECT COUNT(*) FROM ({sql}) t"
    sql += " ORDER BY id DESC LIMIT %s OFFSET %s"; params_page = params + [limit, offset]

    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    cur.execute(count_sql, params); total = cur.fetchone()["COUNT(*)"]
    cur.execute(sql, params_page); rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify({"items": serialize_rows(rows), "total": total, "limit": limit, "offset": offset})

@routes_bp.get("/<int:route_id>")
def get_route(route_id):
    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, courier_id, work_time, date, total_orders, total_distance, optimized_path, status FROM routes WHERE id=%s", (route_id,))
    row = cur.fetchone(); cur.close(); conn.close()
    if not row: abort(404)
    return jsonify(serialize_rows([row])[0])

@routes_bp.post("/")
def create_route():
    data = request.get_json(force=True) or {}
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute(
        "INSERT INTO routes (courier_id, work_time, date, total_orders, total_distance, optimized_path, status) VALUES (%s,%s,%s,%s,%s,%s,%s)",
        (data.get("courier_id"), data.get("work_time"), data.get("date"),
         data.get("total_orders", 0), data.get("total_distance"),
         data.get("optimized_path"), data.get("status","planned"))
    )
    conn.commit(); new_id = cur.lastrowid; cur.close(); conn.close()
    return jsonify({"id": new_id}), 201

@routes_bp.patch("/<int:route_id>")
def update_route(route_id):
    data = request.get_json(force=True) or {}
    fields, params = [], []
    for f in ("courier_id","work_time","date","total_orders","total_distance","optimized_path","status"):
        if f in data: fields.append(f"{f}=%s"); params.append(data[f])
    if not fields: abort(400)
    params.append(route_id)
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute(f"UPDATE routes SET {', '.join(fields)} WHERE id=%s", params)
    conn.commit(); cur.close(); conn.close()
    return jsonify({"ok": True})

@routes_bp.delete("/<int:route_id>")
def delete_route(route_id):
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("DELETE FROM routes WHERE id=%s", (route_id,))
    conn.commit(); cur.close(); conn.close()
    return "", 204
