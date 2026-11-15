-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: mitienda_db
-- ------------------------------------------------------
-- Server version	9.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


--
-- GTID state at the beginning of the backup 
--



--
-- Table structure for table `lotes`
--

DROP TABLE IF EXISTS `lotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lotes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(100) NOT NULL,
  `serial` varchar(100) DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `presentacion` varchar(50) DEFAULT NULL,
  `unidades_por_empaque` int NOT NULL DEFAULT '1',
  `cantidad_empaques` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_unidades` decimal(10,2) NOT NULL DEFAULT '0.00',
  `vencimiento` varchar(50) DEFAULT NULL,
  `stock_minimo` int DEFAULT '5',
  `lote` varchar(50) DEFAULT NULL,
  `fecha_ingreso` varchar(50) DEFAULT NULL,
  `unidades_vendidas` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lotes`
--

LOCK TABLES `lotes` WRITE;
/*!40000 ALTER TABLE `lotes` DISABLE KEYS */;
INSERT INTO `lotes` VALUES (1,'ARR-ROA','8776756758|P:2200','ARROZ ROA','ROA','ABARROTES / GRANOS','PASILLO 1 - ESTANTE 1','PACA',25,22.20,555.00,'2026-11-07',7,'LOT-003','2026-09-30',195),(2,'PAN-MANT004','9826355|P:2500','PAN  MANTEQUILLA','TU PAN','PANADERÍA Y GALLETAS','PASILLO 1 - ESTANTE 4','UNIDAD',1,8.00,8.00,'2026-10-03',15,'LOT-004','2026-09-30',22),(4,'L-ALQ123','98786875|P:6000','LECHE','ALQUERÍA','LÁCTEOS, MANTEQUILLAS Y HUEVOS','REFRIGERADOR 1','PACA',6,17.50,105.00,'2026-10-03',15,'LOT-007','2026-10-01',15),(5,'CHIP-D1234','97878976|P:9500','DETODITO ´PICANTE X 850G','CHEETOS','SNACKS Y MECATOS','PASILLO 1 - ESTANTE 7','PAQUETE',20,3.00,74.00,'2026-11-25',20,'LOTE-235','2026-11-02',0),(6,'CHIP-D1234','8776756758|P:7900','DETODITO ´PICANTE X 850G','CHEETOS','SNACKS Y MECATOS','PASILLO 1 - ESTANTE 1','CARTONES',15,4.87,73.00,'2026-11-26',5,'LOT-007','2026-11-02',2),(7,'HUEVO-876','786756756|P:500','HUEVOS KIKES','KIKES','LÁCTEOS, MANTEQUILLAS Y HUEVOS','PASILLO 2 - ESTANTE 1','CARTONES',30,9.17,275.00,'2026-12-03',30,'LOT-0016','2026-11-02',10);
/*!40000 ALTER TABLE `lotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos`
--

DROP TABLE IF EXISTS `movimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) NOT NULL,
  `fecha` varchar(50) NOT NULL,
  `cantidad_unds` decimal(10,2) NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `id_lote` int NOT NULL,
  `id_usuario` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_movimiento_lote` (`id_lote`),
  KEY `fk_movimiento_usuario` (`id_usuario`),
  CONSTRAINT `fk_movimiento_lote` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_movimiento_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos`
--

LOCK TABLES `movimientos` WRITE;
/*!40000 ALTER TABLE `movimientos` DISABLE KEYS */;
INSERT INTO `movimientos` VALUES (1,'ENTRADA','2026-11-02',100.00,'Entrada de Mercancía / Recepción',5,2),(2,'SALIDA','2026-11-02',20.00,'Venta Directa en Mostrador',5,2),(3,'SALIDA','2026-11-02',2.00,'Venta Directa en Mostrador',4,2),(4,'SALIDA','2026-11-02',2.00,'Venta Directa en Mostrador',5,2),(5,'SALIDA','2026-11-02',4.00,'Venta Directa en Mostrador',5,2),(6,'ENTRADA','2026-11-02',75.00,'Entrada de Mercancía / Recepción',6,2),(7,'SALIDA','2026-11-02',2.00,'Venta Directa en Mostrador',6,2),(8,'ENTRADA','2026-11-02',300.00,'Entrada de Mercancía / Recepción',7,2),(9,'SALIDA','2026-11-02',20.00,'Venta Directa en Mostrador',7,2);
/*!40000 ALTER TABLE `movimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL,
  `documento` varchar(50) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `correo` varchar(150) DEFAULT 'No registrado',
  `telefono` varchar(50) DEFAULT 'No registrado',
  `direccion` varchar(255) DEFAULT 'No registrada',
  `edad` int DEFAULT NULL,
  `clave` varchar(255) NOT NULL,
  `rol` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (2,'apaternina','1047423968','anibal paternina','anibalpaternina@mitienda.com','3013526937','cra 29 calle 53-73',35,'12345678','SuperAdmin'),(3,'jaiderp','9837447','jaider paternina','jaider@mitienda.com','3009887766','la maria',26,'123456','Operador Bodega'),(4,'lsierra','1047445956','luz sierra','lsierra@mitienda.com','300362346','mz:10 lt:56',34,'L123456','Usuario Consulta'),(7,'emma','786786756','emma paternina','No registrado','0979867856','No registrada',27,'12345678','Usuario Consulta');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-14 18:57:39
