
from dataclasses import dataclass
from datetime import datetime, date


@dataclass
class Order:
    id: int | None
    size: float
    weight: float
    client_id: int | None
    address: str | None
    expected_delivery_time: date | None
    route_status: str
    created_at: datetime | None
    updated_at: datetime | None
