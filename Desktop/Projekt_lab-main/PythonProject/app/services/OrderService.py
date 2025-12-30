from app.db import get_connection
from app.models.order import Order


class OrderService:

    @staticmethod
    def list_orders() -> list[Order]:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT *
            FROM orders
            ORDER BY id
        """)
        rows = cursor.fetchall()
        cursor.close()

        return [
            Order(
                id=row["id"],
                size=row["size"],
                weight=row["weight"],
                client_id=row["client_id"],
                address=row["adress"],
                expected_delivery_time=row["expected_delivery_time"],
                route_status=row["route_status"],
                actual_delivery_time=row["actual_delivery_time"],
                created_at=row["created_at"],
                updated_at=row["updated_at"],
            )
            for row in rows
        ]

    @staticmethod
    def get_order(order_id: int) -> Order | None:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT *
            FROM orders
            WHERE id = %s
        """, (order_id,))
        row = cursor.fetchone()
        cursor.close()

        if not row:
            return None

        return Order(
            id=row["id"],
            size=row["size"],
            weight=row["weight"],
            client_id=row["client_id"],
            address=row["adress"],
            expected_delivery_time=row["expected_delivery_time"],
            route_status=row["route_status"],
            actual_delivery_time=row["actual_delivery_time"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    @staticmethod
    def create_order(
        size: float,
        weight: float,
        client_id: int | None,
        address: str | None,
        expected_delivery_time,
        route_status: str,
        actual_delivery_time=None,
    ) -> Order:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO orders (
                size, weight, client_id, adress,
                expected_delivery_time, route_status, actual_delivery_time, created_at, updated_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            size, weight, client_id, address,
            expected_delivery_time, route_status, actual_delivery_time,
        ))
        conn.commit()
        order_id = cursor.lastrowid
        cursor.close()

        return OrderService.get_order(order_id)

    @staticmethod
    def update_order(
        order_id: int,
        size: float,
        weight: float,
        client_id: int | None,
        address: str | None,
        expected_delivery_time,
        route_status: str,
        actual_delivery_time=None,
    ) -> Order | None:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE orders
            SET size=%s,
                weight=%s,
                client_id=%s,
                adress=%s,
                expected_delivery_time=%s,
                route_status=%s,
                actual_delivery_time=%s,
                updated_at=NOW()
            WHERE id=%s
        """, (
            size, weight, client_id, address,
            expected_delivery_time, route_status, actual_delivery_time,
            order_id,
        ))
        conn.commit()
        updated = cursor.rowcount
        cursor.close()

        if updated == 0:
            return None

        return OrderService.get_order(order_id)

    @staticmethod
    def delete_order(order_id: int) -> bool:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM orders WHERE id=%s", (order_id,))
        conn.commit()
        deleted = cursor.rowcount > 0
        cursor.close()
        return deleted
