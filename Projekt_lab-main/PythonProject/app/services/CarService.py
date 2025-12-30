from app.db import get_connection
from app.models.car import Car


class CarService:

    @staticmethod
    def list_cars() -> list[Car]:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT *
            FROM car 
            ORDER BY id
        """)
        rows = cursor.fetchall()
        cursor.close()

        return [
            Car(
                id=row["id"],
                size=row["size"],
                weight=row["weight"],
                vehicle_number=row["vehicle_number"],
                user_id=row["user_id"]
            )
            for row in rows
        ]

    @staticmethod
    def get_car(car_id: int) -> Car | None:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT *
            FROM car
            WHERE id = %s
        """, (car_id,))
        row = cursor.fetchone()
        cursor.close()

        if not row:
            return None

        return Car(**row)

    @staticmethod
    def get_car_by_user(user_id: int) -> Car | None:
        """Get car assigned to a specific user (courier)"""
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT *
            FROM car
            WHERE user_id = %s
        """, (user_id,))
        row = cursor.fetchone()
        cursor.close()

        if not row:
            return None

        return Car(**row)

    @staticmethod
    def create_car(size: int, weight: int, vehicle_number: str, user_id: int | None) -> Car:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO car (size, weight, vehicle_number, user_id)
            VALUES (%s, %s, %s, %s)
        """, (size, weight, vehicle_number, user_id))
        conn.commit()

        car_id = cursor.lastrowid
        cursor.close()

        return Car(
            id =car_id,
            size=size,
            weight=weight,
            vehicle_number=vehicle_number,
            user_id=user_id,
        )


    @staticmethod
    def update_car(id: int, size: int, weight: int, vehicle_number: str, user_id: int | None) -> Car | None:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE car 
            SET size=%s, weight=%s, vehicle_number=%s, user_id=%s
            WHERE id=%s
        """, (size, weight, vehicle_number, user_id, id))
        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            return None

        cursor.close()

        return Car(
            id =id,
            size=size,
            weight=weight,
            vehicle_number=vehicle_number,
            user_id=user_id,
        )

    @staticmethod
    def delete_car(car_id: int) -> bool:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM car WHERE id=%s", (car_id,))
        conn.commit()

        deleted = cursor.rowcount > 0
        cursor.close()
        return deleted
