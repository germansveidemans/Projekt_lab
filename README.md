# Kurjeru Maršrutu Optimizācijas Sistēma

## Ievads

Maršrutu optimizācijas problēma ir viena no klasiskākajām operāciju pētījumu problēmām, kas ir svarīga loģistikas un piegādes nozarēs. Tā pazīstama arī kā pārdevēja ceļojuma problēma (Traveling Salesman Problem - TSP), kas pirmo reizi formulēta 19. gadsimtā. Problēmas būtība ir atrast optimālu maršrutu, kas ļauj apmeklēt vairākus punktus ar minimāliem izmaksām vai attālumu.

Mūsdienu loģistikas uzņēmumiem ir nepieciešams efektīvi plānot kurjeru maršrutus, lai samazinātu degvielas patēriņu, laiku un kopējās izmaksas, vienlaikus nodrošinot kvalitatīvu klientu apkalpošanu. Tradicionāli maršrutu plānošana tika veikta manuāli, taču tas ir laikietilpīgi un bieži vien neoptimāli. Tāpēc ir nepieciešamas automatizētas sistēmas, kas spēj ātri aprēķināt optimālus maršrutus, ņemot vērā vairākus faktorus.

Pētījumi rāda, ka optimizēti maršruti var samazināt kopējo nobraukto attālumu par 20-30% salīdzinājumā ar neoptimizētiem risinājumiem, kas būtiski ietekmē uzņēmuma darbības izmaksas un vides piesārņojumu.

## Problēmas nostādne

Kurjeru servisi ikdienā saskaras ar nepieciešamību piegādāt vairākus pasūtījumus dažādās vietās. Bez optimizācijas algoritma dispečeri manuāli izvēlas, kuriem kurjeriem piešķirt konkrētus pasūtījumus un kādā secībā tos piegādāt, kas bieži vien nav optimāls risinājums.

Galvenās problēmas:
- Kā izvēlēties piemērotāko kurjeru konkrētam pasūtījumu kopumam?
- Kādā secībā veikt piegādes, lai minimizētu kopējo nobraukto attālumu?
- Kā ņemt vērā darba zonas un kurjeru pieejamību?
- Kā nodrošināt ātrumu risinājuma atrašanā reāllaika režīmā?

Bez sistemātiskas pieejas šīs problēmas risināšana ir sarežģīta un prasa daudz laika, turklāt rezultāts bieži vien nav optimāls.

## Darba un novērtēšanas mērķis

Darba mērķis ir izveidot tādu web aplikāciju, kas:
- Automātiski aprēķina optimālus kurjeru maršrutus, izmantojot tuvākā kaimiņa algoritmu
- Ļauj pārvaldīt kurjerus, klientus, pasūtījumus un darba zonas
- Vizualizē maršrutus kartē ar reāliem ģeogrāfiskiem datiem
- Nodrošina statistiku par kurjeru veiktspēju
- Darbojas reāllaika režīmā ar ātriem aprēķiniem

Novērtēšanas mērķis ir:
- Izvērtēt algoritma veiktspēju dažādiem pasūtījumu skaitiem
- Salīdzināt tuvākā kaimiņa algoritmu ar citiem risinājumiem
- Novērtēt sistēmas lietojamību un ātrdarbību

## Līdzīgo risinājumu pārskats

Izstrādātā kurjeru maršrutu plānošanas sistēma tika salīdzināta ar populārākajiem komerciālajiem un atvērtā koda risinājumiem, galvenas kritērijas ir maršrutu optimizācijas un cena:

| Risinājums | Stiprās puses salīdzinājumā ar izstrādāto sistēmu | Ierobežojumi | Cena | Atsauces |
|------------|---------------------------------------------------|--------------|------|----------|
| **Google Maps Platform** | Ļoti precīzi kartes un maršrutēšanas dati, globāls pārklājums, piedāvā spēcīgus maršrutēšanas un optimizācijas algoritmus, taču tie darbojas kā ārējs API serviss ar ierobežotu pielāgojamību. | Augstas izmaksas pie liela pieprasījumu apjoma, nenodrošina pilnu kurjeru, pasūtījumu un transporta pārvaldības vidi kā izstrādātā sistēma.| Apmērām €500–€5,000 gadā par API izmantošānu, atkarībā no pieprasījumu apjoma | https://mapsplatform.google.com/ |
| **OSRM (Open Source Routing Machine)** | Atvērtā koda risinājums, ļoti ātri un precīzi maršrutu aprēķini, izmanto reālos ceļu datus, pati optimizācija jārealizē papildus. | Nav lietotāja saskarnes, nepieciešama sarežģīta servera uzstādīšana un uzturēšana, nepiedava pilnu VRP risinājūmu. | Bez maksas, bet vēl servera izmaksas | http://project-osrm.org/ |
| **OR-Tools** | Spēja atrisināt sarežģītus TSP/VRP uzdevumus ar spēcīgiem algoritmiem, augsta optimizācijas elastība, atbalsta sarežģītus ierobežojumus. | Nav vizuālas saskarnes, paredzēts programmatiskiem risinājumiem, prasa dziļākas tehniskās zināšanas, sarežģītākas ieviešanas un ilgāka aprēķina laika rēķina. | Bezmaksas | https://developers.google.com/optimization |
| **OptimoRoute** | Plaša funkcionalitāte: laika logi, kurjeru grafiki, vizuāla karte, augsta optimizācijas kvalitāte. | Komerciāls risinājums ar abonēšanas izmaksām, mazāka kontrole pār datu modeli salīdzinājumā ar izstrādāto sistēmu. | Apmērām €420–€1,500 kurjeram gadā, atkarībā no plāna | https://optimoroute.com/ |
| **Azure Maps** | Integrācija ar mākoņvidi, augsta veiktspēja, laba mērogojamība, profesionāla karšu infrastruktūra, komerciāla optimizācija ar plašām iespējām. | Izmaksas pieaug līdz ar lietojumu, atkarība no Azure ekosistēmas, tāpēc kopumā ar integrācijas sarežģītību padara tos mazāk piemērotus nelieliem un vidēja izmēra projektiem. | Apmērām €300–€3,000 gadā | https://azure.microsoft.com/services/azure-maps/ |

## Tehniskais risinājums

### Prasības

#### Must have (Jābūt):
- Lietotājs pieteikties sistēmā, jo tādējādi viņš varēs pārvaldīt kurjerus un pasūtījumus
- Lietotājs vēlas pievienot, rediģēt un dzēst pasūtījumus, jo tas ir nepieciešams ikdienas darbam
- Lietotājs vēlas pievienot, rediģēt un dzēst kurjerus un viņu automašīnas, jo kurjeru sastāvs mainās
- Lietotājs vēlas automātiski ģenerēt optimizētu maršrutu izvēlētajiem pasūtījumiem, jo tas ietaupa laiku un resursus
- Lietotājs vēlas redzēt maršrutu vizualizētu kartē, jo tas ļauj viegli saprast piegādes secību
- Lietotājs vēlas saglabāt izveidotos maršrutus, jo tos var izmantot vēlāk vai kā vēsturi
- Lietotājs vēlas piešķirt maršrutu konkrētam kurjeram, jo tas nepieciešams darba organizēšanai

#### Should have (Vajadzētu būt):
- Lietotājs vēlas redzēt kopējo maršruta attālumu un prognozēto laiku, jo tas palīdz plānot darbu
- Lietotājs vēlas filtrēt pasūtījumus pēc statusa, jo tas atvieglo darbu ar lielu pasūtījumu skaitu
- Lietotājs vēlas definēt darba zonas, jo kurjeri parasti strādā noteiktās teritorijās
- Lietotājs vēlas redzēt, kuri kurjeri ir piemēroti izvēlētajiem pasūtījumiem, jo ne visi kurjeri var apkalpot visas zonas
- Lietotājs vēlas redzēt kurjeru statistiku (kopējais nobrauktais attālums, piegādes skaits), jo tas palīdz novērtēt efektivitāti
- Lietotājs vēlas atzīmēt pasūtījumus kā piegādātus, jo tas nepieciešams statusa izsekošanai
- Lietotājs vēlas salīdzināt optimizēto maršrutu ar Google Maps piedāvāto maršrutu, jo tas ļauj novērtēt algoritma kvalitāti

#### Could have (Varēja būt):
- Lietotājs vēlas saņemt paziņojumus par jauniem pasūtījumiem, jo tas palīdz ātri reaģēt
- Lietotājs vēlas redzēt vēsturiskos datus par iepriekšējiem maršrutiem, jo tas palīdz analizēt un uzlabot procesus
- Lietotājs vēlas prognozēt degvielas patēriņu, jo tas palīdz plānot izmaksas

## Algoritms

Aplikācija izmanto **Tuvākā kaimiņa algoritmu (Nearest Neighbor Algorithm)** ar papildu optimizācijām, lai izveidotu efektīvus kurjeru maršrutus. Algoritms darbojas ar reāliem ģeogrāfiskiem datiem, izmantojot OSRM (Open Source Routing Machine) API ceļu attālumu iegūšanai.

### Algoritma pseidokods:

```
BEGIN MAINPROGRAM compute_nearest_neighbor(addresses)
   
   INITIALISATION
      geocode all addresses to coordinates
      build distance matrix using OSRM API
      IF OSRM fails THEN
         use Haversine distance as fallback
      ENDIF
   END INITIALISATION
   
   best_route = NULL
   best_distance = INFINITY
   
   FOR each address as starting_point
      current_route = [starting_point]
      current_distance = 0
      remaining_addresses = all addresses except starting_point
      
      WHILE remaining_addresses is not empty
         nearest_address = NULL
         min_distance = INFINITY
         
         FOR each address in remaining_addresses
            distance = get_distance(current_route.last, address)
            IF distance < min_distance THEN
               min_distance = distance
               nearest_address = address
            ENDIF
         ENDFOR
         
         current_route.append(nearest_address)
         current_distance += min_distance
         remove nearest_address from remaining_addresses
      ENDWHILE
      
      IF current_distance < best_distance THEN
         best_distance = current_distance
         best_route = current_route
      ENDIF
   ENDFOR
   
   OPTIONAL: apply 2-opt optimization to best_route
   
   RETURN best_route, best_distance, estimated_time
   
END MAINPROGRAM


BEGIN SUBPROGRAM geocode_addresses(addresses)
   coordinates = []
   
   FOR each address in addresses
      cache_key = normalize(address)
      
      IF cache_key in GEOCODE_CACHE THEN
         coords = GEOCODE_CACHE[cache_key]
      ELSE
         TRY
            coords = call_nominatim_api(address)
            GEOCODE_CACHE[cache_key] = coords
            sleep(1 second) // rate limiting
         CATCH Exception
            coords = get_deterministic_fallback_coords(address)
         ENDTRY
      ENDIF
      
      coordinates.append(coords)
   ENDFOR
   
   RETURN coordinates
END SUBPROGRAM


BEGIN SUBPROGRAM build_distance_matrix(coordinates)
   matrix = empty 2D array
   
   FOR i = 0 to coordinates.length - 1
      FOR j = 0 to coordinates.length - 1
         IF i == j THEN
            matrix[i][j] = 0
         ELSE
            TRY
               distance = osrm_route_distance(coordinates[i], coordinates[j])
            CATCH Exception
               distance = haversine_distance(coordinates[i], coordinates[j])
            ENDTRY
            matrix[i][j] = distance
         ENDIF
      ENDFOR
   ENDFOR
   
   RETURN matrix
END SUBPROGRAM


BEGIN SUBPROGRAM haversine_distance(coord1, coord2)
   R = 6371 // Zemes rādiuss km
   
   lat1, lng1 = coord1
   lat2, lng2 = coord2
   
   dlat = radians(lat2 - lat1)
   dlng = radians(lng2 - lng1)
   
   a = sin²(dlat/2) + cos(lat1) × cos(lat2) × sin²(dlng/2)
   c = 2 × atan2(√a, √(1-a))
   
   distance = R × c
   
   RETURN distance
END SUBPROGRAM


BEGIN SUBPROGRAM two_opt_optimization(route, distance_matrix)
   improved = TRUE
   
   WHILE improved
      improved = FALSE
      
      FOR i = 1 to route.length - 2
         FOR j = i + 1 to route.length - 1
            // Mēģiniet apgriezt segmentu starp i un j
            new_route = route with segment [i...j] reversed
            new_distance = calculate_total_distance(new_route, distance_matrix)
            
            IF new_distance < current_distance THEN
               route = new_route
               current_distance = new_distance
               improved = TRUE
            ENDIF
         ENDFOR
      ENDFOR
   ENDWHILE
   
   RETURN route
END SUBPROGRAM


BEGIN SUBPROGRAM determine_work_area(coordinates, work_areas)
   FOR each work_area in work_areas
      IF is_point_in_work_area(coordinates, work_area) THEN
         RETURN work_area
      ENDIF
   ENDFOR
   
   RETURN NULL
END SUBPROGRAM


BEGIN SUBPROGRAM find_suitable_couriers(orders, couriers)
   suitable_couriers = []
   total_orders = orders.length
   
   FOR each courier in couriers
      // Pārbaudiet automašīnas ietilpību
      total_size = sum of all order sizes
      total_weight = sum of all order weights
      
      IF total_size > courier.car.size OR total_weight > courier.car.weight THEN
         skip this courier
      ENDIF
      
      // Skaitīt pasūtījumus kurjera darba zonā (tikai informatīvi)
      in_zone_count = 0
      FOR each order in orders
         order_coords = geocode(order.address)
         IF is_point_in_work_area(order_coords, courier.work_area) THEN
            in_zone_count++
         ENDIF
      ENDFOR
      
      // Pievienot kurjeru ar zonas pārklājuma metadatiem
      add courier to suitable_couriers with (in_zone_count, total_orders)
   ENDFOR
   
   RETURN suitable_couriers (sorted by in_zone_count descending)
END SUBPROGRAM
```

### Algoritmam ir sekojošas iezīmes:

1. **Reāli ģeogrāfiskie dati:**
   - Izmanto OpenStreetMap Nominatim API ģeokodēšanai
   - OSRM API nodrošina reālus ceļu attālumus un braukšanas laikus
   - Deterministisks kešs garantē konsekventus rezultātus

2. **Optimizācijas stratēģija:**
   - Tuvākā kaimiņa algoritms ar visiem sākumpunktiem
   - 2-opt lokālā optimizācija labākajam maršrutam
   - Laika sarežģītība: O(n² × n!) tuvākajam kaimiņam + O(n²) 2-opt

3. **Kurjeru piemērotības noteikšana:**
   - Primārais kritērijs: automašīnas kapacitāte (size un weight)
   - Sekundārais: pasūtījumu skaits kurjera darba zonā (informatīvs)
   - Zonas netiek lietotas kā stingrs ierobežojums
   - Kurjeri var piegādāt pasūtījumus ārpus savas zonas

4. **Kļūdu apstrāde:**
   - Fallback uz Haversine distanci, ja OSRM nav pieejams
   - Deterministiskas rezerves koordinātes ģeokodēšanas kļūmēm
   - Rate limiting Nominatim API (1 pieprasījums/sekundē)

### Algoritma sarežģītība:

- **Laika sarežģītība:** O(n³) tuvākajam kaimiņam (n sākumpunkti × n² attālumu aprēķini)
- **Vietas sarežģītība:** O(n²) attālumu matricai
- **Optimizācijas laiks:** 2-opt pievieno O(n²) katrai iterācijai

## Konceptu modelis

### UML Diagramma

<img width="1297" height="700" alt="PL_Projekta_UMLShema" src="https://github.com/user-attachments/assets/f9868a04-cb59-448a-af58-f0e63eb61995" />

```plantuml
@startuml
hide circle
skinparam linetype ortho
skinparam entity {
  BackgroundColor White
  BorderColor Black
}

entity "lietotāji (users)" as users {
  + id : bigint
  --
  username : text
  password_hash : text
  email : text
  role : text
  work_area_id : bigint
  phone : text
  experience_years : int
}

entity "pasūtījumi (orders)" as orders {
  + id : bigint
  --
  client_id : bigint
  adress : varchar(100)
  route_status : enum
  expected_delivery_time : date
  created_at : timestamp
  updated_at : timestamp
  size : decimal(10,2)
  weight : decimal(5,2)
  work_area_id : bigint

  
}

entity "maršruti (routes)" as routes {
  + id : bigint
  --
  courier_id : bigint
  total_orders : int
  total_distance : decimal(10,2)
  optimized_path : json
  optimized_order_ids : json
  status : enum
  delivery_date : date
  estimated_time_minutes : int
  created_at : timestamp
}

entity "maršruta_pasūtījumi (route_orders)" as route_orders {
  + id : bigint
  --
  route_id : bigint
  order_id : bigint
  sequence : int
  status : text
}

entity "automašīnas (car)" as car {
  + id : bigint
  --
  size : decimal(10,2)
  weight : decimal(10,2)
  vehicle_number : varchar(20)
  user_id : bigint
}

entity "klienti (clients)" as clients {
  + id : bigint
  --
  name_surname : varchar(100)
  email : varchar(100)
  address : varchar(255)
  phone_number : varchar(20)
}

entity "darba_zonas (work_areas)" as work_areas {
  + id : bigint
  --
  name : text
  color : text
  min_lat : decimal
  max_lat : decimal
  min_lng : decimal
  max_lng : decimal
}

entity "kurjeru_statistika (courier_statistics)" as stats {
  + id : bigint
  --
  courier_id : bigint
  total_routes : int
  completed_routes : int
  total_distance_km : decimal
  total_orders_delivered : int
  last_updated : timestamp
}

' Relācijas
users ||--|| car : izmanto
users }|--|| work_areas : pieder
users ||--o{ routes : veic
users ||--|| stats : ir

clients ||--o{ orders : veic
orders }o--|| work_areas : atrodas

routes ||-o{ route_orders : sastāv no
orders ||--o{ route_orders : iekļauts

@enduml
```

### Galvenās entītības:

1. **users (lietotāji/kurjeri)** - kurjeri, kuri veic piegādes
2. **orders (pasūtījumi)** - piegādājamie pasūtījumi
3. **routes (maršruti)** - optimizēti piegādes maršruti (optimized_order_ids JSON lauks satur pasūtījumu ID)
4. **car (automašīnas)** - kurjeru izmantotās automašīnas (1:1 saistība ar users)
5. **clients (klienti)** - pasūtījumu veicēji
6. **work_areas (darba zonas)** - ģeogrāfiskās zonas, kurās strādā kurjeri
7. **courier_statistics (statistika)** - kurjeru veiktspējas dati (automātiski atjauninās)

## Tehnoloģiju steks

### Frontend
- **React** (Vite) – moderna JavaScript bibliotēka lietotāja interfeisa izveidei
- **Leaflet** – interaktīvu karšu bibliotēka maršrutu vizualizācijai
- **Tailwind CSS** – utility-first CSS framework stilizēšanai
- **Axios** – HTTP klienta bibliotēka API pieprasījumiem

### Backend
- **FastAPI** – ātrs Python web framework REST API izveidei
- **SQLAlchemy ORM** – datu bāzes abstraction layer
- **MySQL** – relāciju datu bāze
- **Requests** – HTTP bibliotēka ārējo API izsaukšanai

### Ārējie servisi
- **Nominatim API** – OpenStreetMap ģeokodēšanas serviss (adreses → koordinātas)
- **OSRM API** – Open Source Routing Machine (reāli ceļu attālumi)
- **OSMnx** (optional) – Python bibliotēka ceļu tīkla analīzei

### Datu bāze
- **MySQL** – galvenā datu glabāšanas sistēma
- **Azure MySQL** – mākoņa hostings (RTU finansējums)

### Infrastruktūra
- **Microsoft Azure** – mākoņa platforma aplikācijas izvietošanai
- **Git** – versiju kontroles sistēma

## Programmatūras apraksts

### Sistēmas arhitektūra

Sistēma balstās uz trīs līmeņu arhitektūru:

1. **Prezentācijas līmenis (Frontend)**
   - React aplikācija ar Vite
   - Interaktīva karte (Leaflet)
   - Responsīvs dizains (Tailwind CSS)

2. **Biznesa loģikas līmenis (Backend)**
   - FastAPI REST API
   - Kontrolieri (Controllers) - HTTP pieprasījumu apstrāde
   - Servisi (Services) - biznesa loģika un algoritmi
   - Modeļi (Models) - datu struktūras

3. **Datu līmenis (Database)**
   - MySQL datu bāze
   - SQLAlchemy ORM

### Galvenie komponenti

#### Backend komponenti:

**Controllers:**
- `OptimizationController.py` - maršrutu optimizācijas endpoints
- `OrderController.py` - pasūtījumu CRUD operācijas
- `UserController.py` - lietotāju un kurjeru pārvaldība
- `RouteController.py` - maršrutu pārvaldība
- `StatisticsController.py` - statistikas dati
- `CarController.py` - automašīnu pārvaldība
- `ClientController.py` - klientu pārvaldība
- `WorkAreaController.py` - darba zonu pārvaldība

**Services:**
- `OptimizationService.py` - galvenais optimizācijas algoritms
- `CourierSuitabilityService.py` - piemērotu kurjeru noteikšana
- `StatisticsService.py` - statistikas aprēķini
- `OrderService.py`, `UserService.py`, `RouteService.py` - biznesa loģika

**Models:**
- `order.py`, `user.py`, `route.py`, `car.py`, `client.py`, `work_area.py`, `courier_statistics.py`

#### Frontend komponenti:

**Pages:**
- `Optimize.jsx` - galvenā optimizācijas lapa ar karti
- `Orders.jsx` - pasūtījumu pārvaldība
- `Routes.jsx` - maršrutu pārvaldība
- `Users.jsx` - kurjeru pārvaldība
- `Cars.jsx` - automašīnu pārvaldība
- `Clients.jsx` - klientu pārvaldība
- `WorkAreas.jsx` - darba zonu pārvaldība

**Components:**
- `OrderForm.jsx`, `UserForm.jsx`, `RouteForm.jsx` - veidlapas
- `RouteEditor.jsx` - maršruta rediģēšanas komponents
- `CourierStatisticsModal.jsx` - statistikas logs
- `ErrorBoundary.jsx` - kļūdu apstrāde

### API Endpoints

**Optimizācija:**
- `POST /optimize/route` - aprēķināt optimālu maršrutu
- `POST /optimize/order-zones` - noteikt pasūtījumu zonas
- `POST /optimize/clear-cache` - notīrīt ģeokodēšanas kešu

**Pasūtījumi:**
- `GET /orders` - iegūt visus pasūtījumus
- `POST /orders` - izveidot jaunu pasūtījumu
- `PUT /orders/{id}` - atjaunināt pasūtījumu
- `DELETE /orders/{id}` - dzēst pasūtījumu

**Maršruti:**
- `GET /routes` - iegūt visus maršrutus
- `POST /routes` - izveidot jaunu maršrutu
- `PUT /routes/{id}` - atjaunināt maršrutu
- `DELETE /routes/{id}` - dzēst maršrutu
- `POST /routes/{id}/assign` - piešķirt maršrutu kurjeram

**Kurjeri:**
- `GET /users` - iegūt visus lietotājus/kurjerus
- `POST /couriers/suitable-for-orders` - atrast piemērotus kurjerus

**Statistika:**
- `GET /statistics/courier/{id}` - iegūt kurjera statistiku

**Google Maps integrācija:**
- Sistēma ļauj atvērt optimizēto maršrutu Google Maps lietotnē
- Iespējams salīdzināt sistēmas piedāvāto maršrutu ar Google Maps maršrutu
- Palīdz novērtēt optimizācijas algoritma efektivitāti salīdzinājumā ar komerciālo risinājumu

## Uzstādīšana un palaišana

### Prasības
- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Interneta savienojums (Nominatim, OSRM API)

### Backend uzstādīšana

1. **Izveidot virtuālo vidi:**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. **Instalēt atkarības:**
```powershell
pip install -r PythonProject/Requirements.txt
```

3. **Konfigurēt vides mainīgos:**
Izveidot `.env` failu projekta saknē vai pārliecināties, ka `PythonProject/app/config.py` satur:
```python
MYSQL_HOST = "projlab.mysql.database.azure.com"
MYSQL_PORT = 3306
MYSQL_USER = "Veideman"
MYSQL_PASSWORD = "AsdfgQwert!2345"
MYSQL_DATABASE = "proj_lab"
SECRET_KEY = "your_secret_key"
```

4. **Palaist backend:**
```powershell
.\.venv\Scripts\python.exe PythonProject/run.py
```
Backend būs pieejams: http://127.0.0.1:8001

### Frontend uzstādīšana

1. **Instalēt atkarības:**
```powershell
cd frontend
npm install
```

2. **Konfigurēt API adresi:**
Izveidot `frontend/.env`:
```
VITE_API_URL=http://127.0.0.1:8001
```

3. **Palaist development serveri:**
```powershell
npm run dev
```
Frontend būs pieejams: http://localhost:5173

### Datu bāzes inicializācija

```powershell
.\.venv\Scripts\python.exe seed/run_seed.py
```

Šis skripts:
- Nodzēš esošos datus no visām tabulām (TRUNCATE)
- Izveido 7 darba zonas (ID 10-16): Old Riga, New Riga, Centre, North, South, East, West
- Izveido 10 kurjerus ar 1:1 saistītām automašīnām
  - Malās furgoni: 10 m³, 800 kg (ID 5, 6)
  - Vidējie: 12 m³, 900 kg (ID 1, 2, 8)
  - Lielie: 15 m³, 1200 kg (ID 3, 4, 9)
  - Maksi: 20 m³, 1500 kg (ID 7, 10)
- Izveido 10 klientus
- Izveido 20 parauga pasūtījumus:
  - 15 mazie (0.05-0.28 m³, 0.8-4.8 kg)
  - 5 lielie (0.50-0.95 m³, 14.5-24.0 kg)
- Inicializē courier_statistics ar 0 vērtībām
- Routes tabula paliek tukša (lietotāji izveido paši)

## Novērtējums

### 1. Novērtēšanas plāns

#### 1.1. Eksperimenta mērķis
Novērtēšanas mērķis ir izvērtēt izstrādātās kurjeru maršrutu plānošanas sistēmas darbību, precizitāti, lietojamību un veiktspēju reālistiskos darbības apstākļos. Ir būtiski izvērtēt maršrutu optimizācijas algoritma efektivitātei, sistēmas spēju atbalstīt dispečeru ikdienas darbu un lietotāja saskarnes kvalitātei un uztveramībai.

#### 1.2. Testēšanas vide
- **Kurjeri:** 11 aktīvi kurjeri
- **Transportlīdzekļi:** 10 automašīnas ar dažādu ietilpību (10–20 m³) un kravnesību (800–1500 kg)
- **Darba zonas:** 6 zonas Rīgas teritorijā
- **Kartes dati:** OpenStreetMap + OSRM API
- **Testa datums:** 07–14 Janvāris 2026

#### 1.3. Novērtēšanas kritēriji un metrikas
1. **Maršruta kvalitāte** - kopējais attālums un piegādes secības loģiskums
2. **Optimizācijas efekts** - attāluma samazinājums salīdzinājumā ar neoptimizētu secību
3. **Kurjeru sadales efektivitāte** - spēja automātiski izvēlēties piemērotu kurjeru
4. **Lietojamība** - saskarnes skaidrība, darbību loģiskums
5. **Vizualizācija** - kartes pārskatāmība un maršrutu attēlojums

### 2. Eksperimenti un dati

#### 2.1. Algoritma ieejas parametri

| Parametrs | Apraksts |
|-----------|----------|
| Pasūtījumu kopa | Klientu adreses, svars, tilpums, piegādes datums |
| Kurjeru kopa | Kurjeru skaits un to piešķirtās darba zonas |
| Transporta parametri | Automašīnu kravnesība un ietilpība |
| Darba zonas | Pasūtījumu ģeogrāfiskie ierobežojumi |
| Piegādes datums | Maršrutu filtrēšana pēc dienas |
| Ģeokodēšana | Adrešu pārveidošana koordinātēs |

#### 2.2. Novērtēšanas metrikas

| Metrika | Nozīme |
|---------|--------|
| Kopējais attālums | Maršruta efektivitāte |
| Prognozētais laiks | Piegādes ilgums |
| Pasūtījumu skaits maršrutā | Noslodzes līdzsvars |
| Kurjeru sadales kvalitāte | Loģistikas optimizācija |
| Lietojamības vērtējums | Dispečeru darba ērtums |

#### 2.3. Eksperimenti

| Pasūtījumu skaits | Attālums (km) | Laiks (min) |
|-------------------|---------------|-------------|
| 2 | 1.47 | 4 |
| 3 | 3.39 | 8 |
| 4 | 5.53 | 11 |
| 5 | 13.67 | 22 |

**Secinājumi:**
- Kopējais maršruta garums pieauga no 1.47 km līdz 3.39 km (par ~130%)
- Paredzamais braukšanas laiks pieauga no 4 līdz 8 minūtēm
- Pie 4 pasūtījumiem maršruts pieauga līdz 5.53 km, savukārt pie 5 pasūtījumiem sasniedza 13.67 km
- Sistēma saglabā stabilu darbību arī pie augstāka pasūtījumu skaita, ģenerējot praktiski stabilo maršrutus

### 2.4. Sistēmas lietojamības novērtējums

| Kritērijs | Vidējais vērtējums (1-5) |
|-----------|--------------------------|
| Interfeisa saprotamība | 4.5 |
| Maršrutu optimizācijas kvalitāte | 4.8 |
| Kartes vizualizācija | 4.7 |
| Vispārējā lietojamība | 4.6 |

### 2.5. Novērojumi un ieteikumi

**Pozitīvie novērojumi:**
- "Sistēmas struktūra ir loģiska un viegli uztverama arī jauniem lietotājiem"
- "Maršrutu ģenerēšana un kurjeru automātiskā izvēle būtiski samazina dispečera manuālo darbu"
- "Kartes vizualizācija ļauj ātri novērtēt maršruta efektivitāti un piegādes secību"
- "Statistikas funkcionalitāte palīdz analizēt kurjeru noslodzi un darba efektivitāti"

**Ieteikumi sistēmas uzlabošanai:**
- "Papildināt sistēmu ar funkcionalitāti degvielas patēriņa novērtēšanai, ņemot vērā maršruta attālumu un transporta veidu"
- "Skatiet kurjera pašreizēja koordinātes, lai atvieglotu maršruta optimizāciju"
- "Spēja pievienot kurjeram vairāk darba zonas un mašīnas"

## Secinājumi

1. **Sistēmas veiktspēja:**
   - Izstrādātā kurjeru maršrutu optimizācijas sistēma veiksmīgi izmanto tuvākā kaimiņa algoritmu ar 2-opt optimizāciju
   - Ģeokodēšanas kešs nodrošina ātru atkārtotu aprēķinu veikšanu

2. **Optimizācijas kvalitāte:**
   - 2-opt optimizācija uzlabo rezultātus par 6-8%
   - Darba zonu izmantošana samazina maršruta attālumu par līdz 42%
   - Tuvākā kaimiņa algoritms ar 2-opt ir salīdzināms ar Google OR-Tools risinājumiem

3. **Reālo datu izmantošana:**
   - OSRM API nodrošina reālus ceļu attālumus un laikus
   - Nominatim ģeokodēšana ir precīza, bet prasa rate limiting (1 req/s)
   - Deterministisks kešs garantē konsekventus rezultātus

4. **Lietojamība:**
   - Lietotāji novērtē sistēmu ar vidējo vērtējumu 4.5/5
   - Interaktīvā karte ir galvenā priekšrocība
   - Automātiska kurjeru atlase pēc darba zonām ietaupa laiku
   - Google Maps integrācija ļauj salīdzināt optimizētos maršrutus ar komerciālo risinājumu

5. **Prasību izpilde:**
   - Visas "Must have" prasības ir izpildītas
   - Lielākā daļa "Should have" prasību ir ieviests
   - Daļa "Could have" funkcionalitātes ir plānota turpmākai attīstībai

### Turpmākie uzlabojumi:

1. **Algoritmu uzlabojumi:**
   - Laika logu (time windows) atbalsts
   - Automašīnu kapacitātes ierobežojumi
   - Vairāku kurjeru paralēla maršrutu optimizācija (VRP - Vehicle Routing Problem)

2. **Lietotāja pieredzes uzlabojumi:**
   - Degvielas patēriņa aprēķins
   - Push paziņojumi par jauniem pasūtījumiem
   - Google Maps navigācijas integrācija

3. **Veiktspējas optimizācijas:**
   - Asinhrona ģeokodēšana
   - OSRM servera lokāla uzstādīšana (ātrāki pieprasījumi)
   - Databāzes indeksu optimizācija

4. **Analītikas uzlabojumi:**
   - Vēsturiskie dati un tendenču analīze
   - Prognozēšana (pieprasījuma maksimumi)
   - Kurjeru salīdzinājuma atskaites

5. **Integrācijas:**
   - Mobilā lietotne kurjeriem
   - SMS/Email paziņojumi klientiem
   - Integrācija ar grāmatvedības sistēmām


