-- MySQL Veritabanı Şeması (XAMPP için)
-- phpMyAdmin'de veya MySQL komut satırından çalıştırın

CREATE DATABASE IF NOT EXISTS motosiklet_topsis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE motosiklet_topsis;

CREATE TABLE IF NOT EXISTS motorcycles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    price DECIMAL(12, 2) NOT NULL,
    power DECIMAL(8, 2) NOT NULL,
    fuel DECIMAL(5, 2) NOT NULL,
    weight DECIMAL(6, 2) NOT NULL,
    url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_price (price),
    INDEX idx_power (power)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

