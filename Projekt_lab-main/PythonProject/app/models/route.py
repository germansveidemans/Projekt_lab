from dataclasses import dataclass
from datetime import datetime

@dataclass
class Route:
    id: int | None
    courier_id: int | None
    total_orders: int
    total_distance: int
    estimated_time_minutes: int = 0
    optimized_path: list = None
    optimized_order_ids: list = None
    status: str = None
    created_at: datetime | None = None
    
    def __post_init__(self):
        if self.optimized_path is None:
            self.optimized_path = []
        if self.optimized_order_ids is None:
            self.optimized_order_ids = []
