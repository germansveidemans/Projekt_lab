CREATE TABLE users (
	id INTEGER AUTO_INCREMENT PRIMARY KEY ,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    role ENUM('admin', 'kurjers'),
    work_area_id INTEGER NOT NULL
);

CREATE TABLE work_areas (
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30)
);

CREATE TABLE car (
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
    size NUMERIC(10,2),
    weight NUMERIC(10,2),
    vehicle_number VARCHAR(7) NOT NULL UNIQUE,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE routes (
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
    courier_id INTEGER,
    work_time INTEGER,
    date DATE,
    total_orders INTEGER,
    total_distance NUMERIC(10,2),
    optimized_path JSON,
    status ENUM("atdots kurjēram", "izskatīšanā"),
    FOREIGN KEY (courier_id) REFERENCES users(id)
);


CREATE TABLE clients (
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name_surname VARCHAR(50) NOT NULL,
    email VARCHAR(70) NOT NULL,
    address VARCHAR(100) NOT NULL,
    phone_number VARCHAR(12)
);

CREATE TABLE orders (
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
    route_id INTEGER NOT NULL UNIQUE,
    sequence INTEGER,
    size NUMERIC(10,2),
    weight NUMERIC(5,2),
    client_id INTEGER,
    adress VARCHAR(100),
    expected_delivery_time TIMESTAMP,
    route_status ENUM("gatavs", "progresā", "atcelts", "izskatīšanā"),
    actual_delivery_time TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);
