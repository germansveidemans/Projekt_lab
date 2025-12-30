from dataclasses import dataclass

@dataclass
class Client:
    id: int | None
    name_surname: str
    email: str
    address: str | None
    phone_number: str | None
