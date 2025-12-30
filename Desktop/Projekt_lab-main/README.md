# Kurjeru maršrutu optimizācijas serviss

Web lietotne kurjeru, klientu, automašīnu, pasūtījumu un darba zonu pārvaldībai ar automātisku piegādes secības optimizāciju.

## Kas iekļauts
- Backend: Flask + MySQL; REST galapunkti lietotājiem, mašīnām, klientiem, pasūtījumiem, maršrutiem un darba zonām.
- Frontend: React + Vite (+ Leaflet); API adrese caur `VITE_API_URL` (noklusēti http://127.0.0.1:8001).
- Ģeodati: Nominatim ģeokodēšana (1 piepras./sek) ar kešu un determinētām rezerves koordinātēm; ceļu attālumi/laiki caur publisko OSRM, kļūmes gadījumā — Haversine.
- Darba zonas: `work_areas` ar taisnstūra robežām; pasūtījums piesaistās zonai pēc koordinātēm, kurjers — caur `work_area_id`.
- Sēklas dati: zonas 10–16, 10 kurjeri un mašīnas, 10 klienti, 20 pasūtījumi; administratora lietotāja nav.

## Kā darbojas optimizācija
- Galvenais algoritms `compute_nearest_neighbor` failā [PythonProject/app/services/OptimizationService.py](PythonProject/app/services/OptimizationService.py): ģeokodē punktus, izmēģina visus starta punktus, būvē maršrutu pēc tuvākā kaimiņa, izmantojot OSRM ceļu attālumus, un summē km + prognozēto laiku; ja OSRM nav pieejams, izmanto Haversine.
- `compute_with_osmnx` pāradresē uz iepriekšējo ar reāliem attālumiem (OSMnx ielādējas slinki, OSRM tiek lietots vienmēr).
- `two_opt` ir lokāls uzlabojums (Haversine); ģeokodēšanas un attālumu keši tīrāmi ar POST /optimize/clear-cache.

## Prasības
- Python 3.11+
- Node.js 18+ un npm
- MySQL instance ar projekta shēmu; internets Nominatim/OSRM sasniegšanai

## Backend uzstādīšana
1. Virtuālā vide (PowerShell):
```powershell
python -m venv .venv
\.venv\Scripts\Activate.ps1
```
2. Atkarības:
```powershell
pip install -r PythonProject/Requirements.txt
```
3. Iestatiet env mainīgos MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, SECRET_KEY (noklusējumi failā [PythonProject/app/config.py](PythonProject/app/config.py)).
4. Palaišana (API http://127.0.0.1:8001), ieejas punkts — [PythonProject/run.py](PythonProject/run.py):
```powershell
\.venv\Scripts\python.exe PythonProject/run.py
```

## Datu ielāde
- [seed/run_seed.py](seed/run_seed.py) nodzēš orders, routes, car, users, clients, work_areas un ielādē jaunus datus no [seed/reset_seed.sql](seed/reset_seed.sql).
- Palaišana no projekta saknes:
```powershell
\.venv\Scripts\python.exe seed/run_seed.py
```
- Rezultātā: zonas 10–16, 10 kurjeri/mašīnas, 10 klienti, 20 pasūtījumi (statuss “izskatīšanā”).

## Frontend palaišana
1. Atkarības:
```powershell
cd frontend
npm install
```
2. Ja vajag, uzstādiet `VITE_API_URL` (piem., `.env.local`); noklusējums http://127.0.0.1:8001.
3. Dev serveris:
```powershell
npm run dev
```
UI būs pieejams http://localhost:5173 un izmantos `VITE_API_URL`.

## Noderīgi galapunkti
- CRUD: /users, /cars, /clients, /orders, /work_areas, /routes
- POST /optimize/order-zones — nosaka pasūtījumu zonas (ģeokodēšana + bbox)
- POST /optimize/compute — aprēķina piegādes secību (nearest neighbor + OSRM)
- POST /optimize/assign — izveido maršrutu kurjeram ar optimizētu secību
- POST /optimize/clear-cache — notīra ģeokodēšanas un attālumu kešus

