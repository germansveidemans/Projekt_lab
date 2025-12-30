from dataclasses import dataclass

@dataclass
class WorkArea:
    id: int | None
    name: str
    # Zone boundaries (lat/lng) for service area
    min_lat: float | None = None  # Southwest corner latitude
    max_lat: float | None = None  # Northeast corner latitude
    min_lng: float | None = None  # Southwest corner longitude
    max_lng: float | None = None  # Northeast corner longitude
