-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 03, 2026 at 03:39 PM
-- Server version: 8.0.45
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sales_production`
--

DELIMITER $$
--
-- Procedures
--
DROP PROCEDURE IF EXISTS `insert_order`$$
CREATE PROCEDURE `insert_order` (IN `p_order_number` VARCHAR(20), IN `p_customer_id` INT UNSIGNED, IN `p_employee_id` INT UNSIGNED, IN `p_order_date` DATETIME, IN `p_req_date` DATE, IN `p_ship_date` DATE, IN `p_status` VARCHAR(20), IN `p_ship_addr` VARCHAR(200), IN `p_ship_city` VARCHAR(60), IN `p_pay_method` VARCHAR(20), IN `p_pay_status` VARCHAR(20), IN `p_discount_id` SMALLINT UNSIGNED, IN `p_shipping_fee` DECIMAL(10,2), IN `p_notes` TEXT)   BEGIN
  INSERT INTO orders (order_number, customer_id, employee_id, order_date,
                      required_date, shipped_date, status, shipping_addr,
                      shipping_city, payment_method, payment_status,
                      discount_id, shipping_fee, notes)
  VALUES (p_order_number, p_customer_id, p_employee_id, p_order_date,
          p_req_date, p_ship_date, p_status, p_ship_addr,
          p_ship_city, p_pay_method, p_pay_status,
          p_discount_id, p_shipping_fee, p_notes);
END$$

DROP PROCEDURE IF EXISTS `sp_customer_history`$$
CREATE PROCEDURE `sp_customer_history` (IN `p_customer_id` INT UNSIGNED)   BEGIN
  SELECT
    o.order_number,
    o.order_date,
    o.status,
    o.payment_status,
    o.grand_total,
    GROUP_CONCAT(CONCAT(pr.product_name,' x',oi.quantity) SEPARATOR ' | ') AS items
  FROM orders o
  JOIN order_items oi ON o.order_id = oi.order_id
  JOIN products pr    ON oi.product_id = pr.product_id
  WHERE o.customer_id = p_customer_id
  GROUP BY o.order_id
  ORDER BY o.order_date DESC;
END$$

DROP PROCEDURE IF EXISTS `sp_sales_report`$$
CREATE PROCEDURE `sp_sales_report` (IN `p_start` DATE, IN `p_end` DATE)   BEGIN
  SELECT
    o.order_number,
    o.order_date,
    CONCAT(c.first_name,' ',c.last_name)  AS customer,
    c.customer_type,
    CONCAT(e.first_name,' ',e.last_name)  AS sales_rep,
    o.status,
    o.payment_method,
    o.payment_status,
    o.subtotal,
    o.discount_amt,
    o.shipping_fee,
    o.grand_total
  FROM orders o
  JOIN customers c ON o.customer_id = c.customer_id
  LEFT JOIN employees e ON o.employee_id = e.employee_id
  WHERE DATE(o.order_date) BETWEEN p_start AND p_end
  ORDER BY o.order_date;
END$$

DROP PROCEDURE IF EXISTS `sp_update_stock`$$
CREATE PROCEDURE `sp_update_stock` (IN `p_order_id` INT UNSIGNED)   BEGIN
  UPDATE products p
  JOIN order_items oi ON p.product_id = oi.product_id
  SET p.stock_qty = p.stock_qty - oi.quantity
  WHERE oi.order_id = p_order_id;
END$$

DELIMITER ;

-- --------------------------------------------------------
--
-- Drop all tables if they exist
--

DROP VIEW IF EXISTS `vw_top_products`;
DROP VIEW IF EXISTS `vw_sales_rep_performance`;
DROP VIEW IF EXISTS `vw_outstanding_invoices`;
DROP VIEW IF EXISTS `vw_monthly_sales`;
DROP VIEW IF EXISTS `vw_low_stock`;
DROP VIEW IF EXISTS `vw_customer_summary`;
DROP TABLE IF EXISTS `returns`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `invoices`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `discounts`;
DROP TABLE IF EXISTS `suppliers`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `employees`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `regions`;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` smallint UNSIGNED NOT NULL PRIMARY KEY,
  `category_name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `category_name`, `description`, `is_active`, `created_at`) VALUES
(1, 'Electronics', 'Gadgets, devices, and accessories', 1, '2026-06-03 13:39:19'),
(2, 'Apparel', 'Clothing, shoes, and fashion items', 1, '2026-06-03 13:39:19'),
(3, 'Home & Living', 'Furniture, decor, and appliances', 1, '2026-06-03 13:39:19'),
(4, 'Sports & Outdoors', 'Sports equipment and outdoor gear', 1, '2026-06-03 13:39:19'),
(5, 'Food & Beverage', 'Packaged food and drinks', 1, '2026-06-03 13:39:19'),
(6, 'Office Supplies', 'Stationery and office equipment', 1, '2026-06-03 13:39:19');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int UNSIGNED NOT NULL PRIMARY KEY,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region_id` tinyint UNSIGNED DEFAULT NULL,
  `customer_type` enum('retail','wholesale','vip') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'retail',
  `credit_limit` decimal(14,2) NOT NULL DEFAULT '0.00',
  `total_spent` decimal(14,2) NOT NULL DEFAULT '0.00',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `first_name`, `last_name`, `email`, `phone`, `address`, `city`, `region_id`, `customer_type`, `credit_limit`, `total_spent`, `is_active`, `created_at`) VALUES
(1, 'Jose', 'Dela Cruz', 'jdelacruz@email.com', '+63-920-001', 'Brgy. San Isidro 12', 'Manila', 1, 'retail', 20000.00, 3827.00, 1, '2026-06-03 13:39:19'),
(2, 'Maria', 'Santos', 'msantos@email.com', '+63-920-002', 'Brgy. Poblacion 7', 'Makati', 1, 'vip', 100000.00, 15849.05, 1, '2026-06-03 13:39:19'),
(3, 'Roberto', 'Reyes', 'rreyes@email.com', '+63-920-003', '123 Rizal Street', 'Quezon City', 1, 'wholesale', 80000.00, 17221.00, 1, '2026-06-03 13:39:19'),
(4, 'Leonora', 'Gomez', 'lgomez@email.com', '+63-920-004', '45 Mabini Ave.', 'Pampanga', 2, 'retail', 15000.00, 0.00, 1, '2026-06-03 13:39:19'),
(5, 'Eduardo', 'Navarro', 'enavarro@email.com', '+63-920-005', '78 Luna Street', 'Angeles City', 2, 'wholesale', 60000.00, 6897.30, 1, '2026-06-03 13:39:19'),
(6, 'Cristina', 'Pascual', 'cpascual@email.com', '+63-920-006', 'Brgy. Sto. Nino 4', 'Calamba', 3, 'retail', 10000.00, 0.00, 1, '2026-06-03 13:39:19'),
(7, 'Emmanuel', 'Torres', 'etorres@email.com', '+63-920-007', '90 Aguinaldo Blvd.', 'Bacoor', 3, 'retail', 12000.00, 0.00, 1, '2026-06-03 13:39:19'),
(8, 'Rosario', 'Villanueva', 'rvillanueva@email.com', '+63-920-008', '5 Lacson Street', 'Bacolod City', 4, 'vip', 90000.00, 31094.90, 1, '2026-06-03 13:39:19'),
(9, 'Ferdinand', 'Lim', 'flim@email.com', '+63-920-009', '200 Iznart Street', 'Iloilo City', 4, 'wholesale', 75000.00, 11896.40, 1, '2026-06-03 13:39:19'),
(10, 'Teresita', 'Espino', 'tespino@email.com', '+63-920-010', 'Brgy. Guadalupe 3', 'Cebu City', 5, 'vip', 120000.00, 19421.60, 1, '2026-06-03 13:39:19'),
(11, 'Benjamin', 'Ramos', 'bramos@email.com', '+63-920-011', '34 Osmena Blvd.', 'Cebu City', 5, 'retail', 18000.00, 4547.00, 1, '2026-06-03 13:39:19'),
(12, 'Angelica', 'Bautista', 'abautista@email.com', '+63-920-012', 'JP Laurel Avenue', 'Davao City', 6, 'retail', 20000.00, 0.00, 1, '2026-06-03 13:39:19'),
(13, 'Noel', 'Mercado', 'nmercado@email.com', '+63-920-013', 'Sandawa Road', 'Davao City', 6, 'wholesale', 55000.00, 15995.50, 1, '2026-06-03 13:39:19'),
(14, 'Carla', 'Fernandez', 'cfernandez@email.com', '+63-920-014', 'Brgy. Tejero 22', 'Manila', 1, 'retail', 10000.00, 0.00, 1, '2026-06-03 13:39:19'),
(15, 'Reynaldo', 'Ocampo', 'rocampo@email.com', '+63-920-015', 'Commonwealth Ave. 560', 'Quezon City', 1, 'retail', 15000.00, 2577.00, 1, '2026-06-03 13:39:19');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `dept_id` tinyint UNSIGNED NOT NULL PRIMARY KEY,
  `dept_name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `budget` decimal(14,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`dept_id`, `dept_name`, `budget`) VALUES
(1, 'Sales', 5000000.00),
(2, 'Marketing', 2000000.00),
(3, 'Warehouse', 1500000.00),
(4, 'Finance', 1200000.00),
(5, 'Customer Service', 800000.00);

-- --------------------------------------------------------

--
-- Table structure for table `discounts`
--

CREATE TABLE `discounts` (
  `discount_id` smallint UNSIGNED NOT NULL PRIMARY KEY,
  `discount_name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` enum('percent','fixed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'percent',
  `discount_value` decimal(8,2) NOT NULL,
  `min_order_qty` int NOT NULL DEFAULT '1',
  `min_order_amt` decimal(12,2) NOT NULL DEFAULT '0.00',
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `discounts`
--

INSERT INTO `discounts` (`discount_id`, `discount_name`, `discount_type`, `discount_value`, `min_order_qty`, `min_order_amt`, `valid_from`, `valid_to`, `is_active`) VALUES
(1, 'VIP 15% Off', 'percent', 15.00, 1, 0.00, '2026-01-01', '2026-12-31', 1),
(2, 'Wholesale 10% Off', 'percent', 10.00, 5, 0.00, '2026-01-01', '2026-12-31', 1),
(3, 'Bulk Order 5% Off', 'percent', 5.00, 10, 0.00, '2026-01-01', '2026-12-31', 1),
(4, 'Mid-Year Sale 20%', 'percent', 20.00, 1, 0.00, '2026-06-01', '2026-06-30', 1),
(5, 'PHP 500 Off Orders', 'fixed', 500.00, 1, 5000.00, '2026-01-01', '2026-12-31', 1);

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int UNSIGNED NOT NULL PRIMARY KEY,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dept_id` tinyint UNSIGNED DEFAULT NULL,
  `job_title` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hire_date` date NOT NULL,
  `salary` decimal(12,2) NOT NULL,
  `manager_id` int UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `first_name`, `last_name`, `email`, `phone`, `dept_id`, `job_title`, `hire_date`, `salary`, `manager_id`, `is_active`) VALUES
(1, 'Miguel', 'Reyes', 'mreyes@salesdb.com', '+63-917-001-0001', 1, 'Sales Director', '2018-03-01', 95000.00, NULL, 1),
(2, 'Grace', 'Santos', 'gsantos@salesdb.com', '+63-917-001-0002', 1, 'Senior Sales Executive', '2019-06-15', 55000.00, 1, 1),
(3, 'Patrick', 'Villanueva', 'pvillanueva@salesdb.com', '+63-917-001-0003', 1, 'Sales Executive', '2020-02-10', 42000.00, 1, 1),
(4, 'Kristine', 'Mendoza', 'kmendoza@salesdb.com', '+63-917-001-0004', 1, 'Sales Executive', '2021-08-20', 40000.00, 1, 1),
(5, 'Jomar', 'Flores', 'jflores@salesdb.com', '+63-917-001-0005', 1, 'Sales Associate', '2022-01-05', 30000.00, 2, 1),
(6, 'Diana', 'Tan', 'dtan@salesdb.com', '+63-917-001-0006', 2, 'Marketing Manager', '2019-04-01', 70000.00, NULL, 1),
(7, 'Leo', 'Cruz', 'lcruz@salesdb.com', '+63-917-001-0007', 3, 'Warehouse Supervisor', '2020-07-18', 45000.00, NULL, 1),
(8, 'Sofia', 'Lim', 'slim@salesdb.com', '+63-917-001-0008', 4, 'Finance Officer', '2021-03-22', 50000.00, NULL, 1),
(9, 'Nico', 'Garcia', 'ngarcia@salesdb.com', '+63-917-001-0009', 5, 'Customer Service Rep', '2022-09-12', 28000.00, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `invoice_id` int UNSIGNED NOT NULL PRIMARY KEY,
  `invoice_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` int UNSIGNED NOT NULL,
  `issued_date` date NOT NULL,
  `due_date` date NOT NULL,
  `amount_due` decimal(14,2) NOT NULL,
  `amount_paid` decimal(14,2) NOT NULL DEFAULT '0.00',
  `balance` decimal(14,2) GENERATED ALWAYS AS ((`amount_due` - `amount_paid`)) STORED,
  `status` enum('draft','issued','paid','overdue','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'issued',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`invoice_id`, `invoice_number`, `order_id`, `issued_date`, `due_date`, `amount_due`, `amount_paid`, `status`, `notes`, `created_at`) VALUES
(1, 'INV-2026-0001', 1, '2026-01-08', '2026-01-23', 9751.60, 9751.60, 'paid', NULL, '2026-06-03 13:39:20'),
(2, 'INV-2026-0002', 2, '2026-01-15', '2026-01-30', 8025.50, 8025.50, 'paid', NULL, '2026-06-03 13:39:20'),
(3, 'INV-2026-0003', 3, '2026-01-23', '2026-02-07', 13847.45, 13847.45, 'paid', NULL, '2026-06-03 13:39:20'),
(4, 'INV-2026-0004', 4, '2026-02-06', '2026-02-21', 3827.00, 3827.00, 'paid', NULL, '2026-06-03 13:39:20'),
(5, 'INV-2026-0005', 5, '2026-02-17', '2026-03-04', 19421.60, 19421.60, 'paid', NULL, '2026-06-03 13:39:20'),
(6, 'INV-2026-0006', 6, '2026-02-25', '2026-03-12', 6897.30, 6897.30, 'paid', NULL, '2026-06-03 13:39:20'),
(7, 'INV-2026-0007', 7, '2026-03-08', '2026-03-23', 11896.40, 11896.40, 'paid', NULL, '2026-06-03 13:39:20'),
(8, 'INV-2026-0009', 9, '2026-03-28', '2026-04-12', 15995.50, 15995.50, 'paid', NULL, '2026-06-03 13:39:20'),
(9, 'INV-2026-0010', 10, '2026-04-05', '2026-04-20', 4547.00, 4547.00, 'paid', NULL, '2026-06-03 13:39:20'),
(10, 'INV-2026-0011', 11, '2026-04-13', '2026-04-28', 6097.45, 6097.45, 'paid', NULL, '2026-06-03 13:39:20'),
(11, 'INV-2026-0012', 12, '2026-04-23', '2026-05-08', 2577.00, 2577.00, 'paid', NULL, '2026-06-03 13:39:20'),
(12, 'INV-2026-0013', 13, '2026-05-04', '2026-05-19', 17247.45, 17247.45, 'paid', NULL, '2026-06-03 13:39:20'),
(13, 'INV-2026-0014', 14, '2026-05-15', '2026-05-30', 9195.50, 9195.50, 'paid', NULL, '2026-06-03 13:39:20'),
(14, 'INV-2026-0015', 15, '2026-05-25', '2026-06-09', 13047.45, 0.00, 'issued', NULL, '2026-06-03 13:39:20'),
(15, 'INV-2026-0016', 16, '2026-06-01', '2026-06-16', 6148.40, 0.00, 'issued', NULL, '2026-06-03 13:39:20'),
(16, 'INV-2026-0017', 17, '2026-06-02', '2026-06-17', 1528.00, 0.00, 'issued', NULL, '2026-06-03 13:39:20'),
(17, 'INV-2026-0018', 18, '2026-06-03', '2026-06-18', 3298.40, 0.00, 'issued', NULL, '2026-06-03 13:39:20');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int UNSIGNED NOT NULL PRIMARY KEY,
  `order_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` int UNSIGNED NOT NULL,
  `employee_id` int UNSIGNED DEFAULT NULL,
  `order_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `required_date` date DEFAULT NULL,
  `shipped_date` date DEFAULT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled','returned') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `shipping_addr` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_city` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` enum('cash','credit_card','gcash','maya','bank_transfer','cod') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cash',
  `payment_status` enum('unpaid','partial','paid','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `discount_id` smallint UNSIGNED DEFAULT NULL,
  `subtotal` decimal(14,2) NOT NULL DEFAULT '0.00',
  `discount_amt` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_amt` decimal(12,2) NOT NULL DEFAULT '0.00',
  `shipping_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `grand_total` decimal(14,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `order_number`, `customer_id`, `employee_id`, `order_date`, `required_date`, `shipped_date`, `status`, `shipping_addr`, `shipping_city`, `payment_method`, `payment_status`, `discount_id`, `subtotal`, `discount_amt`, `tax_amt`, `shipping_fee`, `grand_total`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'ORD-2026-0001', 2, 2, '2026-01-05 09:00:00', '2026-01-10', '2026-01-08', 'delivered', '123 Main St', 'Makati', 'gcash', 'paid', 1, 11296.00, 1694.40, 0.00, 150.00, 9751.60, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(2, 'ORD-2026-0002', 3, 3, '2026-01-12 10:30:00', '2026-01-17', '2026-01-15', 'delivered', '456 Rizal Street', 'Quezon City', 'bank_transfer', 'paid', 2, 8695.00, 869.50, 0.00, 200.00, 8025.50, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(3, 'ORD-2026-0003', 8, 2, '2026-01-20 14:00:00', '2026-01-25', '2026-01-23', 'delivered', '5 Lacson Street', 'Bacolod City', 'credit_card', 'paid', 1, 15997.00, 2399.55, 0.00, 250.00, 13847.45, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(4, 'ORD-2026-0004', 1, 4, '2026-02-03 11:00:00', '2026-02-08', '2026-02-06', 'delivered', 'Brgy. San Isidro 12', 'Manila', 'cash', 'paid', NULL, 3747.00, 0.00, 0.00, 80.00, 3827.00, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(5, 'ORD-2026-0005', 10, 2, '2026-02-14 09:30:00', '2026-02-19', '2026-02-17', 'delivered', 'Brgy. Guadalupe 3', 'Cebu City', 'maya', 'paid', 1, 22496.00, 3374.40, 0.00, 300.00, 19421.60, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(6, 'ORD-2026-0006', 5, 3, '2026-02-22 13:00:00', '2026-02-27', '2026-02-25', 'delivered', '78 Luna Street', 'Angeles City', 'bank_transfer', 'paid', 2, 7497.00, 749.70, 0.00, 150.00, 6897.30, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(7, 'ORD-2026-0007', 9, 4, '2026-03-05 10:00:00', '2026-03-10', '2026-03-08', 'delivered', '200 Iznart Street', 'Iloilo City', 'gcash', 'paid', 2, 12996.00, 1299.60, 0.00, 200.00, 11896.40, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(8, 'ORD-2026-0008', 6, 5, '2026-03-15 15:00:00', '2026-03-20', NULL, 'cancelled', 'Brgy. Sto. Nino 4', 'Calamba', 'cod', 'unpaid', NULL, 1897.00, 0.00, 0.00, 100.00, 1997.00, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(9, 'ORD-2026-0009', 13, 3, '2026-03-25 09:00:00', '2026-03-30', '2026-03-28', 'delivered', 'Sandawa Road', 'Davao City', 'bank_transfer', 'paid', 2, 17495.00, 1749.50, 0.00, 250.00, 15995.50, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(10, 'ORD-2026-0010', 11, 4, '2026-04-02 11:30:00', '2026-04-07', '2026-04-05', 'delivered', '34 Osmena Blvd.', 'Cebu City', 'credit_card', 'paid', NULL, 4447.00, 0.00, 0.00, 100.00, 4547.00, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(11, 'ORD-2026-0011', 2, 2, '2026-04-10 10:00:00', '2026-04-15', '2026-04-13', 'delivered', '123 Main St', 'Makati', 'gcash', 'paid', 1, 6997.00, 1049.55, 0.00, 150.00, 6097.45, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(12, 'ORD-2026-0012', 15, 5, '2026-04-20 14:00:00', '2026-04-25', '2026-04-23', 'delivered', 'Commonwealth 560', 'Quezon City', 'cash', 'paid', NULL, 2497.00, 0.00, 0.00, 80.00, 2577.00, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(13, 'ORD-2026-0013', 8, 2, '2026-05-01 09:00:00', '2026-05-06', '2026-05-04', 'delivered', '5 Lacson Street', 'Bacolod City', 'maya', 'paid', 1, 19997.00, 2999.55, 0.00, 250.00, 17247.45, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(14, 'ORD-2026-0014', 3, 3, '2026-05-12 11:00:00', '2026-05-17', '2026-05-15', 'delivered', '456 Rizal Street', 'Quezon City', 'bank_transfer', 'paid', 2, 9995.00, 999.50, 0.00, 200.00, 9195.50, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(15, 'ORD-2026-0015', 10, 2, '2026-05-25 13:00:00', '2026-05-30', NULL, 'processing', 'Brgy. Guadalupe 3', 'Cebu City', 'credit_card', 'unpaid', 1, 14997.00, 2249.55, 0.00, 300.00, 13047.45, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(16, 'ORD-2026-0016', 4, 4, '2026-06-01 08:30:00', '2026-06-06', NULL, 'confirmed', '45 Mabini Ave.', 'Pampanga', 'gcash', 'unpaid', 4, 7498.00, 1499.60, 0.00, 150.00, 6148.40, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(17, 'ORD-2026-0017', 7, 5, '2026-06-02 10:00:00', '2026-06-07', NULL, 'pending', '90 Aguinaldo Blvd.', 'Bacoor', 'cod', 'unpaid', NULL, 1448.00, 0.00, 0.00, 80.00, 1528.00, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20'),
(18, 'ORD-2026-0018', 12, 3, '2026-06-03 09:00:00', '2026-06-08', NULL, 'pending', 'JP Laurel Avenue', 'Davao City', 'maya', 'unpaid', 4, 3998.00, 799.60, 0.00, 100.00, 3298.40, NULL, '2026-06-03 13:39:20', '2026-06-03 13:39:20');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `item_id` bigint UNSIGNED NOT NULL PRIMARY KEY,
  `order_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `quantity` int UNSIGNED NOT NULL DEFAULT '1',
  `unit_price` decimal(12,2) NOT NULL,
  `discount_pct` decimal(5,2) NOT NULL DEFAULT '0.00',
  `line_total` decimal(14,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`item_id`, `order_id`, `product_id`, `quantity`, `unit_price`, `discount_pct`, `line_total`) VALUES
(1, 1, 1, 2, 2499.00, 15.00, 4248.30),
(2, 1, 4, 3, 1799.00, 15.00, 4582.95),
(3, 1, 9, 2, 799.00, 15.00, 1356.30),
(4, 2, 5, 5, 899.00, 10.00, 4045.50),
(5, 2, 15, 10, 249.00, 10.00, 2241.00),
(6, 2, 16, 10, 199.00, 10.00, 1791.00),
(7, 2, 17, 1, 849.00, 10.00, 764.10),
(8, 3, 3, 2, 3499.00, 15.00, 5948.30),
(9, 3, 8, 1, 4999.00, 15.00, 4249.15),
(10, 3, 2, 3, 1299.00, 15.00, 3307.95),
(11, 4, 6, 1, 2199.00, 0.00, 2199.00),
(12, 4, 14, 5, 299.00, 0.00, 1495.00),
(13, 5, 3, 2, 3499.00, 15.00, 5948.30),
(14, 5, 12, 1, 5499.00, 15.00, 4674.15),
(15, 5, 10, 3, 649.00, 15.00, 1653.45),
(16, 6, 15, 10, 249.00, 10.00, 2241.00),
(17, 6, 16, 20, 199.00, 10.00, 3582.00),
(18, 6, 17, 2, 849.00, 10.00, 1529.10),
(19, 7, 1, 2, 2499.00, 10.00, 4498.20),
(20, 7, 7, 4, 1299.00, 10.00, 4676.40),
(21, 7, 13, 10, 349.00, 10.00, 3142.80),
(22, 8, 11, 2, 799.00, 0.00, 1598.00),
(23, 8, 14, 1, 299.00, 0.00, 299.00),
(24, 9, 8, 2, 4999.00, 10.00, 8998.20),
(25, 9, 1, 2, 2499.00, 10.00, 4498.20),
(26, 9, 11, 2, 799.00, 10.00, 1438.20),
(27, 10, 5, 3, 899.00, 0.00, 2697.00),
(28, 10, 7, 1, 1299.00, 0.00, 1299.00),
(29, 10, 6, 1, 2199.00, 0.00, 2199.00),
(30, 11, 2, 2, 1299.00, 15.00, 2208.30),
(31, 11, 12, 1, 5499.00, 15.00, 4674.15),
(32, 12, 15, 5, 249.00, 0.00, 1245.00),
(33, 12, 16, 5, 199.00, 0.00, 995.00),
(34, 12, 9, 1, 799.00, 0.00, 799.00),
(35, 13, 3, 2, 3499.00, 15.00, 5948.30),
(36, 13, 8, 1, 4999.00, 15.00, 4249.15),
(37, 13, 4, 5, 1799.00, 15.00, 7645.75),
(38, 14, 1, 2, 2499.00, 10.00, 4498.20),
(39, 14, 12, 1, 5499.00, 10.00, 4949.10),
(40, 15, 8, 1, 4999.00, 15.00, 4249.15),
(41, 15, 3, 2, 3499.00, 15.00, 5948.30),
(42, 15, 10, 6, 649.00, 15.00, 3309.90),
(43, 16, 2, 3, 1299.00, 20.00, 3117.60),
(44, 16, 9, 3, 799.00, 20.00, 1918.80),
(45, 16, 6, 1, 2199.00, 20.00, 1759.20),
(46, 17, 13, 2, 349.00, 0.00, 698.00),
(47, 17, 14, 2, 299.00, 0.00, 598.00),
(48, 17, 11, 1, 799.00, 0.00, 799.00),
(49, 18, 5, 2, 899.00, 20.00, 1438.40),
(50, 18, 7, 1, 1299.00, 20.00, 1039.20),
(51, 18, 12, 1, 5499.00, 0.00, 5499.00);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int UNSIGNED NOT NULL PRIMARY KEY,
  `invoice_id` int UNSIGNED NOT NULL,
  `payment_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `amount` decimal(14,2) NOT NULL,
  `method` enum('cash','credit_card','gcash','maya','bank_transfer','cheque') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_no` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `recorded_by` int UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `invoice_id`, `payment_date`, `amount`, `method`, `reference_no`, `notes`, `recorded_by`) VALUES
(1, 1, '2026-01-08 00:00:00', 9751.60, 'gcash', 'GC20260108001', NULL, 8),
(2, 2, '2026-01-15 00:00:00', 8025.50, 'bank_transfer', 'BT20260115002', NULL, 8),
(3, 3, '2026-01-23 00:00:00', 13847.45, 'credit_card', 'CC20260123003', NULL, 8),
(4, 4, '2026-02-06 00:00:00', 3827.00, 'cash', 'CASH-0004', NULL, 8),
(5, 5, '2026-02-17 00:00:00', 19421.60, 'maya', 'MY20260217005', NULL, 8),
(6, 6, '2026-02-25 00:00:00', 6897.30, 'bank_transfer', 'BT20260225006', NULL, 8),
(7, 7, '2026-03-08 00:00:00', 11896.40, 'gcash', 'GC20260308007', NULL, 8),
(8, 8, '2026-03-28 00:00:00', 15995.50, 'bank_transfer', 'BT20260328009', NULL, 8),
(9, 9, '2026-04-05 00:00:00', 4547.00, 'credit_card', 'CC20260405010', NULL, 8),
(10, 10, '2026-04-13 00:00:00', 6097.45, 'gcash', 'GC20260413011', NULL, 8),
(11, 11, '2026-04-23 00:00:00', 2577.00, 'cash', 'CASH-0012', NULL, 8),
(12, 12, '2026-05-04 00:00:00', 17247.45, 'maya', 'MY20260504013', NULL, 8),
(13, 13, '2026-05-15 00:00:00', 9195.50, 'bank_transfer', 'BT20260515014', NULL, 8);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int UNSIGNED NOT NULL PRIMARY KEY,
  `sku` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` smallint UNSIGNED NOT NULL,
  `supplier_id` smallint UNSIGNED DEFAULT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `cost_price` decimal(12,2) NOT NULL,
  `stock_qty` int NOT NULL DEFAULT '0',
  `reorder_level` int NOT NULL DEFAULT '10',
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'piece',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `sku`, `product_name`, `category_id`, `supplier_id`, `unit_price`, `cost_price`, `stock_qty`, `reorder_level`, `unit`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'ELEC-001', 'Wireless Bluetooth Headphones', 1, 1, 2499.00, 1400.00, 150, 20, 'piece', 'Noise-cancelling over-ear headphones', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(2, 'ELEC-002', 'USB-C Charging Hub 7-Port', 1, 1, 1299.00, 700.00, 200, 30, 'piece', '7-in-1 USB-C hub with HDMI and SD card', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(3, 'ELEC-003', 'Mechanical Gaming Keyboard', 1, 1, 3499.00, 2000.00, 80, 15, 'piece', 'RGB backlit, Cherry MX switches', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(4, 'ELEC-004', 'Portable Power Bank 20000mAh', 1, 1, 1799.00, 950.00, 300, 50, 'piece', 'Dual USB-A + USB-C output', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(5, 'APPR-001', 'Men\'s Polo Shirt (Pack of 3)', 2, 2, 899.00, 450.00, 500, 50, 'pack', 'Classic fit, 100% cotton, assorted colors', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(6, 'APPR-002', 'Women\'s Running Shoes', 2, 2, 2199.00, 1100.00, 120, 20, 'pair', 'Lightweight mesh, cushioned sole', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(7, 'APPR-003', 'Unisex Hoodie Jacket', 2, 2, 1299.00, 650.00, 200, 30, 'piece', 'Fleece-lined, zipper closure', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(8, 'HOME-001', 'Stainless Steel Cookware Set 5pcs', 3, 3, 4999.00, 2800.00, 60, 10, 'set', 'Induction-ready, dishwasher safe', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(9, 'HOME-002', 'LED Desk Lamp with USB Charger', 3, 3, 799.00, 400.00, 250, 40, 'piece', 'Touch dimmer, 3 color temperatures', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(10, 'HOME-003', 'Memory Foam Pillow', 3, 3, 649.00, 300.00, 180, 30, 'piece', 'Ergonomic cervical support', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(11, 'SPRT-001', 'Yoga Mat Non-Slip 6mm', 4, 4, 799.00, 380.00, 200, 30, 'piece', 'Extra-thick, eco-friendly TPE material', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(12, 'SPRT-002', 'Adjustable Dumbbell Set 20kg', 4, 4, 5499.00, 3000.00, 40, 5, 'set', 'Quick-adjust dial, includes stand', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(13, 'FOOD-001', 'Organic Green Tea (50 bags)', 5, 5, 349.00, 180.00, 400, 80, 'box', 'Single-origin, Benguet highlands', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(14, 'FOOD-002', 'Premium Dark Chocolate 85% (250g)', 5, 5, 299.00, 140.00, 500, 100, 'bar', 'Fair-trade certified cacao', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(15, 'OFFC-001', 'A4 Bond Paper 500 sheets', 6, 6, 249.00, 120.00, 800, 100, 'ream', '80gsm, bright white', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(16, 'OFFC-002', 'Ballpen Assorted Colors (50pcs)', 6, 6, 199.00, 90.00, 600, 80, 'box', 'Smooth 0.7mm tip, waterproof ink', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19'),
(17, 'OFFC-003', 'Stapler Heavy Duty 100-sheet', 6, 6, 849.00, 420.00, 100, 20, 'piece', 'For thick documents, includes staples', 1, '2026-06-03 13:39:19', '2026-06-03 13:39:19');

-- --------------------------------------------------------

--
-- Table structure for table `regions`
--

CREATE TABLE `regions` (
  `region_id` tinyint UNSIGNED NOT NULL PRIMARY KEY,
  `region_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Philippines'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `regions`
--

INSERT INTO `regions` (`region_id`, `region_name`, `country`) VALUES
(1, 'National Capital Region', 'Philippines'),
(2, 'Central Luzon', 'Philippines'),
(3, 'CALABARZON', 'Philippines'),
(4, 'Western Visayas', 'Philippines'),
(5, 'Central Visayas', 'Philippines'),
(6, 'Davao Region', 'Philippines');

-- --------------------------------------------------------

--
-- Table structure for table `returns`
--

CREATE TABLE `returns` (
  `return_id` int UNSIGNED NOT NULL PRIMARY KEY,
  `order_id` int UNSIGNED NOT NULL,
  `return_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('requested','approved','rejected','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'requested',
  `refund_amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `handled_by` int UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `returns`
--

INSERT INTO `returns` (`return_id`, `order_id`, `return_date`, `reason`, `status`, `refund_amount`, `handled_by`) VALUES
(1, 8, '2026-03-16 00:00:00', 'Customer cancelled before shipment', 'refunded', 0.00, 9),
(2, 4, '2026-02-12 00:00:00', 'Wrong size delivered', 'refunded', 2199.00, 9);

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `supplier_id` smallint UNSIGNED NOT NULL PRIMARY KEY,
  `company_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_name` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region_id` tinyint UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`supplier_id`, `company_name`, `contact_name`, `email`, `phone`, `address`, `region_id`, `is_active`, `created_at`) VALUES
(1, 'TechGlobal PH Inc.', 'Ramon Santos', 'rsantos@techglobal.ph', '+63-2-8100-0001', 'Makati City, Metro Manila', 1, 1, '2026-06-03 13:39:19'),
(2, 'FashionForward Corp.', 'Liza Cruz', 'lcruz@fashionforward.ph', '+63-2-8100-0002', 'Pasig City, Metro Manila', 1, 1, '2026-06-03 13:39:19'),
(3, 'HomeEssentials PH', 'Mario Dela Cruz', 'mdelacruz@homeess.ph', '+63-32-300-0003', 'Cebu City, Central Visayas', 5, 1, '2026-06-03 13:39:19'),
(4, 'ActiveLife Sports', 'Jen Magsalin', 'jmagsalin@activelife.ph', '+63-33-500-0004', 'Iloilo City, Western Visayas', 4, 1, '2026-06-03 13:39:19'),
(5, 'FreshPack Foods', 'Carlo Tan', 'ctan@freshpack.ph', '+63-82-200-0005', 'Davao City, Davao Region', 6, 1, '2026-06-03 13:39:19'),
(6, 'OfficeMax Philippines', 'Ana Reyes', 'areyes@officemax.ph', '+63-45-400-0006', 'San Fernando, Central Luzon', 2, 1, '2026-06-03 13:39:19');

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_customer_summary`
-- (See below for the actual view)
--
DROP TABLE IF EXISTS `vw_customer_summary`;
CREATE TABLE `vw_customer_summary` (
`id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY
,`customer_id` int unsigned
,`customer_name` varchar(101)
,`customer_type` enum('retail','wholesale','vip')
,`email` varchar(120)
,`region_name` varchar(50)
,`total_orders` bigint
,`lifetime_value` decimal(36,2)
,`last_order_date` datetime
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_low_stock`
-- (See below for the actual view)
--
DROP TABLE IF EXISTS `vw_low_stock`;
CREATE TABLE `vw_low_stock` (
`id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY
,`product_id` int unsigned
,`sku` varchar(30)
,`product_name` varchar(120)
,`category_name` varchar(60)
,`stock_qty` int
,`reorder_level` int
,`unit_price` decimal(12,2)
,`supplier` varchar(100)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_monthly_sales`
-- (See below for the actual view)
--
DROP TABLE IF EXISTS `vw_monthly_sales`;
CREATE TABLE `vw_monthly_sales` (
`id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY
,`sales_month` varchar(7)
,`total_orders` bigint
,`unique_customers` bigint
,`units_sold` decimal(32,0)
,`gross_revenue` decimal(36,2)
,`total_discounts` decimal(34,2)
,`gross_profit` decimal(45,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_outstanding_invoices`
-- (See below for the actual view)
--
DROP TABLE IF EXISTS `vw_outstanding_invoices`;
CREATE TABLE `vw_outstanding_invoices` (
`id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY
,`invoice_number` varchar(20)
,`customer_name` varchar(101)
,`order_number` varchar(20)
,`issued_date` date
,`due_date` date
,`days_overdue` int
,`amount_due` decimal(14,2)
,`amount_paid` decimal(14,2)
,`balance` decimal(14,2)
,`status` enum('draft','issued','paid','overdue','cancelled')
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_sales_rep_performance`
-- (See below for the actual view)
--
DROP TABLE IF EXISTS `vw_sales_rep_performance`;
CREATE TABLE `vw_sales_rep_performance` (
`id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY
,`employee_name` varchar(101)
,`job_title` varchar(80)
,`total_orders` bigint
,`unique_customers` bigint
,`total_revenue` decimal(36,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_top_products`
-- (See below for the actual view)
--
DROP TABLE IF EXISTS `vw_top_products`;
CREATE TABLE `vw_top_products` (
`id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY
,`sku` varchar(30)
,`product_name` varchar(120)
,`category_name` varchar(60)
,`total_units_sold` decimal(32,0)
,`total_revenue` decimal(36,2)
,`total_cost` decimal(44,2)
,`gross_profit` decimal(45,2)
);

-- --------------------------------------------------------

--
-- Structure for view `vw_customer_summary`
--
DROP TABLE IF EXISTS `vw_customer_summary`;
DROP VIEW IF EXISTS `vw_customer_summary`;

CREATE ALGORITHM=UNDEFINED VIEW `vw_customer_summary`  AS SELECT `c`.`customer_id` AS `customer_id`, concat(`c`.`first_name`,' ',`c`.`last_name`) AS `customer_name`, `c`.`customer_type` AS `customer_type`, `c`.`email` AS `email`, `r`.`region_name` AS `region_name`, count(`o`.`order_id`) AS `total_orders`, round(sum(`o`.`grand_total`),2) AS `lifetime_value`, max(`o`.`order_date`) AS `last_order_date` FROM ((`customers` `c` left join `orders` `o` on(((`c`.`customer_id` = `o`.`customer_id`) and (`o`.`status` <> 'cancelled')))) left join `regions` `r` on((`c`.`region_id` = `r`.`region_id`))) GROUP BY `c`.`customer_id` ORDER BY `lifetime_value` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `vw_low_stock`
--
DROP TABLE IF EXISTS `vw_low_stock`;
DROP VIEW IF EXISTS `vw_low_stock`;

CREATE ALGORITHM=UNDEFINED VIEW `vw_low_stock`  AS SELECT `p`.`product_id` AS `product_id`, `p`.`sku` AS `sku`, `p`.`product_name` AS `product_name`, `c`.`category_name` AS `category_name`, `p`.`stock_qty` AS `stock_qty`, `p`.`reorder_level` AS `reorder_level`, `p`.`unit_price` AS `unit_price`, `s`.`company_name` AS `supplier` FROM ((`products` `p` join `categories` `c` on((`p`.`category_id` = `c`.`category_id`))) left join `suppliers` `s` on((`p`.`supplier_id` = `s`.`supplier_id`))) WHERE ((`p`.`stock_qty` <= `p`.`reorder_level`) AND (`p`.`is_active` = 1)) ORDER BY `p`.`stock_qty` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `vw_monthly_sales`
--
DROP TABLE IF EXISTS `vw_monthly_sales`;
DROP VIEW IF EXISTS `vw_monthly_sales`;

CREATE ALGORITHM=UNDEFINED VIEW `vw_monthly_sales`  AS SELECT date_format(`o`.`order_date`,'%Y-%m') AS `sales_month`, count(distinct `o`.`order_id`) AS `total_orders`, count(distinct `o`.`customer_id`) AS `unique_customers`, sum(`oi`.`quantity`) AS `units_sold`, round(sum(`o`.`grand_total`),2) AS `gross_revenue`, round(sum(`o`.`discount_amt`),2) AS `total_discounts`, round((sum(`o`.`grand_total`) - sum((`oi`.`quantity` * `p`.`cost_price`))),2) AS `gross_profit` FROM ((`orders` `o` join `order_items` `oi` on((`o`.`order_id` = `oi`.`order_id`))) join `products` `p` on((`oi`.`product_id` = `p`.`product_id`))) WHERE (`o`.`status` <> 'cancelled') GROUP BY `sales_month` ORDER BY `sales_month` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `vw_outstanding_invoices`
--
DROP TABLE IF EXISTS `vw_outstanding_invoices`;
DROP VIEW IF EXISTS `vw_outstanding_invoices`;

CREATE ALGORITHM=UNDEFINED VIEW `vw_outstanding_invoices`  AS SELECT `inv`.`invoice_number` AS `invoice_number`, concat(`c`.`first_name`,' ',`c`.`last_name`) AS `customer_name`, `o`.`order_number` AS `order_number`, `inv`.`issued_date` AS `issued_date`, `inv`.`due_date` AS `due_date`, (to_days(curdate()) - to_days(`inv`.`due_date`)) AS `days_overdue`, `inv`.`amount_due` AS `amount_due`, `inv`.`amount_paid` AS `amount_paid`, `inv`.`balance` AS `balance`, `inv`.`status` AS `status` FROM ((`invoices` `inv` join `orders` `o` on((`inv`.`order_id` = `o`.`order_id`))) join `customers` `c` on((`o`.`customer_id` = `c`.`customer_id`))) WHERE (`inv`.`status` in ('issued','overdue')) ORDER BY `inv`.`due_date` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `vw_sales_rep_performance`
--
DROP TABLE IF EXISTS `vw_sales_rep_performance`;
DROP VIEW IF EXISTS `vw_sales_rep_performance`;

CREATE ALGORITHM=UNDEFINED VIEW `vw_sales_rep_performance`  AS SELECT concat(`e`.`first_name`,' ',`e`.`last_name`) AS `employee_name`, `e`.`job_title` AS `job_title`, count(distinct `o`.`order_id`) AS `total_orders`, count(distinct `o`.`customer_id`) AS `unique_customers`, round(sum(`o`.`grand_total`),2) AS `total_revenue` FROM (`employees` `e` join `orders` `o` on((`e`.`employee_id` = `o`.`employee_id`))) WHERE (`o`.`status` <> 'cancelled') GROUP BY `e`.`employee_id` ORDER BY `total_revenue` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `vw_top_products`
--
DROP TABLE IF EXISTS `vw_top_products`;
DROP VIEW IF EXISTS `vw_top_products`;

CREATE ALGORITHM=UNDEFINED VIEW `vw_top_products`  AS SELECT `p`.`sku` AS `sku`, `p`.`product_name` AS `product_name`, `c`.`category_name` AS `category_name`, sum(`oi`.`quantity`) AS `total_units_sold`, round(sum(`oi`.`line_total`),2) AS `total_revenue`, round(sum((`oi`.`quantity` * `p`.`cost_price`)),2) AS `total_cost`, round((sum(`oi`.`line_total`) - sum((`oi`.`quantity` * `p`.`cost_price`))),2) AS `gross_profit` FROM (((`order_items` `oi` join `products` `p` on((`oi`.`product_id` = `p`.`product_id`))) join `categories` `c` on((`p`.`category_id` = `c`.`category_id`))) join `orders` `o` on((`oi`.`order_id` = `o`.`order_id`))) WHERE (`o`.`status` <> 'cancelled') GROUP BY `p`.`product_id` ORDER BY `total_revenue` DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
-- Primary key already defined in CREATE TABLE

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_customer_region` (`region_id`);

--
-- Indexes for table `departments`
--
-- Primary key already defined in CREATE TABLE

--
-- Indexes for table `discounts`
--
-- Primary key already defined in CREATE TABLE

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_emp_dept` (`dept_id`),
  ADD KEY `fk_emp_manager` (`manager_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD UNIQUE KEY `order_id` (`order_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `fk_order_customer` (`customer_id`),
  ADD KEY `fk_order_employee` (`employee_id`),
  ADD KEY `fk_order_discount` (`discount_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD KEY `fk_oi_order` (`order_id`),
  ADD KEY `fk_oi_product` (`product_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD KEY `fk_payment_invoice` (`invoice_id`),
  ADD KEY `fk_payment_employee` (`recorded_by`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `fk_product_category` (`category_id`),
  ADD KEY `fk_product_supplier` (`supplier_id`);

--
-- Indexes for table `regions`
--
-- Primary key already defined in CREATE TABLE

--
-- Indexes for table `returns`
--
ALTER TABLE `returns`
  ADD KEY `fk_return_order` (`order_id`),
  ADD KEY `fk_return_employee` (`handled_by`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD KEY `fk_supplier_region` (`region_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` smallint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `dept_id` tinyint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `discounts`
--
ALTER TABLE `discounts`
  MODIFY `discount_id` smallint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `invoice_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `item_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `regions`
--
ALTER TABLE `regions`
  MODIFY `region_id` tinyint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `returns`
--
ALTER TABLE `returns`
  MODIFY `return_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `supplier_id` smallint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `fk_customer_region` FOREIGN KEY (`region_id`) REFERENCES `regions` (`region_id`);

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `fk_emp_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`),
  ADD CONSTRAINT `fk_emp_manager` FOREIGN KEY (`manager_id`) REFERENCES `employees` (`employee_id`);

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_invoice_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_order_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`),
  ADD CONSTRAINT `fk_order_discount` FOREIGN KEY (`discount_id`) REFERENCES `discounts` (`discount_id`),
  ADD CONSTRAINT `fk_order_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_oi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_employee` FOREIGN KEY (`recorded_by`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `fk_payment_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
  ADD CONSTRAINT `fk_product_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON DELETE SET NULL;

--
-- Constraints for table `returns`
--
ALTER TABLE `returns`
  ADD CONSTRAINT `fk_return_employee` FOREIGN KEY (`handled_by`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `fk_return_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`);

--
-- Constraints for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD CONSTRAINT `fk_supplier_region` FOREIGN KEY (`region_id`) REFERENCES `regions` (`region_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
