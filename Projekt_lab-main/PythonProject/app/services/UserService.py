
from app.db import get_connection
from app.models.user import User


class UserService:

    @staticmethod
    def list_users() -> list[User]:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, username, password, role, work_area_id 
            FROM users 
            ORDER BY id
        """)
        rows = cursor.fetchall()
        cursor.close()

        return [
            User(
                id=row["id"],
                username=row["username"],
                password=row["password"],
                role=row["role"],
                work_area_id=row["work_area_id"]
            )
            for row in rows
        ]

    @staticmethod
    def get_user(user_id: int) -> User | None:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, username, password, role, work_area_id
            FROM users 
            WHERE id = %s
        """, (user_id,))
        row = cursor.fetchone()
        cursor.close()

        if not row:
            return None

        return User(**row)

    @staticmethod
    def create_user(username: str, password: str, role: str, work_area_id: int | None):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (username, password, role, work_area_id)
            VALUES (%s, %s, %s, %s)
        """, (username, password, role, work_area_id))
        conn.commit()

        user_id = cursor.lastrowid
        cursor.close()

        return User(
            id=user_id,
            username=username,
            password=password,
            role=role,
            work_area_id=work_area_id
        )

    @staticmethod
    def update_user(user_id: int, username: str, password: str, role: str, work_area_id: int | None) -> User | None:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users 
            SET username=%s, password=%s, role=%s, work_area_id=%s
            WHERE id=%s
        """, (username, password, role, work_area_id, user_id))
        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            return None

        cursor.close()

        return User(
            id=user_id,
            username=username,
            password=password,
            role=role,
            work_area_id=work_area_id
        )

    @staticmethod
    def delete_user(user_id: int) -> bool:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id=%s", (user_id,))
        conn.commit()

        deleted = cursor.rowcount > 0
        cursor.close()
        return deleted
