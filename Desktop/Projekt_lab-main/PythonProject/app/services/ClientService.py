
from app.db import get_connection
from app.models.client import Client


class ClientService:

    @staticmethod
    def list_clients() -> list[Client]:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT *
            FROM clients 
            ORDER BY id
        """)
        clients = cursor.fetchall()
        cursor.close()

        return [
            Client(
                id=row["id"],
                name_surname=row["name_surname"],
                email=row["email"],
                address=row["address"],
                phone_number=row["phone_number"],
            )
            for row in clients
        ]

    @staticmethod
    def get_client(client_id: int) -> Client | None:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT *
            FROM clients
            WHERE id = %s
        """, (client_id,))
        row = cursor.fetchone()
        cursor.close()

        if not row:
            return None

        return Client(**row)

    @staticmethod
    def create_client(name_surname: str, email: str, address: str | None, phone_number: str | None) -> Client:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO clients (name_surname, email, address, phone_number)
            VALUES (%s, %s, %s, %s)
        """, (name_surname, email, address, phone_number))
        conn.commit()

        client_id = cursor.lastrowid
        cursor.close()

        return Client(
            id =client_id,
            name_surname=name_surname,
            email=email,
            address=address,
            phone_number=phone_number,
        )


    @staticmethod
    def update_client(id: int, name_surname: str, email: str, address: str | None, phone_number: str | None) -> Client | None:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE clients 
            SET name_surname=%s, email=%s, address=%s, phone_number=%s
            WHERE id=%s
        """, (name_surname, email, address, phone_number, id))
        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            return None

        cursor.close()

        return Client(
            id =id,
            name_surname=name_surname,
            email=email,
            address=address,
            phone_number=phone_number,
        )

    @staticmethod
    def delete_client(client_id: int) -> bool:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM clients WHERE id=%s", (client_id,))
        conn.commit()

        deleted = cursor.rowcount > 0
        cursor.close()
        return deleted
