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

        return [
            Route(
                id=row["id"],
                courier_id=row["courier_id"],
                work_time=row["work_time"],
                date=row["date"],
                total_orders=row["total_orders"],
                total_distance=row["total_distance"],
                optimized_path=row["optimized_path"],
                status=row["status"],
            )
            for row in rows
        ]

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

        return Route(
            id=row["id"],
            courier_id=row["courier_id"],
            work_time=row["work_time"],
            date=row["date"],
            total_orders=row["total_orders"],
            total_distance=row["total_distance"],
            optimized_path=row["optimized_path"],
            status=row["status"],
        )

    @staticmethod
    def create_route(
        courier_id: int | None,
        work_time: int,
        date,
        total_orders: int,
        total_distance: int,
        optimized_path,
        status: str,
    ) -> Route:

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO routes (
                courier_id, work_time, date,
                total_orders, total_distance, optimized_path, status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            courier_id, work_time, date,
            total_orders, total_distance, optimized_path, status,
        ))
        conn.commit()
        route_id = cursor.lastrowid
        cursor.close()

        return RouteService.get_route(route_id)

    @staticmethod
    def update_route(
        route_id: int,
        courier_id: int | None,
        work_time: int,
        date,
        total_orders: int,
        total_distance: int,
        optimized_path,
        status: str,
    ) -> Route | None:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE routes
            SET courier_id=%s,
                work_time=%s,
                date=%s,
                total_orders=%s,
                total_distance=%s,
                optimized_path=%s,
                status=%s
            WHERE id=%s
        """, (
            courier_id, work_time, date,
            total_orders, total_distance, optimized_path, status,
            route_id,
        ))
        conn.commit()
        updated = cursor.rowcount
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
