from app.db import get_connection
from app.models.work_area import WorkArea


class WorkAreaService:

    @staticmethod
    def list_work_areas() -> list[WorkArea]:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, min_lat, max_lat, min_lng, max_lng FROM work_areas ORDER BY id")
        rows = cursor.fetchall()
        cursor.close()

        return [WorkArea(
            id=row["id"], 
            name=row["name"],
            min_lat=row.get("min_lat"),
            max_lat=row.get("max_lat"),
            min_lng=row.get("min_lng"),
            max_lng=row.get("max_lng")
        ) for row in rows]

    @staticmethod
    def get_work_area(work_area_id: int) -> WorkArea | None:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, min_lat, max_lat, min_lng, max_lng FROM work_areas WHERE id=%s", (work_area_id,))
        row = cursor.fetchone()
        cursor.close()

        if not row:
            return None

        return WorkArea(
            id=row["id"], 
            name=row["name"],
            min_lat=row.get("min_lat"),
            max_lat=row.get("max_lat"),
            min_lng=row.get("min_lng"),
            max_lng=row.get("max_lng")
        )

    @staticmethod
    def create_work_area(name: str, min_lat: float = None, max_lat: float = None, 
                        min_lng: float = None, max_lng: float = None) -> WorkArea:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        # check uniqueness
        cursor.execute("SELECT id FROM work_areas WHERE name=%s", (name,))
        existing = cursor.fetchone()
        if existing:
            cursor.close()
            raise ValueError('Work area with this name already exists')

        # insert
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO work_areas (name, min_lat, max_lat, min_lng, max_lng) VALUES (%s, %s, %s, %s, %s)",
            (name, min_lat, max_lat, min_lng, max_lng)
        )
        conn.commit()
        work_area_id = cursor.lastrowid
        cursor.close()
        return WorkArea(id=work_area_id, name=name, min_lat=min_lat, max_lat=max_lat, min_lng=min_lng, max_lng=max_lng)

    @staticmethod
    def update_work_area(work_area_id: int, name: str = None, min_lat: float = None, 
                        max_lat: float = None, min_lng: float = None, max_lng: float = None) -> WorkArea | None:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Build dynamic update query
        updates = []
        params = []
        
        if name is not None:
            updates.append("name=%s")
            params.append(name)
        if min_lat is not None:
            updates.append("min_lat=%s")
            params.append(min_lat)
        if max_lat is not None:
            updates.append("max_lat=%s")
            params.append(max_lat)
        if min_lng is not None:
            updates.append("min_lng=%s")
            params.append(min_lng)
        if max_lng is not None:
            updates.append("max_lng=%s")
            params.append(max_lng)
        
        if not updates:
            cursor.close()
            return WorkArea(id=work_area_id, name=name)
        
        params.append(work_area_id)
        query = f"UPDATE work_areas SET {', '.join(updates)} WHERE id=%s"
        cursor.execute(query, params)
        conn.commit()
        updated = cursor.rowcount
        cursor.close()

        if updated == 0:
            return None

        return WorkArea(id=work_area_id, name=name, min_lat=min_lat, max_lat=max_lat, min_lng=min_lng, max_lng=max_lng)

    @staticmethod
    def delete_work_area(work_area_id: int) -> bool:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM work_areas WHERE id=%s", (work_area_id,))
        conn.commit()
        deleted = cursor.rowcount > 0
        cursor.close()
        return deleted
