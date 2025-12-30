from dataclasses import dataclass
from datetime import datetime


@dataclass
class Order:
    id: int | None
    size: float
    weight: float
    client_id: int | None
    address: str | None
    expected_delivery_time: datetime
    route_status: str
    actual_delivery_time: datetime
    created_at: datetime
    updated_at: datetime
