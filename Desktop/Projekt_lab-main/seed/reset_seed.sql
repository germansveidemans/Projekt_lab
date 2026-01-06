-- Reset and seed data for new architecture
-- Run with: mysql -h projlab.mysql.database.azure.com -u Veideman -p proj_lab < seed/reset_seed.sql
-- Or: mysql -h projlab.mysql.database.azure.com -u Veideman -pAsdfgQwert!2345 proj_lab < seed/reset_seed.sql

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE courier_statistics;
TRUNCATE TABLE routes;
TRUNCATE TABLE orders;
TRUNCATE TABLE car;
TRUNCATE TABLE users;
TRUNCATE TABLE clients;
TRUNCATE TABLE work_areas;
SET FOREIGN_KEY_CHECKS = 1;

-- Work areas (bounding boxes for Riga)
INSERT INTO work_areas (id, name, min_lat, max_lat, min_lng, max_lng) VALUES
 (10, 'Old Riga (Vecrīga)',        56.9000, 56.9150, 24.0950, 24.1250),
 (11, 'New Riga (Jaunā Rīga)',     56.9100, 56.9350, 24.0950, 24.1500),
 (12, 'Centre (Centrs)',           56.9150, 56.9450, 24.0950, 24.1550),
 (13, 'North (Ziemeļi)',           56.9300, 57.0200, 24.0600, 24.1900),
 (14, 'South (Dienvidi)',          56.8700, 56.9250, 24.0700, 24.1800),
 (15, 'East (Austrumi)',           56.8850, 56.9500, 24.1500, 24.2400),
 (16, 'West (Rietumi)',            56.8850, 56.9500, 23.9600, 24.1000);

-- Clients
INSERT INTO clients (id, name_surname, email, address, phone_number) VALUES
 (1,  'Anna Ozola',       'anna.ozola@example.com',        'Alfona 1, Rīga',            '+37120000001'),
 (2,  'Jānis Bērziņš',    'janis.berzins@example.com',     'Dzirnavu iela 45, Rīga',    '+37120000002'),
 (3,  'Liga Kalniņa',     'liga.kalnina@example.com',      'Krišjāņa Barona 30, Rīga',  '+37120000003'),
 (4,  'Edgars Liepa',     'edgars.liepa@example.com',      'Brīvības iela 115, Rīga',   '+37120000004'),
 (5,  'Marta Eglīte',     'marta.eglite@example.com',      'Maskavas iela 45, Rīga',    '+37120000005'),
 (6,  'Toms Siliņš',      'toms.silins@example.com',       'Pērnavas iela 15, Rīga',    '+37120000006'),
 (7,  'Elza Krūmiņa',     'elza.krumina@example.com',      'Ģertrūdes iela 80, Rīga',   '+37120000007'),
 (8,  'Artis Balodis',    'artis.balodis@example.com',     'Avotu iela 20, Rīga',       '+37120000008'),
 (9,  'Roberts Zariņš',   'roberts.zarins@example.com',    'Miera iela 12, Rīga',       '+37120000009'),
 (10, 'Dace Lapiņa',      'dace.lapina@example.com',       'Kalku iela 10, Rīga',       '+37120000010');

-- Couriers (users) with zones
INSERT INTO users (id, username, password, role, work_area_id) VALUES
 (1,  'kurjers1',  'pass1', 'kurjers', 10),
 (2,  'kurjers2',  'pass2', 'kurjers', 11),
 (3,  'kurjers3',  'pass3', 'kurjers', 12),
 (4,  'kurjers4',  'pass4', 'kurjers', 13),
 (5,  'kurjers5',  'pass5', 'kurjers', 14),
 (6,  'kurjers6',  'pass6', 'kurjers', 15),
 (7,  'kurjers7',  'pass7', 'kurjers', 16),
 (8,  'kurjers8',  'pass8', 'kurjers', 12),
 (9,  'kurjers9',  'pass9', 'kurjers', 13),
 (10, 'kurjers10', 'pass10','kurjers', 14);

-- Cars matched 1:1 to courier users
-- size: cubic meters (10-20 m³), weight capacity: kg (800-1500 kg)
INSERT INTO car (id, size, weight, vehicle_number, user_id) VALUES
 (1,  12.0, 900.0,  'LV-1001', 1),
 (2,  12.0, 900.0,  'LV-1002', 2),
 (3,  15.0, 1200.0, 'LV-1003', 3),
 (4,  15.0, 1200.0, 'LV-1004', 4),
 (5,  10.0, 800.0,  'LV-1005', 5),
 (6,  10.0, 800.0,  'LV-1006', 6),
 (7,  20.0, 1500.0, 'LV-1007', 7),
 (8,  12.0, 900.0,  'LV-1008', 8),
 (9,  15.0, 1200.0, 'LV-1009', 9),
 (10, 20.0, 1500.0, 'LV-1010', 10);

-- Orders (20) mapped to clients; addresses chosen inside defined zones
-- route_status: 'gatavs', 'progresā', 'atcelts', 'izskatīšanā', 'piegādāts'
-- expected_delivery_time: DATE (no time component)
-- First 15 orders: small packages (0.05-0.3 m³, 0.5-5 kg)
-- Last 5 orders: heavy boxes (0.4-1.0 m³, 10-25 kg)
INSERT INTO orders (id, size, weight, client_id, adress, expected_delivery_time, route_status, created_at, updated_at) VALUES
 (1,  0.08, 1.2,  1,  'Kaļķu iela 10, Rīga',              '2026-01-08', 'izskatīšanā', NOW(), NOW()),
 (2,  0.15, 2.5,  2,  'Dzirnavu iela 45, Rīga',           '2026-01-08', 'izskatīšanā', NOW(), NOW()),
 (3,  0.05, 0.8,  3,  'Krišjāņa Barona iela 30, Rīga',    '2026-01-08', 'izskatīšanā', NOW(), NOW()),
 (4,  0.20, 3.5,  4,  'Brīvības iela 115, Rīga',          '2026-01-09', 'izskatīšanā', NOW(), NOW()),
 (5,  0.12, 2.0,  5,  'Maskavas iela 45, Rīga',           '2026-01-09', 'izskatīšanā', NOW(), NOW()),
 (6,  0.18, 3.0,  6,  'Pērnavas iela 15, Rīga',           '2026-01-09', 'izskatīšanā', NOW(), NOW()),
 (7,  0.25, 4.2,  7,  'Ģertrūdes iela 80, Rīga',          '2026-01-10', 'izskatīšanā', NOW(), NOW()),
 (8,  0.06, 0.9,  8,  'Avotu iela 20, Rīga',              '2026-01-10', 'izskatīšanā', NOW(), NOW()),
 (9,  0.10, 1.5,  9,  'Miera iela 12, Rīga',              '2026-01-10', 'izskatīšanā', NOW(), NOW()),
 (10, 0.22, 3.8,  10, 'Kalnciema iela 5, Rīga',           '2026-01-11', 'izskatīšanā', NOW(), NOW()),
 (11, 0.14, 2.3,  1,  'Baznīcas iela 30, Rīga',           '2026-01-11', 'izskatīšanā', NOW(), NOW()),
 (12, 0.09, 1.4,  2,  'Tērbatas iela 50, Rīga',           '2026-01-11', 'izskatīšanā', NOW(), NOW()),
 (13, 0.16, 2.7,  3,  'Krasta iela 50, Rīga',             '2026-01-12', 'izskatīšanā', NOW(), NOW()),
 (14, 0.28, 4.8,  4,  'Ķengaraga iela 5, Rīga',           '2026-01-12', 'izskatīšanā', NOW(), NOW()),
 (15, 0.11, 1.8,  5,  'Mūkusalas iela 15, Rīga',          '2026-01-12', 'izskatīšanā', NOW(), NOW()),
 (16, 0.65, 18.0, 6,  'Skanstes iela 7, Rīga',            '2026-01-13', 'izskatīšanā', NOW(), NOW()),
 (17, 0.80, 22.0, 7,  'Brīvības gatve 214, Rīga',         '2026-01-13', 'izskatīšanā', NOW(), NOW()),
 (18, 0.50, 14.5, 8,  'Daugavgrīvas iela 80, Rīga',       '2026-01-13', 'izskatīšanā', NOW(), NOW()),
 (19, 0.95, 24.0, 9,  'Imantas 8. līnija 3, Rīga',        '2026-01-14', 'izskatīšanā', NOW(), NOW()),
 (20, 0.70, 19.5, 10, 'Ulbrokas iela 10, Rīga',           '2026-01-14', 'izskatīšanā', NOW(), NOW());

-- Reset AUTO_INCREMENTs for neat IDs
ALTER TABLE work_areas AUTO_INCREMENT = 100;
ALTER TABLE users AUTO_INCREMENT = 200;
ALTER TABLE car AUTO_INCREMENT = 200;
ALTER TABLE clients AUTO_INCREMENT = 200;
ALTER TABLE orders AUTO_INCREMENT = 300;
ALTER TABLE routes AUTO_INCREMENT = 300;
ALTER TABLE courier_statistics AUTO_INCREMENT = 100;

-- Routes table is empty - users will create routes themselves

-- Courier statistics initialized with zeros for all couriers
-- Columns: id, courier_id, total_routes, completed_routes, total_distance_km, total_orders_delivered, last_updated
INSERT INTO courier_statistics (courier_id, total_routes, completed_routes, total_distance_km, total_orders_delivered, last_updated) VALUES
 (1,  0, 0, 0.0, 0, NOW()),
 (2,  0, 0, 0.0, 0, NOW()),
 (3,  0, 0, 0.0, 0, NOW()),
 (4,  0, 0, 0.0, 0, NOW()),
 (5,  0, 0, 0.0, 0, NOW()),
 (6,  0, 0, 0.0, 0, NOW()),
 (7,  0, 0, 0.0, 0, NOW()),
 (8,  0, 0, 0.0, 0, NOW()),
 (9,  0, 0, 0.0, 0, NOW()),
 (10, 0, 0, 0.0, 0, NOW());
