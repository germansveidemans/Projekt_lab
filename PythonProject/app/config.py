import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

load_dotenv()

db_config = {
    "host": os.getenv("DB_HOST", "projlab.mysql.database.azure.com"),
    "user": os.getenv("DB_USER", "Veideman"),
    "password": os.getenv("DB_PASSWORD", "AsdfgQwert!2345"),
    "database": os.getenv("DB_NAME", "proj_lab"),
    "port": int(os.getenv("DB_PORT", 3306)),
}

def get_db_connection():
    return mysql.connector.connect(**db_config)
