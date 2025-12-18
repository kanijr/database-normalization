CREATE SCHEMA nnf;

CREATE TABLE nnf.orders (
	order_id INT NOT NULL CHECK(order_id > 0),
	customer_full_name VARCHAR(255) NOT NULL,
	customer_email VARCHAR(255) NOT NULL,
	order_date DATE NOT NULL,
	payment_method VARCHAR(50),
	payment_amount NUMERIC(10,2) NOT NULL CHECK(payment_amount >= 0),
	payment_fee NUMERIC(8,2) NOT NULL CHECK(payment_fee >= 0),
	delivery_method VARCHAR(128) NOT NULL,
	delivery_fee NUMERIC(10,2) NOT NULL CHECK(delivery_fee >= 0),
	delivery_address VARCHAR(255) NOT NULL,
	delivery_date DATE NOT NULL,
	delivery_status BOOLEAN NOT NULL DEFAULT FALSE,
	product_name VARCHAR(255) NOT NULL,
	category_name VARCHAR(80) NOT NULL,
	supplier_name VARCHAR(255) NOT NULL,
	supplier_phones TEXT NOT NULL,
	supplier_emails TEXT NOT NULL,
	warehouse_name VARCHAR(100) NOT NULL,
	warehouse_address VARCHAR(255) NOT NULL,
	price NUMERIC(10,2) NOT NULL CHECK(price >= 0),
	quantity INT NOT NULL CHECK(quantity > 0)
);

CREATE TABLE nnf.products_stock (
	id SERIAL PRIMARY KEY,
	product_name VARCHAR(255) NOT NULL,
	category_name VARCHAR(80) NOT NULL,
	supplier_name VARCHAR(255) NOT NULL,
	supplier_phones TEXT NOT NULL,
	supplier_emails TEXT NOT NULL,
	warehouse_name VARCHAR(100) NOT NULL,
	warehouse_address VARCHAR(255) NOT NULL,
	price NUMERIC(10,2) NOT NULL CHECK(price >= 0)
);
