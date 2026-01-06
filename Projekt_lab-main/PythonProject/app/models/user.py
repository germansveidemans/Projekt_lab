
from dataclasses import dataclass

@dataclass
class User:
    id: int | None
    username: str
    password: str
    role: str
    work_area_id: int | None
