CREATE SCHEMA nf3;

CREATE TABLE nf3.customers (
	id SERIAL PRIMARY KEY,
	first_name VARCHAR(128) NOT NULL,
	last_name VARCHAR(128) NOT NULL,
	email VARCHAR(255) NOT NULL
);

CREATE TABLE nf3.payment_methods (
	id SERIAL PRIMARY KEY,
	method_name VARCHAR(50) NOT NULL,
	payment_fee NUMERIC(8,2) NOT NULL CHECK(payment_fee >= 0)
);

CREATE TABLE nf3.delivery_methods (
	id SERIAL PRIMARY KEY,
	method_name VARCHAR(128) NOT NULL,
	delivery_fee NUMERIC(10,2) NOT NULL CHECK(delivery_fee >= 0)
);

CREATE TABLE nf3.regions (
    id SERIAL PRIMARY KEY,
    region_name VARCHAR(100) NOT NULL
);

CREATE TABLE nf3.cities (
    id SERIAL PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
	region_id INT NOT NULL REFERENCES nf3.regions(id),
	CONSTRAINT uq_city_region UNIQUE (city_name,region_id)
);

CREATE TABLE nf3.streets (
    id SERIAL PRIMARY KEY,
    street_name VARCHAR(100) NOT NULL,
	city_id INT NOT NULL REFERENCES nf3.cities(id),
	CONSTRAINT uq_street_city UNIQUE (street_name,city_id)
);


CREATE TABLE nf3.addresses (
    id SERIAL PRIMARY KEY,
    building VARCHAR(10) NOT NULL,
	apartment VARCHAR(10),
	street_id INT NOT NULL REFERENCES nf3.streets(id),
	CONSTRAINT uq_address_street UNIQUE (building,apartment,street_id)
);

CREATE TABLE nf3.orders (
	id SERIAL PRIMARY KEY,
	order_date DATE NOT NULL,
	customer_id INT NOT NULL REFERENCES nf3.customers(id),
	payment_method_id INT NOT NULL REFERENCES nf3.payment_methods(id),
	delivery_method_id INT NOT NULL REFERENCES nf3.delivery_methods(id),
	delivery_address_id INT NOT NULL REFERENCES nf3.addresses(id),
	delivery_date DATE NOT NULL,
	delivery_status BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE nf3.categories(
	id SERIAL PRIMARY KEY,
	category_name VARCHAR(80) NOT NULL
);

CREATE TABLE nf3.suppliers(
	id SERIAL PRIMARY KEY,
	supplier_name VARCHAR(255) NOT NULL
);


CREATE TABLE nf3.supplier_contacts(
	supplier_id INT NOT NULL REFERENCES nf3.suppliers(id),
	phone VARCHAR(30) NOT NULL,
	email VARCHAR(255) NOT NULL,
	PRIMARY KEY (supplier_id,phone,email)
);


CREATE TABLE nf3.warehouses ( 
	id SERIAL PRIMARY KEY,
	warehouse_name VARCHAR(100) UNIQUE NOT NULL,
	address_id INT NOT NULL REFERENCES nf3.addresses(id)
);

CREATE TABLE nf3.products (
	id SERIAL PRIMARY KEY,
	product_name VARCHAR(255) NOT NULL,
	category_id INT NOT NULL REFERENCES nf3.categories(id),
	price NUMERIC(10,2) NOT NULL CHECK(price >= 0)
);

CREATE TABLE nf3.product_supplier_warehouse (
	product_id INT NOT NULL REFERENCES nf3.products(id),
	supplier_id INT NOT NULL REFERENCES nf3.suppliers(id),
	warehouse_id INT NOT NULL REFERENCES nf3.warehouses(id),
	PRIMARY KEY (product_id, supplier_id, warehouse_id)
);

CREATE TABLE nf3.order_items (
	order_id INT NOT NULL REFERENCES nf3.orders(id),
	product_id INT NOT NULL,
	supplier_id INT NOT NULL,
	warehouse_id INT NOT NULL,
	quantity INT NOT NULL CHECK(quantity > 0),
	FOREIGN KEY (product_id, supplier_id, warehouse_id) 
	REFERENCES nf3.product_supplier_warehouse(product_id, supplier_id, warehouse_id),
	PRIMARY KEY (order_id, product_id, supplier_id, warehouse_id)
);

