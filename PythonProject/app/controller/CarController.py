from flask import Blueprint, request, jsonify, abort
from app.config import get_db_connection
from app.utils.db_utils import serialize_rows, pagination_params


cars_bp = Blueprint("cars_bp", __name__)

def _plate_filter_sql():
    return " AND vehicle_number LIKE %s "

@cars_bp.get("/")
def list_cars():
    limit, offset = pagination_params(request)
    user_id = request.args.get("user_id")
    plate = request.args.get("vehicle_number")

    sql = "SELECT * FROM car "
    params = []
    if user_id:
        sql += " AND user_id=%s";
        params.append(user_id)
    if plate:
        sql += _plate_filter_sql();
        params.append(f"%{plate}%")
    count_sql = f"SELECT COUNT(*) FROM ({sql}) t"
    sql += " ORDER BY id DESC LIMIT %s OFFSET %s";
    params_page = params + [limit, offset]

    conn = get_db_connection();
    cur = conn.cursor(dictionary=True)
    cur.execute(count_sql, params);
    total = cur.fetchone()["COUNT(*)"]
    cur.execute(sql, params_page);
    rows = cur.fetchall()
    cur.close();
    conn.close()
    return jsonify({"items": serialize_rows(rows), "total": total, "limit": limit, "offset": offset})


@cars_bp.get("/<int:car_id>")
def get_car(car_id):
    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, size, weight, vehicle_number, user_id FROM car WHERE id=%s", (car_id,))
    row = cur.fetchone(); cur.close(); conn.close()
    if not row: abort(404)
    return jsonify(serialize_rows([row])[0])

@cars_bp.post("/")
def create_car():
    data = request.get_json(force=True) or {}
    if not data.get("user_id"): abort(400, description="user_id обязателен")
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("SELECT id FROM car WHERE user_id=%s", (data["user_id"],))
    if cur.fetchone():
        cur.close(); conn.close(); abort(409, description="kurjeram jau ir auto")
    cur.execute("INSERT INTO car (size, weight, vehicle_number, user_id) VALUES (%s,%s,%s,%s)",
                (data.get("size"), data.get("weight"), data.get("vehicle_number"), data["user_id"]))
    conn.commit(); new_id = cur.lastrowid; cur.close(); conn.close()
    return jsonify({"id": new_id}), 201


@cars_bp.patch("/<int:car_id>")
def update_car(car_id):
    data = request.get_json(force=True) or {}
    fields, params = [], []
    for f in ("size", "weight", "vehicle_number", "user_id"):
        if f in data:
            if f == "user_id":
                conn = get_db_connection(); cur = conn.cursor()
                cur.execute("SELECT id FROM car WHERE user_id=%s AND id<>%s", (data[f], car_id))
                exists = cur.fetchone(); cur.close(); conn.close()
                if exists: abort(409, description="jaunam lietotajam jau ir auto")
            fields.append(f"{f}=%s"); params.append(data[f])
    if not fields: abort(400)
    params.append(car_id)
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute(f"UPDATE car SET {', '.join(fields)} WHERE id=%s", params)
    conn.commit(); cur.close(); conn.close()
    return jsonify({"ok": True})

@cars_bp.delete("/<int:car_id>")
def delete_car(car_id):
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("DELETE FROM car WHERE id=%s", (car_id,))
    conn.commit(); cur.close(); conn.close()
    return "", 204
