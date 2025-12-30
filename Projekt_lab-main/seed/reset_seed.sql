-- Reset and seed data for new architecture
-- Run with: mysql -h <host> -u <user> -p <db> < seed/reset_seed.sql

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE orders;
TRUNCATE TABLE routes;
TRUNCATE TABLE car;
TRUNCATE TABLE users;
TRUNCATE TABLE clients;
TRUNCATE TABLE work_areas;
SET FOREIGN_KEY_CHECKS = 1;

-- Work areas (bounding boxes for Riga)
INSERT INTO work_areas (id, name, min_lat, max_lat, min_lng, max_lng) VALUES
 (10, 'Old Riga (Vecrīga)',        56.9048, 56.9105, 24.1030, 24.1150),
 (11, 'New Riga (Jaunā Rīga)',     56.9150, 56.9280, 24.1070, 24.1350),
 (12, 'Centre (Centrs)',           56.9200, 56.9380, 24.1050, 24.1420),
 (13, 'North (Ziemeļi)',           56.9380, 57.0000, 24.0800, 24.1700),
 (14, 'South (Dienvidi)',          56.8800, 56.9150, 24.0900, 24.1600),
 (15, 'East (Austrumi)',           56.8950, 56.9400, 24.1600, 24.2200),
 (16, 'West (Rietumi)',            56.8950, 56.9400, 23.9800, 24.0900);

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
INSERT INTO car (id, size, weight, vehicle_number, user_id) VALUES
 (1,  120.0, 1200.0, 'LV-1001', 1),
 (2,  120.0, 1200.0, 'LV-1002', 2),
 (3,  140.0, 1400.0, 'LV-1003', 3),
 (4,  140.0, 1400.0, 'LV-1004', 4),
 (5,  100.0, 1000.0, 'LV-1005', 5),
 (6,  100.0, 1000.0, 'LV-1006', 6),
 (7,  160.0, 1600.0, 'LV-1007', 7),
 (8,  120.0, 1200.0, 'LV-1008', 8),
 (9,  140.0, 1400.0, 'LV-1009', 9),
 (10, 160.0, 1600.0, 'LV-1010', 10);

-- Orders (20) mapped to clients; addresses chosen inside defined zones
-- route_status set to 'izskatīšanā'
INSERT INTO orders (id, size, weight, client_id, adress, expected_delivery_time, route_status, actual_delivery_time, created_at, updated_at) VALUES
 (1,  10.0, 5.0,  1,  'Kaļķu iela 10, Rīga',              NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (2,  12.0, 6.0,  2,  'Dzirnavu iela 45, Rīga',           NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (3,  8.0,  4.0,  3,  'Krišjāņa Barona iela 30, Rīga',    NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (4,  15.0, 7.0,  4,  'Brīvības iela 115, Rīga',          NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (5,  9.0,  4.5,  5,  'Maskavas iela 45, Rīga',           NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (6,  11.0, 5.5,  6,  'Pērnavas iela 15, Rīga',           NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (7,  13.0, 6.5,  7,  'Ģertrūdes iela 80, Rīga',          NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (8,  7.0,  3.5,  8,  'Avotu iela 20, Rīga',              NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (9,  10.0, 5.0,  9,  'Miera iela 12, Rīga',              NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (10, 14.0, 7.0,  10, 'Kalnciema iela 5, Rīga',           NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (11, 12.0, 6.0,  1,  'Baznīcas iela 30, Rīga',           NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (12, 9.0,  4.5,  2,  'Tērbatas iela 50, Rīga',           NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (13, 11.0, 5.5,  3,  'Krasta iela 50, Rīga',             NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (14, 13.0, 6.5,  4,  'Ķengaraga iela 5, Rīga',           NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (15, 8.0,  4.0,  5,  'Mūkusalas iela 15, Rīga',          NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (16, 10.0, 5.0,  6,  'Skanstes iela 7, Rīga',            NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (17, 9.0,  4.5,  7,  'Brīvības gatve 214, Rīga',         NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (18, 12.0, 6.0,  8,  'Daugavgrīvas iela 80, Rīga',       NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (19, 7.0,  3.5,  9,  'Imantas 8. līnija 3, Rīga',        NOW(), 'izskatīšanā', NULL, NOW(), NOW()),
 (20, 6.0,  3.0,  10, 'Ulbrokas iela 10, Rīga',           NOW(), 'izskatīšanā', NULL, NOW(), NOW());

-- Reset AUTO_INCREMENTs for neat IDs
ALTER TABLE work_areas AUTO_INCREMENT = 100;
ALTER TABLE users AUTO_INCREMENT = 200;
ALTER TABLE car AUTO_INCREMENT = 200;
ALTER TABLE clients AUTO_INCREMENT = 200;
ALTER TABLE orders AUTO_INCREMENT = 300;
ALTER TABLE routes AUTO_INCREMENT = 300;
