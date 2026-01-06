
from mysql.connector import pooling
from flask import g

_pool = None

def init_pool(app):
    global _pool
    _pool = pooling.MySQLConnectionPool(
        pool_name='dbpool',
        pool_size=5,
        host = app.config['MYSQL_HOST'],
        port = app.config['MYSQL_PORT'],
        user = app.config['MYSQL_USER'],
        password = app.config['MYSQL_PASSWORD'],
        database = app.config['MYSQL_DATABASE'],
    )


def get_connection():
    if"db_conn" not in g:
        g.db_conn = _pool.get_connection()

    return g.db_conn

def close_connection(e=None):
    conn = g.pop("db_conn", None)
    if conn is not None:
        conn.close()
