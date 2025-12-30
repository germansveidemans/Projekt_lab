import mysql.connector, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
PY_APP = ROOT / "PythonProject"
sys.path.append(str(PY_APP))

from app.config import Config

SQL_PATH = pathlib.Path(__file__).parent / "reset_seed.sql"
raw = SQL_PATH.read_text(encoding="utf-8")
# strip comments and split by semicolon safely
statements = []
current = []
for line in raw.splitlines():
    striped = line.strip()
    if not striped or striped.startswith('--'):
        continue
    current.append(line)
    if ';' in line:
        stmt = '\n'.join(current).split(';')[0].strip()
        if stmt:
            statements.append(stmt)
        current = []

cfg = Config

conn = mysql.connector.connect(
    host=cfg.MYSQL_HOST,
    user=cfg.MYSQL_USER,
    password=cfg.MYSQL_PASSWORD,
    database=cfg.MYSQL_DATABASE,
)
cur = conn.cursor()
for stmt in statements:
    cur.execute(stmt)
conn.commit()
cur.close()
conn.close()
print("Seed completed")
