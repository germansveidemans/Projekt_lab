from app.db import get_connection
from app.models.work_area import WorkArea


class WorkAreaService:

    @staticmethod
    def list_work_areas() -> list[WorkArea]:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name FROM work_areas ORDER BY id")
        rows = cursor.fetchall()
        cursor.close()

        return [WorkArea(id=row["id"], name=row["name"]) for row in rows]

    @staticmethod
    def get_work_area(work_area_id: int) -> WorkArea | None:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name FROM work_areas WHERE id=%s", (work_area_id,))
        row = cursor.fetchone()
        cursor.close()

        if not row:
            return None

        return WorkArea(id=row["id"], name=row["name"])

    @staticmethod
    def create_work_area(name: str) -> WorkArea:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO work_areas (name) VALUES (%s)", (name,))
        conn.commit()
        work_area_id = cursor.lastrowid
        cursor.close()
        return WorkArea(id=work_area_id, name=name)

    @staticmethod
    def update_work_area(work_area_id: int, name: str) -> WorkArea | None:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE work_areas SET name=%s WHERE id=%s", (name, work_area_id))
        conn.commit()
        updated = cursor.rowcount
        cursor.close()

        if updated == 0:
            return None

        return WorkArea(id=work_area_id, name=name)

    @staticmethod
    def delete_work_area(work_area_id: int) -> bool:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM work_areas WHERE id=%s", (work_area_id,))
        conn.commit()
        deleted = cursor.rowcount > 0
        cursor.close()
        return deleted
