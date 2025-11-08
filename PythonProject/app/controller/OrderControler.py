from flask import Blueprint, request, jsonify, abort
from app.config import get_db_connection
from app.utils.db_utils import serialize_rows, pagination_params

orders_bp = Blueprint("orders_bp", __name__)

@orders_bp.get("/")
def list_orders():
    limit, offset = pagination_params(request)
    route_id = request.args.get("route_id")
    client_id = request.args.get("client_id")
    status = request.args.get("status")
    date = request.args.get("date")

    sql = """
    SELECT o.id, o.route_id, o.sequence, o.size, o.weight, o.client_id, o.adress,
           o.expected_delivery_time, o.route_status, o.actual_delivery_time, o.created_at, o.updated_at
    FROM orders o
    LEFT JOIN routes r ON r.id = o.route_id
    """
    params = []
    if route_id: sql += " AND o.route_id=%s"; params.append(route_id)
    if client_id: sql += " AND o.client_id=%s"; params.append(client_id)
    if status: sql += " AND o.route_status=%s"; params.append(status)
    if date: sql += " AND r.date=%s"; params.append(date)

    count_sql = f"SELECT COUNT(*) FROM ({sql}) t"
    sql += " ORDER BY o.id DESC LIMIT %s OFFSET %s"; params_page = params + [limit, offset]

    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    cur.execute(count_sql, params); total = cur.fetchone()["COUNT(*)"]
    cur.execute(sql, params_page); rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify({"items": serialize_rows(rows), "total": total, "limit": limit, "offset": offset})

@orders_bp.get("/<int:order_id>")
def get_order(order_id):
    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    cur.execute("""
        SELECT id, route_id, sequence, size, weight, client_id, adress,
               expected_delivery_time, route_status, actual_delivery_time, created_at, updated_at
        FROM orders WHERE id=%s
    """, (order_id,))
    row = cur.fetchone(); cur.close(); conn.close()
    if not row: abort(404)
    return jsonify(serialize_rows([row])[0])

@orders_bp.post("/")
def create_order():
    data = request.get_json(force=True) or {}
    if not data.get("adress"): abort(400, description="adress ir obligāts")
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("""
        INSERT INTO orders (route_id, sequence, size, weight, client_id, adress,
                            expected_delivery_time, route_status)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """, (data.get("route_id"), data.get("sequence"), data.get("size"), data.get("weight"),
          data.get("client_id"), data["adress"], data.get("expected_delivery_time"),
          data.get("route_status","queued")))
    conn.commit(); new_id = cur.lastrowid; cur.close(); conn.close()
    return jsonify({"id": new_id}), 201

@orders_bp.patch("/<int:order_id>")
def update_order(order_id):
    data = request.get_json(force=True) or {}
    fields, params = [], []
    for f in ("route_id","sequence","size","weight","client_id","adress",
              "expected_delivery_time","route_status","actual_delivery_time"):
        if f in data: fields.append(f"{f}=%s"); params.append(data[f])
    if not fields: abort(400)
    params.append(order_id)
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute(f"UPDATE orders SET {', '.join(fields)} WHERE id=%s", params)
    conn.commit(); cur.close(); conn.close()
    return jsonify({"ok": True})

@orders_bp.post("/<int:order_id>/assign/<int:route_id>")
def assign_order(order_id, route_id):
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("UPDATE orders SET route_id=%s WHERE id=%s", (route_id, order_id))
    conn.commit(); cur.close(); conn.close()
    return jsonify({"ok": True})

@orders_bp.delete("/<int:order_id>")
def delete_order(order_id):
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("DELETE FROM orders WHERE id=%s", (order_id,))
    conn.commit(); cur.close(); conn.close()
    return "", 204
