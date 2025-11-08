from datetime import datetime, date
from decimal import Decimal

def _serialize_value(v):
    if isinstance(v, (datetime, date)):
        return v.isoformat()
    if isinstance(v, Decimal):
        return str(v)
    return v

def serialize_rows(rows):
    return [{k: _serialize_value(v) for k, v in row.items()} for row in rows]

def pagination_params(request, default_limit=20, max_limit=100):
    try:
        limit = min(int(request.args.get("limit", default_limit)), max_limit)
    except ValueError:
        limit = default_limit
    try:
        offset = int(request.args.get("offset", 0))
    except ValueError:
        offset = 0
    return limit, offset
