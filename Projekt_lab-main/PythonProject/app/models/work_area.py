
from dataclasses import dataclass

@dataclass
class WorkArea:
    id: int | None
    name: str
    min_lat: float | None = None
    max_lat: float | None = None
    min_lng: float | None = None
    max_lng: float | None = None
