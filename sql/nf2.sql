CREATE SCHEMA nf2;

CREATE TABLE nf2.customers (
	id SERIAL PRIMARY KEY,
	first_name VARCHAR(128) NOT NULL,
	last_name VARCHAR(128) NOT NULL,
	email VARCHAR(255) NOT NULL
);

CREATE TABLE nf2.orders (
	id SERIAL PRIMARY KEY,
	order_date DATE NOT NULL,
	customer_id INT NOT NULL REFERENCES nf2.customers(id), 
	payment_method VARCHAR(50),
	payment_amount NUMERIC(10,2) NOT NULL CHECK(payment_amount >= 0),
	payment_fee NUMERIC(8,2) NOT NULL CHECK(payment_fee >= 0),
	delivery_method VARCHAR(128) NOT NULL,
	delivery_fee NUMERIC(10,2) NOT NULL CHECK(delivery_fee >= 0),
	delivery_region VARCHAR(100) NOT NULL,
	delivery_city VARCHAR(80) NOT NULL,
	delivery_street VARCHAR(100) NOT NULL,
	delivery_house VARCHAR(10) NOT NULL,
	delivery_apartment VARCHAR(10),
	delivery_date DATE NOT NULL,
	delivery_status BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE nf2.products_stock (
	id SERIAL PRIMARY KEY,
	product_name VARCHAR(255) NOT NULL,
	category_name VARCHAR(80) NOT NULL,
	supplier_name VARCHAR(255) NOT NULL,
	warehouse_name VARCHAR(100) NOT NULL,
	warehouse_region VARCHAR(100) NOT NULL,
	warehouse_city VARCHAR(80) NOT NULL,
	warehouse_street VARCHAR(100) NOT NULL,
	warehouse_building VARCHAR(10) NOT NULL,
	warehouse_apartment VARCHAR(10),
	price NUMERIC(10,2) NOT NULL CHECK(price >= 0)
);

CREATE TABLE nf2.supplier_contacts (
	supplier_name VARCHAR(255) NOT NULL,
	phone VARCHAR(30) NOT NULL,
	email VARCHAR(255) NOT NULL,
	PRIMARY KEY (supplier_name,phone,email)
);

CREATE TABLE nf2.order_items (
	order_id INT NOT NULL REFERENCES nf2.orders(id),
	product_id INT NOT NULL REFERENCES nf2.products_stock(id),
	quantity INT NOT NULL CHECK(quantity > 0),
	PRIMARY KEY (order_id, product_id)
);
