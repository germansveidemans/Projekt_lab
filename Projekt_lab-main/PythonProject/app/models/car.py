
from dataclasses import dataclass

@dataclass
class Car:
    id: int | None
    size: int
    weight: int
    vehicle_number: str | None
    user_id: int | None

