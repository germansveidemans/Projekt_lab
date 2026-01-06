
from dataclasses import dataclass
from datetime import datetime

@dataclass
class CourierStatistics:
    id: int | None
    courier_id: int
    total_routes: int = 0
    completed_routes: int = 0
    total_distance_km: float = 0.0
    total_orders_delivered: int = 0
    last_updated: datetime | None = None
