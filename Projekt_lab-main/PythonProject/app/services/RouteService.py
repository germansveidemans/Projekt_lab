from app.db import get_connection
from app.models.route import Route


class RouteService:

    @staticmethod
    def list_routes() -> list[Route]:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT *
            FROM routes
            ORDER BY id
        """)
        rows = cursor.fetchall()
        cursor.close()
        import json
        result = []
        for row in rows:
            opt_path = row.get("optimized_path")
            opt_ids = row.get("optimized_order_ids")
            try:
                if isinstance(opt_path, str):
                    opt_path = json.loads(opt_path)
            except Exception:
                pass
            try:
                if isinstance(opt_ids, str):
                    opt_ids = json.loads(opt_ids)
            except Exception:
                pass

            result.append(Route(
                id=row["id"],
                courier_id=row["courier_id"],
                total_orders=row["total_orders"],
                total_distance=row["total_distance"],
                estimated_time_minutes=row.get("estimated_time_minutes", 0),
                optimized_path=opt_path,
                optimized_order_ids=opt_ids,
                status=row["status"],
                created_at=row.get("created_at"),
            ))

        return result

    @staticmethod
    def get_route(route_id: int) -> Route | None:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT *
            FROM routes
            WHERE id=%s
        """, (route_id,))
        row = cursor.fetchone()
        cursor.close()

        if not row:
            return None

        import json
        opt_path = row.get("optimized_path")
        opt_ids = row.get("optimized_order_ids")
        try:
            if isinstance(opt_path, str):
                opt_path = json.loads(opt_path)
        except Exception:
            pass
        try:
            if isinstance(opt_ids, str):
                opt_ids = json.loads(opt_ids)
        except Exception:
            pass

        return Route(
            id=row["id"],
            courier_id=row["courier_id"],
            total_orders=row["total_orders"],
            total_distance=row["total_distance"],
            estimated_time_minutes=row.get("estimated_time_minutes", 0),
            optimized_path=opt_path,
            optimized_order_ids=opt_ids,
            status=row["status"],
            created_at=row.get("created_at"),
        )

    @staticmethod
    def create_route(
        courier_id: int | None,
        total_orders: int,
        total_distance: int,
        optimized_path,
        optimized_order_ids,
        status: str,
        estimated_time_minutes: int = 0,
    ) -> Route:

        # ensure status is one of DB enum values to avoid 'Data truncated' errors
        allowed_statuses = {"atdots kurj\u0113ram", "izskat\u012b\u0161an\u0101"}
        # map common English values to DB enum (to be tolerant)
        status_map = {
            'planned': 'atdots kurj\u0113ram',
            'assigned': 'atdots kurj\u0113ram',
            'to_courier': 'atdots kurj\u0113ram',
            'in_review': 'izskat\u012b\u0161an\u0101',
            'review': 'izskat\u012b\u0161an\u0101',
            'pending': 'izskat\u012b\u0161an\u0101',
        }
        default_status = "atdots kurj\u0113ram"
        if isinstance(status, str):
            s_lower = status.strip().lower()
            if s_lower in status_map:
                print(f"[INFO] Mapping status '{status}' -> '{status_map[s_lower]}'")
                status = status_map[s_lower]
        if status not in allowed_statuses:
            print(f"[WARN] route status '{status}' is invalid, defaulting to '{default_status}'")
            status = default_status
        # normalize whitespace and unicode to avoid DB mismatch
        try:
            import unicodedata
            if isinstance(status, str):
                status = status.strip()
                status = unicodedata.normalize('NFC', status)
        except Exception:
            pass

        conn = get_connection()
        cursor = conn.cursor()
        import json
        params = (
            courier_id,
            total_orders, total_distance,
            estimated_time_minutes,
            json.dumps(optimized_path) if optimized_path else None,
            json.dumps(optimized_order_ids) if optimized_order_ids else None,
            status,
        )
        # show exact status bytes/codepoints for debugging ENUM mismatch
        try:
            s_repr = repr(status)
            s_codes = [ord(c) for c in status] if isinstance(status, str) else None
        except Exception:
            s_repr = str(status)
            s_codes = None
        print(f"[DEBUG] Inserting route with params: {params!r}")
        print(f"[DEBUG] status repr={s_repr}, codepoints={s_codes}")
        try:
            cursor.execute("""
                INSERT INTO routes (
                    courier_id,
                    total_orders, total_distance, estimated_time_minutes, optimized_path, optimized_order_ids, status, created_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
            """, params)
            conn.commit()
            route_id = cursor.lastrowid
        except Exception as e:
            # include useful debug info
            try:
                import mysql.connector
                if isinstance(e, mysql.connector.Error):
                    err_no = getattr(e, 'errno', None)
                    sqlstate = getattr(e, 'sqlstate', None)
                else:
                    err_no = None
                    sqlstate = None
            except Exception:
                err_no = None
                sqlstate = None
            err_msg = f"DB insert failed: {e} | errno={err_no} sqlstate={sqlstate} | params={params!r} | allowed_statuses={allowed_statuses}"
            print(f"[ERROR] {err_msg}")
            cursor.close()
            raise
        cursor.close()

        return RouteService.get_route(route_id)

    @staticmethod
    def update_route(
        route_id: int,
        courier_id: int | None,
        total_orders: int,
        total_distance: int,
        optimized_path,
        optimized_order_ids,
        status: str,
        estimated_time_minutes: int = 0,
    ) -> Route | None:
        # validate/status mapping for DB enum values
        allowed_statuses = {"atdots kurj\u0113ram", "izskat\u012b\u0161an\u0101"}
        status_map = {
            'planned': 'atdots kurj\u0113ram',
            'assigned': 'atdots kurj\u0113ram',
            'to_courier': 'atdots kurj\u0113ram',
            'in_review': 'izskat\u012b\u0161an\u0101',
            'review': 'izskat\u012b\u0161an\u0101',
            'pending': 'izskat\u012b\u0161an\u0101',
        }
        default_status = "atdots kurj\u0113ram"
        if isinstance(status, str):
            s_lower = status.strip().lower()
            if s_lower in status_map:
                print(f"[INFO] Mapping status '{status}' -> '{status_map[s_lower]}'")
                status = status_map[s_lower]
        if status not in allowed_statuses:
            print(f"[WARN] route status '{status}' is invalid, defaulting to '{default_status}'")
            status = default_status

        conn = get_connection()
        cursor = conn.cursor()
        import json
        params = (
            courier_id,
            total_orders, total_distance,
            estimated_time_minutes,
            json.dumps(optimized_path) if optimized_path else None,
            json.dumps(optimized_order_ids) if optimized_order_ids else None,
            status,
            route_id,
        )
        print(f"[DEBUG] Updating route id={route_id} with params: {params!r}")
        try:
            cursor.execute("""
                UPDATE routes
                SET courier_id=%s,
                    total_orders=%s,
                    total_distance=%s,
                    estimated_time_minutes=%s,
                    optimized_path=%s,
                    optimized_order_ids=%s,
                    status=%s
                WHERE id=%s
            """, params)
            conn.commit()
            updated = cursor.rowcount
        except Exception as e:
            err_msg = f"DB update failed: {e} | params={params!r} | allowed_statuses={allowed_statuses}"
            print(f"[ERROR] {err_msg}")
            cursor.close()
            raise
        cursor.close()

        if updated == 0:
            return None

        return RouteService.get_route(route_id)

    @staticmethod
    def delete_route(route_id: int) -> bool:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM routes WHERE id=%s", (route_id,))
        conn.commit()
        deleted = cursor.rowcount > 0
        cursor.close()
        return deleted
