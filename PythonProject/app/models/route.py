from dataclasses import dataclass
from datetime import datetime

@dataclass
class Route:
    id: int | None
    courier_id: int | None
    work_time: int
    date: datetime
    total_orders: int
    total_distance: int
    optimized_path: list
    status: str
