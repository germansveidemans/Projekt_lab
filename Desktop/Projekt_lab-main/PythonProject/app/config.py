

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MYSQL_HOST = os.getenv("MYSQL_HOST","projlab.mysql.database.azure.com")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER","Veideman")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD","AsdfgQwert!2345")
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE","proj_lab")
    SECRET_KEY = os.getenv("SECRET_KEY","please_change_me_in_production")

