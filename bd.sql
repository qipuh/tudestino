-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 01-01-2026 a las 00:25:15
-- Versión del servidor: 8.4.3
-- Versión de PHP: 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tudestino`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bookings`
--

CREATE TABLE `bookings` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `propertyId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `guestId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `hostId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `checkIn` date NOT NULL,
  `checkOut` date NOT NULL,
  `guests` int NOT NULL DEFAULT '1',
  `basePrice` decimal(10,2) NOT NULL,
  `cleaningFee` decimal(10,2) DEFAULT '0.00',
  `serviceFee` decimal(10,2) DEFAULT '0.00',
  `totalPrice` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_general_ci DEFAULT 'USD',
  `status` enum('pending','confirmed','cancelled','completed','rejected') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `paymentStatus` enum('pending','paid','refunded','failed') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `paymentIntentId` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `paymentMethod` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `guestNotes` text COLLATE utf8mb4_general_ci,
  `cancellationReason` text COLLATE utf8mb4_general_ci,
  `cancelledBy` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cancelledAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `businesses`
--

CREATE TABLE `businesses` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `ownerId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'URL amigable para el negocio',
  `description` text COLLATE utf8mb4_general_ci NOT NULL,
  `logo` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `coverImage` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `businessType` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Tipo principal de negocio',
  `taxId` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `verificationStatus` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `verificationDocuments` json DEFAULT NULL,
  `address` json NOT NULL COMMENT '{street, city, state, country, zipCode, latitude, longitude}',
  `contactPhone` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contactEmail` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `website` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `operatingHours` json DEFAULT NULL,
  `socialMediaLinks` json DEFAULT NULL,
  `ratingAverage` decimal(2,1) DEFAULT '0.0',
  `reviewCount` int DEFAULT '0',
  `followersCount` int DEFAULT '0',
  `status` enum('draft','pending_verification','active','suspended','inactive') COLLATE utf8mb4_general_ci DEFAULT 'pending_verification',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `business_follows`
--

CREATE TABLE `business_follows` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `userId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `businessId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('active','blocked') COLLATE utf8mb4_general_ci DEFAULT 'active',
  `notificationsEnabled` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `business_photos`
--

CREATE TABLE `business_photos` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `businessId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `caption` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `displayOrder` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `business_reservations`
--

CREATE TABLE `business_reservations` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `businessId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `reservationDate` date NOT NULL,
  `reservationTime` time NOT NULL,
  `numberOfPeople` int NOT NULL,
  `specialRequests` text COLLATE utf8mb4_general_ci,
  `status` enum('pending','confirmed','cancelled','completed') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `confirmationCode` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `business_services`
--

CREATE TABLE `business_services` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `businessId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `serviceType` enum('property','restaurant','entertainment','events','hotel','bar','club','spa','tour','transport','other') COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `status` enum('draft','active','inactive','under_maintenance') COLLATE utf8mb4_general_ci DEFAULT 'draft',
  `isActive` tinyint(1) DEFAULT '1',
  `orderIndex` int DEFAULT '0' COMMENT 'Para ordenar servicios en el perfil',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `settings` json DEFAULT NULL COMMENT 'JSON con configuración específica del servicio (precio, capacidad, amenities, etc)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `business_social_posts`
--

CREATE TABLE `business_social_posts` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `businessId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `caption` text COLLATE utf8mb4_general_ci NOT NULL,
  `media` json NOT NULL COMMENT 'Array of media objects: [{url, type: image|video, thumbnail, alt}]',
  `type` enum('post','reel','story') COLLATE utf8mb4_general_ci DEFAULT 'post',
  `location` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `likesCount` int DEFAULT '0',
  `commentsCount` int DEFAULT '0',
  `sharesCount` int DEFAULT '0',
  `viewsCount` int DEFAULT '0',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comments`
--

CREATE TABLE `comments` (
  `id` int NOT NULL,
  `post_id` int NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `parent_id` int DEFAULT NULL,
  `text` text COLLATE utf8mb4_general_ci NOT NULL,
  `likes_count` int DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comment_likes`
--

CREATE TABLE `comment_likes` (
  `id` int NOT NULL,
  `comment_id` int NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `conversations`
--

CREATE TABLE `conversations` (
  `id` int NOT NULL,
  `user1Id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `user2Id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `businessId` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Si la conversación es con un negocio',
  `bookingId` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lastMessage` text COLLATE utf8mb4_general_ci,
  `lastMessageAt` datetime DEFAULT NULL,
  `unreadCountUser1` int DEFAULT '0',
  `unreadCountUser2` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `countries`
--

CREATE TABLE `countries` (
  `id` int NOT NULL,
  `code` char(2) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ISO 3166-1 alpha-2 code',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `native_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre en idioma local',
  `phone_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código telefónico internacional',
  `flag_emoji` char(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Emoji de bandera',
  `currency_code` char(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Código de moneda ISO 4217',
  `document_types` json DEFAULT NULL COMMENT 'Tipos de documento válidos en el país',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `countries`
--

INSERT INTO `countries` (`id`, `code`, `name`, `native_name`, `phone_code`, `flag_emoji`, `currency_code`, `document_types`, `active`, `created_at`, `updated_at`) VALUES
(1, 'PE', 'Perú', 'Perú', '+51', '🇵🇪', 'PEN', '[\"DNI\", \"Pasaporte\", \"Carnet de Extranjería\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(2, 'MX', 'México', 'México', '+52', '🇲🇽', 'MXN', '[\"INE\", \"Pasaporte\", \"Cédula Profesional\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(3, 'AR', 'Argentina', 'Argentina', '+54', '🇦🇷', 'ARS', '[\"DNI\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(4, 'CL', 'Chile', 'Chile', '+56', '🇨🇱', 'CLP', '[\"RUT\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(5, 'CO', 'Colombia', 'Colombia', '+57', '🇨🇴', 'COP', '[\"Cédula de Ciudadanía\", \"Pasaporte\", \"Cédula de Extranjería\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(6, 'EC', 'Ecuador', 'Ecuador', '+593', '🇪🇨', 'USD', '[\"Cédula\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(7, 'BO', 'Bolivia', 'Bolivia', '+591', '🇧🇴', 'BOB', '[\"Cédula de Identidad\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(8, 'PY', 'Paraguay', 'Paraguay', '+595', '🇵🇾', 'PYG', '[\"Cédula de Identidad\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(9, 'UY', 'Uruguay', 'Uruguay', '+598', '🇺🇾', 'UYU', '[\"Cédula de Identidad\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(10, 'VE', 'Venezuela', 'Venezuela', '+58', '🇻🇪', 'VES', '[\"Cédula de Identidad\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(11, 'BR', 'Brasil', 'Brasil', '+55', '🇧🇷', 'BRL', '[\"CPF\", \"Pasaporte\", \"RG\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(12, 'CR', 'Costa Rica', 'Costa Rica', '+506', '🇨🇷', 'CRC', '[\"Cédula\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(13, 'PA', 'Panamá', 'Panamá', '+507', '🇵🇦', 'PAB', '[\"Cédula\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(14, 'GT', 'Guatemala', 'Guatemala', '+502', '🇬🇹', 'GTQ', '[\"DPI\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(15, 'HN', 'Honduras', 'Honduras', '+504', '🇭🇳', 'HNL', '[\"Identidad\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(16, 'SV', 'El Salvador', 'El Salvador', '+503', '🇸🇻', 'USD', '[\"DUI\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(17, 'NI', 'Nicaragua', 'Nicaragua', '+505', '🇳🇮', 'NIO', '[\"Cédula\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(18, 'DO', 'República Dominicana', 'República Dominicana', '+1-809', '🇩🇴', 'DOP', '[\"Cédula\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(19, 'CU', 'Cuba', 'Cuba', '+53', '🇨🇺', 'CUP', '[\"Carnet de Identidad\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(20, 'US', 'Estados Unidos', 'United States', '+1', '🇺🇸', 'USD', '[\"Driver License\", \"Passport\", \"State ID\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(21, 'CA', 'Canadá', 'Canada', '+1', '🇨🇦', 'CAD', '[\"Driver License\", \"Passport\", \"Health Card\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(22, 'ES', 'España', 'España', '+34', '🇪🇸', 'EUR', '[\"DNI\", \"NIE\", \"Pasaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(23, 'FR', 'Francia', 'France', '+33', '🇫🇷', 'EUR', '[\"CNI\", \"Passeport\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(24, 'GB', 'Reino Unido', 'United Kingdom', '+44', '🇬🇧', 'GBP', '[\"Passport\", \"Driver License\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(25, 'DE', 'Alemania', 'Deutschland', '+49', '🇩🇪', 'EUR', '[\"Personalausweis\", \"Reisepass\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(26, 'IT', 'Italia', 'Italia', '+39', '🇮🇹', 'EUR', '[\"Carta d\'Identità\", \"Passaporto\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04'),
(27, 'PT', 'Portugal', 'Portugal', '+351', '🇵🇹', 'EUR', '[\"Cartão de Cidadão\", \"Passaporte\"]', 1, '2025-12-31 19:12:04', '2025-12-31 19:12:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entertainment`
--

CREATE TABLE `entertainment` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `businessServiceId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `type` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'club, bar, cinema, theater, etc',
  `category` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `address` json DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `priceRange` json DEFAULT NULL COMMENT '{min, max, currency}',
  `operatingHours` json DEFAULT NULL,
  `amenities` json DEFAULT NULL,
  `images` json DEFAULT NULL,
  `ratingAverage` decimal(2,1) DEFAULT '0.0',
  `reviewCount` int DEFAULT '0',
  `status` enum('draft','active','inactive','under_maintenance') COLLATE utf8mb4_general_ci DEFAULT 'active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entertainment_reservations`
--

CREATE TABLE `entertainment_reservations` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `entertainmentId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `userId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `reservationDate` date NOT NULL,
  `reservationTime` time NOT NULL,
  `numberOfPeople` int NOT NULL,
  `totalPrice` decimal(10,2) DEFAULT NULL,
  `specialRequests` text COLLATE utf8mb4_general_ci,
  `status` enum('pending','confirmed','cancelled','completed') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `events`
--

CREATE TABLE `events` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `organizerId` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `organizedBy` enum('user','business') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user',
  `businessServiceId` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `eventDate` date NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `locationType` enum('physical','virtual','hybrid') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'physical',
  `virtualPlatform` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` json DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `organizer` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `currentAttendees` int NOT NULL DEFAULT '0',
  `isFree` tinyint(1) NOT NULL DEFAULT '0',
  `images` json DEFAULT NULL,
  `status` enum('draft','active','inactive','under_maintenance') COLLATE utf8mb4_general_ci DEFAULT 'active' COMMENT 'Estado del evento',
  `isFeatured` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Indica si el evento está activo (campo legacy/compatibilidad)'
) ;

--
-- Volcado de datos para la tabla `events`
--

INSERT INTO `events` (`id`, `organizerId`, `organizedBy`, `businessServiceId`, `name`, `slug`, `description`, `eventDate`, `startTime`, `endTime`, `location`, `city`, `locationType`, `virtualPlatform`, `address`, `category`, `tags`, `organizer`, `capacity`, `currentAttendees`, `isFree`, `images`, `status`, `isFeatured`, `created_at`, `updated_at`, `isActive`) VALUES
('45e9a385-62d3-4e74-8293-4b4826a53e5b', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'user', NULL, 'Caja de Metal', NULL, 'MARDUK en Lima este 29 de Octubre en el C.C. Kantaro! 🤘🏻La legendaria banda sueca de Black Metal celebra los 35 años de \"Panzer Division Marduk\" en su gira Latin America 2025, junto a todos sus himnos clásicos. Una noche intensa, cruda y cargada de blasfemia y oscuridad.🤘🏻 📌 Íconos absolutos del metal extremo, MARDUK llega con toda su potencia satánica para hacer temblar Lima.🔥 🎟️ Entradas ya disponibles en Ticketmaster.\n\n🤘🏻🔥¡No te quedes fuera de este Ritual!🔥🤘🏻', '2026-01-14', '20:00:00', '22:00:00', 'CC Festiva ', NULL, 'physical', NULL, '{\"city\": \"Cajamarca\", \"state\": \"Cajamarca\", \"street\": \"Av. San Martin de Porres, 1423 Cajamarca\", \"country\": \"Perú\", \"latitude\": \"-7.170005\", \"longitude\": \"-78.507544\"}', 'festival', NULL, '', NULL, 0, 0, NULL, 'active', 0, '2025-12-31 20:55:35', '2025-12-31 20:55:35', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `event_images`
--

CREATE TABLE `event_images` (
  `id` int NOT NULL,
  `event_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `caption` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `type` enum('cover','gallery','banner','poster','flyer','venue','other') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'gallery',
  `is_cover` tinyint(1) NOT NULL DEFAULT '0',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `event_images`
--

INSERT INTO `event_images` (`id`, `event_id`, `url`, `caption`, `type`, `is_cover`, `display_order`, `created_at`, `updated_at`) VALUES
(1, '45e9a385-62d3-4e74-8293-4b4826a53e5b', '/uploads/events/images-1767214544203-470133708.jpg', NULL, 'gallery', 0, 0, '2025-12-31 20:55:44', '2025-12-31 20:55:44'),
(2, '45e9a385-62d3-4e74-8293-4b4826a53e5b', '/uploads/events/images-1767214546422-130403702.webp', NULL, 'gallery', 0, 0, '2025-12-31 20:55:46', '2025-12-31 20:55:46'),
(3, '45e9a385-62d3-4e74-8293-4b4826a53e5b', '/uploads/events/images-1767214548806-632631895.jpeg', NULL, 'gallery', 0, 0, '2025-12-31 20:55:48', '2025-12-31 20:55:48'),
(4, '45e9a385-62d3-4e74-8293-4b4826a53e5b', '/uploads/events/images-1767214550748-886254953.jpg', NULL, 'gallery', 0, 0, '2025-12-31 20:55:50', '2025-12-31 20:55:50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `event_registrations`
--

CREATE TABLE `event_registrations` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `event_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ticket_id` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `total_price` decimal(10,2) DEFAULT NULL,
  `registration_date` datetime DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','attended') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `attendee_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Nombre del asistente',
  `attendee_email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Email del asistente',
  `attendee_phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Tel├®fono del asistente',
  `total_amount` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) COLLATE utf8mb4_general_ci DEFAULT 'PEN',
  `payment_status` enum('pending','paid','failed','refunded') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `payment_method` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Ej: card, cash, transfer',
  `transaction_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'ID de transacci├│n del gateway',
  `paid_at` datetime DEFAULT NULL COMMENT 'Fecha de pago confirmado',
  `registration_code` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'C├│digo ├║nico de registro',
  `qr_code` text COLLATE utf8mb4_general_ci COMMENT 'C├│digo QR generado',
  `checked_in` tinyint(1) NOT NULL DEFAULT '0',
  `checked_in_at` datetime DEFAULT NULL,
  `checked_in_by` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Usuario que hizo el check-in',
  `custom_fields` json DEFAULT NULL COMMENT 'Campos adicionales del formulario',
  `special_requests` text COLLATE utf8mb4_general_ci COMMENT 'Solicitudes especiales',
  `dietary_restrictions` text COLLATE utf8mb4_general_ci COMMENT 'Restricciones alimentarias',
  `cancellation_reason` text COLLATE utf8mb4_general_ci,
  `cancelled_at` datetime DEFAULT NULL,
  `reminder_sent` tinyint(1) NOT NULL DEFAULT '0',
  `confirmation_email_sent` tinyint(1) NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_general_ci COMMENT 'Notas internas del organizador'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `event_tickets`
--

CREATE TABLE `event_tickets` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `event_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `ticket_type` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity_available` int DEFAULT NULL,
  `quantity_sold` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'General' COMMENT 'Ej: General, VIP, Estudiante, Early Bird, etc.',
  `description` text COLLATE utf8mb4_general_ci COMMENT 'Descripción del tipo de entrada',
  `status` enum('active','sold_out','paused','inactive') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `is_free` tinyint(1) NOT NULL DEFAULT '0',
  `currency` varchar(3) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PEN',
  `display_order` int NOT NULL DEFAULT '0',
  `min_quantity_per_order` int NOT NULL DEFAULT '1',
  `max_quantity_per_order` int DEFAULT NULL,
  `sold_quantity` int NOT NULL DEFAULT '0',
  `reserved_quantity` int NOT NULL DEFAULT '0',
  `sales_start_date` datetime DEFAULT NULL COMMENT 'Fecha de inicio de ventas',
  `sales_end_date` datetime DEFAULT NULL COMMENT 'Fecha de fin de ventas',
  `includes` json DEFAULT NULL COMMENT 'Lista de lo que incluye la entrada',
  `restrictions` json DEFAULT NULL COMMENT 'Restricciones o requisitos',
  `is_transferable` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Puede transferirse a otra persona',
  `is_refundable` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Permite reembolso',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Visible en el evento',
  `uses_phases` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `event_ticket_phases`
--

CREATE TABLE `event_ticket_phases` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `ticket_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `quantity_available` int DEFAULT NULL,
  `sold_quantity` int NOT NULL DEFAULT '0',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `status` enum('upcoming','active','ended','sold_out','inactive') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'upcoming',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menu_items`
--

CREATE TABLE `menu_items` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `businessId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `category` enum('appetizers','main_courses','desserts','beverages','alcoholic','breakfast','specials') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'main_courses',
  `price` decimal(10,2) NOT NULL,
  `image` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `isAvailable` tinyint(1) DEFAULT '1',
  `isSpecial` tinyint(1) DEFAULT '0',
  `displayOrder` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `messages`
--

CREATE TABLE `messages` (
  `id` int NOT NULL,
  `conversationId` int NOT NULL,
  `senderId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `receiverId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `businessId` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Si el mensaje es de/para un negocio',
  `content` text COLLATE utf8mb4_general_ci NOT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `readAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `userId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('booking_request','booking_confirmed','booking_cancelled','message_received','payment_received','review_received','business_verified','business_suspended','new_follower','post_like','comment_received') COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `message` text COLLATE utf8mb4_general_ci NOT NULL,
  `relatedId` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `relatedType` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `readAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `posts`
--

CREATE TABLE `posts` (
  `id` int NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `content` text COLLATE utf8mb4_general_ci NOT NULL,
  `images` json DEFAULT NULL,
  `type` enum('post','reel','story') COLLATE utf8mb4_general_ci DEFAULT 'post',
  `video_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `likes_count` int DEFAULT '0',
  `comments_count` int DEFAULT '0',
  `shares_count` int DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `post_likes`
--

CREATE TABLE `post_likes` (
  `id` int NOT NULL,
  `post_id` int NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `properties`
--

CREATE TABLE `properties` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `hostId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `businessId` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `accommodationType` enum('apartment','hotel','motel','hostel','room','house','villa','cabin','resort','bed_and_breakfast','guesthouse') COLLATE utf8mb4_general_ci NOT NULL,
  `multipleUnits` tinyint(1) DEFAULT '0',
  `hotelName` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `hotelCategory` int DEFAULT NULL,
  `propertyName` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Nombre del alojamiento (para todos los tipos)',
  `description` text COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Descripción detallada del alojamiento',
  `cancellationPolicy` enum('standard','flexible','moderate','strict','non_refundable','long_stay') COLLATE utf8mb4_general_ci DEFAULT 'standard',
  `addressStreet` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `addressCity` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `addressState` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `addressCountry` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `addressZipCode` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `addressLatitude` decimal(10,8) DEFAULT NULL,
  `addressLongitude` decimal(11,8) DEFAULT NULL,
  `propertyAmenities` json DEFAULT NULL,
  `breakfastIncluded` tinyint(1) DEFAULT '0',
  `parkingType` enum('no','free','paid') COLLATE utf8mb4_general_ci DEFAULT 'no',
  `parkingDetails` json DEFAULT NULL,
  `checkInTime` time DEFAULT '14:00:00',
  `checkOutTime` time DEFAULT '12:00:00',
  `childrenAllowed` tinyint(1) DEFAULT '1',
  `petsAllowed` enum('no','yes_free','yes_paid') COLLATE utf8mb4_general_ci DEFAULT 'no',
  `petFee` decimal(10,2) DEFAULT NULL,
  `petFeePer` enum('day','stay') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `additionalRules` text COLLATE utf8mb4_general_ci,
  `status` enum('draft','published','suspended') COLLATE utf8mb4_general_ci DEFAULT 'published',
  `ratingAverage` decimal(2,1) DEFAULT '0.0',
  `ratingCount` int DEFAULT '0',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `restaurants`
--

CREATE TABLE `restaurants` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `businessServiceId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `cuisineType` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `address` json DEFAULT NULL,
  `operatingHours` json NOT NULL,
  `capacity` int DEFAULT NULL,
  `priceRange` json DEFAULT NULL,
  `contactPhone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contactEmail` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `amenities` json DEFAULT NULL,
  `images` json DEFAULT NULL,
  `ratingAverage` decimal(2,1) DEFAULT '0.0',
  `reviewCount` int DEFAULT '0',
  `status` enum('draft','active','inactive','under_maintenance') COLLATE utf8mb4_general_ci DEFAULT 'active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `restaurant_reservations`
--

CREATE TABLE `restaurant_reservations` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `restaurantId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `userId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `reservationDate` date NOT NULL,
  `reservationTime` time NOT NULL,
  `numberOfPeople` int NOT NULL,
  `specialRequests` text COLLATE utf8mb4_general_ci,
  `status` enum('pending','confirmed','cancelled','completed') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rooms`
--

CREATE TABLE `rooms` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `propertyId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `roomType` enum('single','double','triple','quadruple','suite','junior_suite','family','shared_dormitory','studio','deluxe','executive','penthouse') COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1' COMMENT 'Cantidad de habitaciones de este tipo',
  `guestCapacity` int NOT NULL,
  `beds` json NOT NULL,
  `pricePerNight` decimal(10,2) NOT NULL,
  `amenities` json DEFAULT NULL,
  `images` json DEFAULT NULL,
  `isAvailable` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `service_reviews`
--

CREATE TABLE `service_reviews` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `userId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `serviceId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `serviceType` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `businessId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `rating` int NOT NULL COMMENT '1-5',
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `comment` text COLLATE utf8mb4_general_ci,
  `images` json DEFAULT NULL,
  `isVerified` tinyint(1) DEFAULT '0' COMMENT 'Si la reseña es de una reserva confirmada',
  `likesCount` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `social_comments`
--

CREATE TABLE `social_comments` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `content_type` enum('post','reel') COLLATE utf8mb4_general_ci NOT NULL,
  `content_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `text` text COLLATE utf8mb4_general_ci NOT NULL,
  `likes_count` int DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `social_comments`
--

INSERT INTO `social_comments` (`id`, `user_id`, `content_type`, `content_id`, `text`, `likes_count`, `created_at`, `updated_at`) VALUES
('0fc533f4-1f95-467c-9213-ffe70da10a26', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', 'dfc54297-f888-4992-960e-cafa684232cf', 'hjkhj', 0, '2025-12-31 22:42:33', '2025-12-31 22:42:33'),
('14a5655b-8eaf-40be-b555-07b77d2e4650', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', 'dfc54297-f888-4992-960e-cafa684232cf', '@Edwin Chavez Gamboa sss', 0, '2025-12-31 23:09:51', '2025-12-31 23:09:51'),
('25853e4b-7acc-4166-8664-1d4f30c9e044', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', '54e79881-d8d3-40cd-9c71-b026a6e38904', '@Edwin Chavez Gamboa 33', 0, '2025-12-31 23:30:52', '2025-12-31 23:30:52'),
('3474768d-2353-453d-97f6-655d70af9798', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', 'dfc54297-f888-4992-960e-cafa684232cf', '@Edwin Chavez Gamboa erwrew', 0, '2025-12-31 23:08:04', '2025-12-31 23:08:04'),
('4742abd4-52c6-46a9-a0b7-e455bf66f992', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', '54e79881-d8d3-40cd-9c71-b026a6e38904', '@Edwin Chavez Gamboa sss', 0, '2025-12-31 23:16:38', '2025-12-31 23:16:38'),
('57c3c81a-6d64-4afa-8ce9-9050586d7337', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', 'dfc54297-f888-4992-960e-cafa684232cf', 'sadasdsa', 0, '2025-12-31 23:10:13', '2025-12-31 23:10:13'),
('600e8b58-277d-4d32-b4e3-2e5f9f1696b6', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', '54e79881-d8d3-40cd-9c71-b026a6e38904', '@Edwin Chavez Gamboa ffff', 0, '2025-12-31 23:25:14', '2025-12-31 23:25:14'),
('88b8906f-85f0-40c6-aa3b-5efe8ca452c5', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', '54e79881-d8d3-40cd-9c71-b026a6e38904', '@Edwin Chavez Gamboa asi es', 0, '2025-12-31 23:16:05', '2025-12-31 23:16:05'),
('90f35c62-f1b0-47fe-ac91-aab3c4281349', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', 'dfc54297-f888-4992-960e-cafa684232cf', 'sdad', 0, '2025-12-31 23:10:17', '2025-12-31 23:10:17'),
('a1785b46-5386-4428-ad6d-090e7bfb47c9', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', 'dfc54297-f888-4992-960e-cafa684232cf', 'dsadsad', 0, '2025-12-31 23:10:10', '2025-12-31 23:10:10'),
('a45de1a3-6f80-4f83-8824-a785ee74cad8', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', 'd8187c0d-b803-4730-8a49-878014a64207', 'dfgfdg', 0, '2025-12-31 22:34:10', '2025-12-31 22:34:10'),
('aaaa7d10-a4ec-45f8-ba35-7ee52e483264', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', 'dfc54297-f888-4992-960e-cafa684232cf', 'yiuyiu', 0, '2025-12-31 22:36:06', '2025-12-31 22:36:06'),
('b82a4dcb-0853-4eb7-842f-46789ab3136d', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', 'cd2e6c76-b3c0-4da1-b151-8c1cc375f3c9', 'fdsdsfs', 0, '2025-12-31 22:18:14', '2025-12-31 22:18:14'),
('bac1ac37-9511-4568-b254-e8acd334996a', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', '54e79881-d8d3-40cd-9c71-b026a6e38904', 'se ve hermoso', 0, '2025-12-31 23:11:03', '2025-12-31 23:11:03'),
('c723ef75-2c23-4125-9ce5-2f11eae84bcb', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', 'cd2e6c76-b3c0-4da1-b151-8c1cc375f3c9', '312321', 0, '2025-12-31 22:59:47', '2025-12-31 22:59:47'),
('cbd27415-e175-47dd-ac45-405975cb234e', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', '54e79881-d8d3-40cd-9c71-b026a6e38904', '@Edwin Chavez Gamboa asi es', 0, '2025-12-31 23:15:33', '2025-12-31 23:15:33'),
('d7011aff-1936-422b-8d1d-156efbd5213e', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', 'dfc54297-f888-4992-960e-cafa684232cf', '@Edwin Chavez Gamboa 333', 0, '2025-12-31 23:15:08', '2025-12-31 23:15:08'),
('e5d88e01-1a95-4ed6-b247-4cc90a586928', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', 'dfc54297-f888-4992-960e-cafa684232cf', 'sssssssssss', 0, '2025-12-31 23:10:15', '2025-12-31 23:10:15'),
('f6e9181a-070a-4f5d-946d-4ad67a31bfc6', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', 'dfc54297-f888-4992-960e-cafa684232cf', 'ghkhgkjh', 0, '2025-12-31 22:42:31', '2025-12-31 22:42:31');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `social_comment_likes`
--

CREATE TABLE `social_comment_likes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `social_likes`
--

CREATE TABLE `social_likes` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `content_type` enum('post','reel') COLLATE utf8mb4_general_ci NOT NULL,
  `content_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `social_likes`
--

INSERT INTO `social_likes` (`id`, `user_id`, `content_type`, `content_id`, `created_at`) VALUES
('3de06e9b-602e-4329-abc7-505d1526a1a2', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', '54e79881-d8d3-40cd-9c71-b026a6e38904', '2025-12-31 23:30:55'),
('49e826a5-8eb6-44b5-b7f5-2b3d2f1bfa8a', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', 'cd2e6c76-b3c0-4da1-b151-8c1cc375f3c9', '2025-12-31 23:02:29'),
('e6831b43-d4d3-406e-a5cc-66d19bc26976', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'post', 'd8187c0d-b803-4730-8a49-878014a64207', '2025-12-31 23:03:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `social_posts`
--

CREATE TABLE `social_posts` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `caption` text COLLATE utf8mb4_general_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `media` json NOT NULL COMMENT 'Array of media objects: [{url, type: image|video, thumbnail}]',
  `likes_count` int DEFAULT '0',
  `comments_count` int DEFAULT '0',
  `shares_count` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `social_posts`
--

INSERT INTO `social_posts` (`id`, `user_id`, `caption`, `location`, `media`, `likes_count`, `comments_count`, `shares_count`, `is_active`, `created_at`, `updated_at`) VALUES
('54e79881-d8d3-40cd-9c71-b026a6e38904', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'hola', 'Cajamarca', '[{\"url\": \"/uploads/social/media-1767222441968-913446192.png\", \"type\": \"image\", \"thumbnail\": null}, {\"url\": \"/uploads/social/media-1767222441978-775621823.webp\", \"type\": \"image\", \"thumbnail\": null}, {\"url\": \"/uploads/social/media-1767222441978-364264541.jpg\", \"type\": \"image\", \"thumbnail\": null}]', 1, 6, 0, 1, '2025-12-31 23:07:21', '2025-12-31 23:30:55'),
('cd2e6c76-b3c0-4da1-b151-8c1cc375f3c9', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'dgffdgfd', 'gdfgd', '[{\"url\": \"/uploads/social/media-1767219298471-923200548.jpg\", \"type\": \"image\", \"thumbnail\": null}]', 1, 2, 0, 0, '2025-12-31 22:14:58', '2025-12-31 23:07:36'),
('d8187c0d-b803-4730-8a49-878014a64207', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'gggg', 'cajamarca', '[{\"url\": \"/uploads/social/media-1767219100534-921652344.jpg\", \"type\": \"image\", \"thumbnail\": null}]', 1, 1, 0, 0, '2025-12-31 22:11:40', '2025-12-31 23:07:40'),
('dfc54297-f888-4992-960e-cafa684232cf', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'gggggggggggggg', 'ggggggg', '[{\"url\": \"/uploads/social/media-1767220441409-260759718.jpg\", \"type\": \"image\", \"thumbnail\": null}]', 0, 10, 0, 1, '2025-12-31 22:34:01', '2025-12-31 23:25:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `social_reels`
--

CREATE TABLE `social_reels` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `caption` text COLLATE utf8mb4_general_ci NOT NULL,
  `video_url` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `duration` int DEFAULT NULL COMMENT 'Duration in seconds',
  `location` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `views_count` int DEFAULT '0',
  `likes_count` int DEFAULT '0',
  `comments_count` int DEFAULT '0',
  `shares_count` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `social_reels`
--

INSERT INTO `social_reels` (`id`, `user_id`, `caption`, `video_url`, `thumbnail_url`, `duration`, `location`, `views_count`, `likes_count`, `comments_count`, `shares_count`, `is_active`, `created_at`, `updated_at`) VALUES
('2fc9bcc5-e437-472a-8044-bd9abacaaede', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'reeel', '/uploads/social/video-1767222541585-876746355.mp4', '/uploads/social/thumbnails/video-1767222541585-876746355.mp4.jpg', NULL, 'Cajamarca', 0, 0, 0, 0, 1, '2025-12-31 23:09:01', '2025-12-31 23:09:01'),
('37d9001d-8479-4d9d-bf46-7de15d62a932', '2ab1f42b-a309-427b-b40f-908ea9d27e46', 'AFDASFSAF', '/uploads/social/video-1767219781499-637198406.mp4', '/uploads/social/thumbnails/video-1767219781499-637198406.mp4.jpg', NULL, 'SSS', 0, 0, 0, 0, 1, '2025-12-31 22:23:02', '2025-12-31 22:36:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `userfollows`
--

CREATE TABLE `userfollows` (
  `id` int NOT NULL,
  `followerId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `followingId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `entityType` enum('user','business') COLLATE utf8mb4_general_ci DEFAULT 'user' COMMENT 'user o business',
  `status` enum('active','blocked') COLLATE utf8mb4_general_ci DEFAULT 'active',
  `notificationsEnabled` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('guest','business_owner','admin') COLLATE utf8mb4_general_ci DEFAULT 'guest',
  `phone` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `isVerified` tinyint(1) DEFAULT '0',
  `isActive` tinyint(1) DEFAULT '1',
  `bio` text COLLATE utf8mb4_general_ci,
  `location` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `languages` json DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `identityStatus` enum('pending','verified','rejected') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `identityDocumentType` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `identityDocumentUrl` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `identityVerifiedAt` datetime DEFAULT NULL,
  `emailVerified` tinyint(1) DEFAULT '0',
  `emailVerifiedAt` datetime DEFAULT NULL,
  `phoneVerified` tinyint(1) DEFAULT '0',
  `phoneVerifiedAt` datetime DEFAULT NULL,
  `travelInterests` json DEFAULT NULL,
  `visitedDestinations` json DEFAULT NULL,
  `travelStyle` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `followersCount` int DEFAULT '0',
  `followingCount` int DEFAULT '0',
  `postsCount` int DEFAULT '0',
  `reelsCount` int DEFAULT '0',
  `totalLikes` int DEFAULT '0',
  `isPublicProfile` tinyint(1) DEFAULT '1',
  `allowMessages` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `email_verified` tinyint(1) DEFAULT '0' COMMENT 'Email verificado',
  `email_verification_code` varchar(6) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Código de verificación de email',
  `email_verification_expires` datetime DEFAULT NULL COMMENT 'Expiración del código de email',
  `phone_verified` tinyint(1) DEFAULT '0' COMMENT 'Teléfono verificado',
  `phone_verification_code` varchar(6) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Código de verificación de teléfono',
  `phone_verification_expires` datetime DEFAULT NULL COMMENT 'Expiración del código de teléfono',
  `identity_verified` tinyint(1) DEFAULT '0' COMMENT 'Identidad verificada',
  `verification_status` enum('pending','email_verified','phone_verified','fully_verified','rejected') COLLATE utf8mb4_general_ci DEFAULT 'pending' COMMENT 'Estado general de verificación',
  `first_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Nombre(s)',
  `last_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Apellido paterno',
  `middle_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Apellido materno',
  `birth_date` date DEFAULT NULL COMMENT 'Fecha de nacimiento',
  `nationality_code` char(2) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Código de país de nacionalidad',
  `document_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Tipo de documento',
  `document_number` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Número de documento',
  `document_front_photo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Foto frontal del documento',
  `document_back_photo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Foto trasera del documento',
  `selfie_photo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Foto selfie del usuario',
  `identity_verification_date` datetime DEFAULT NULL COMMENT 'Fecha de verificación de identidad',
  `identity_verified_by` int DEFAULT NULL COMMENT 'Admin que verificó',
  `identity_rejection_reason` text COLLATE utf8mb4_general_ci COMMENT 'Razón de rechazo de verificación',
  `country_code` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `trust_score` int DEFAULT '0' COMMENT 'Puntuación de confianza (0-100)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `username`, `password`, `role`, `phone`, `avatar`, `isVerified`, `isActive`, `bio`, `location`, `languages`, `dateOfBirth`, `identityStatus`, `identityDocumentType`, `identityDocumentUrl`, `identityVerifiedAt`, `emailVerified`, `emailVerifiedAt`, `phoneVerified`, `phoneVerifiedAt`, `travelInterests`, `visitedDestinations`, `travelStyle`, `followersCount`, `followingCount`, `postsCount`, `reelsCount`, `totalLikes`, `isPublicProfile`, `allowMessages`, `createdAt`, `updatedAt`, `email_verified`, `email_verification_code`, `email_verification_expires`, `phone_verified`, `phone_verification_code`, `phone_verification_expires`, `identity_verified`, `verification_status`, `first_name`, `last_name`, `middle_name`, `birth_date`, `nationality_code`, `document_type`, `document_number`, `document_front_photo`, `document_back_photo`, `selfie_photo`, `identity_verification_date`, `identity_verified_by`, `identity_rejection_reason`, `country_code`, `trust_score`) VALUES
('2ab1f42b-a309-427b-b40f-908ea9d27e46', 'Edwin Chavez Gamboa', 'echavez@qipuh.com', 'edwin', '$2a$12$o7WPpLJtu7xgVHsCwJQzTOJj1LseqOTJ40KWtdjVmRENc/AHGjl3C', 'guest', '950140409', '/uploads/social/avatar-1767218925201-530837527.jpg', 0, 1, 'hola soy Edwin', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, 0, NULL, 0, NULL, '[\"Cultura\", \"Gastronomía\"]', '[{\"name\": \"Cajamarca\", \"visitedAt\": \"2025-12-31T21:03:16.521Z\"}]', 'Aventurero', 0, 0, 0, 0, 0, 1, 1, '2025-12-31 20:43:18', '2025-12-31 22:08:45', 1, NULL, NULL, 0, NULL, NULL, 0, 'email_verified', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_social_posts`
--

CREATE TABLE `user_social_posts` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `userId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `caption` text COLLATE utf8mb4_general_ci NOT NULL,
  `media` json NOT NULL,
  `type` enum('post','reel','story') COLLATE utf8mb4_general_ci DEFAULT 'post',
  `location` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `likesCount` int DEFAULT '0',
  `commentsCount` int DEFAULT '0',
  `sharesCount` int DEFAULT '0',
  `viewsCount` int DEFAULT '0',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_property` (`propertyId`),
  ADD KEY `idx_guest` (`guestId`),
  ADD KEY `idx_host` (`hostId`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_dates` (`checkIn`,`checkOut`);

--
-- Indices de la tabla `businesses`
--
ALTER TABLE `businesses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `ownerId` (`ownerId`);

--
-- Indices de la tabla `business_follows`
--
ALTER TABLE `business_follows`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `businessId` (`businessId`);

--
-- Indices de la tabla `business_photos`
--
ALTER TABLE `business_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_business` (`businessId`);

--
-- Indices de la tabla `business_reservations`
--
ALTER TABLE `business_reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_business` (`businessId`),
  ADD KEY `idx_user` (`userId`),
  ADD KEY `idx_date` (`reservationDate`),
  ADD KEY `idx_status` (`status`);

--
-- Indices de la tabla `business_services`
--
ALTER TABLE `business_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`);

--
-- Indices de la tabla `business_social_posts`
--
ALTER TABLE `business_social_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`);

--
-- Indices de la tabla `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comment_id` (`comment_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user1Id` (`user1Id`),
  ADD KEY `user2Id` (`user2Id`),
  ADD KEY `businessId` (`businessId`);

--
-- Indices de la tabla `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_active` (`active`);

--
-- Indices de la tabla `entertainment`
--
ALTER TABLE `entertainment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessServiceId` (`businessServiceId`);

--
-- Indices de la tabla `entertainment_reservations`
--
ALTER TABLE `entertainment_reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `entertainmentId` (`entertainmentId`);

--
-- Indices de la tabla `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `events_organizerId_fk` (`organizerId`),
  ADD KEY `events_businessServiceId_fk` (`businessServiceId`),
  ADD KEY `idx_city` (`city`);

--
-- Indices de la tabla `event_images`
--
ALTER TABLE `event_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id_idx` (`event_id`),
  ADD KEY `type_idx` (`type`),
  ADD KEY `display_order_idx` (`display_order`);

--
-- Indices de la tabla `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `registration_code` (`registration_code`),
  ADD KEY `userId` (`user_id`),
  ADD KEY `eventId` (`event_id`),
  ADD KEY `ticketId` (`ticket_id`),
  ADD KEY `fk_event_registrations_checked_in_by` (`checked_in_by`);

--
-- Indices de la tabla `event_tickets`
--
ALTER TABLE `event_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `eventId` (`event_id`);

--
-- Indices de la tabla `event_ticket_phases`
--
ALTER TABLE `event_ticket_phases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ticket_id` (`ticket_id`),
  ADD KEY `idx_dates` (`start_date`,`end_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indices de la tabla `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_business` (`businessId`),
  ADD KEY `idx_category` (`category`);

--
-- Indices de la tabla `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `senderId` (`senderId`),
  ADD KEY `receiverId` (`receiverId`),
  ADD KEY `businessId` (`businessId`);

--
-- Indices de la tabla `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indices de la tabla `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `post_likes`
--
ALTER TABLE `post_likes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `properties`
--
ALTER TABLE `properties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `properties_host_id` (`hostId`),
  ADD KEY `properties_accommodation_type` (`accommodationType`),
  ADD KEY `properties_status` (`status`),
  ADD KEY `properties_address_city` (`addressCity`),
  ADD KEY `properties_address_country` (`addressCountry`),
  ADD KEY `idx_properties_business_id` (`businessId`);

--
-- Indices de la tabla `restaurants`
--
ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessServiceId` (`businessServiceId`);

--
-- Indices de la tabla `restaurant_reservations`
--
ALTER TABLE `restaurant_reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `restaurantId` (`restaurantId`);

--
-- Indices de la tabla `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rooms_property_id` (`propertyId`),
  ADD KEY `rooms_room_type` (`roomType`),
  ADD KEY `rooms_price_per_night` (`pricePerNight`);

--
-- Indices de la tabla `service_reviews`
--
ALTER TABLE `service_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `businessId` (`businessId`);

--
-- Indices de la tabla `social_comments`
--
ALTER TABLE `social_comments`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `social_comment_likes`
--
ALTER TABLE `social_comment_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_comment_user` (`comment_id`,`user_id`),
  ADD KEY `idx_comment_id` (`comment_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indices de la tabla `social_likes`
--
ALTER TABLE `social_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `social_likes_user_id_content_type_content_id` (`user_id`,`content_type`,`content_id`);

--
-- Indices de la tabla `social_posts`
--
ALTER TABLE `social_posts`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `social_reels`
--
ALTER TABLE `social_reels`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `userfollows`
--
ALTER TABLE `userfollows`
  ADD PRIMARY KEY (`id`),
  ADD KEY `followerId` (`followerId`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indices de la tabla `user_social_posts`
--
ALTER TABLE `user_social_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `countries`
--
ALTER TABLE `countries`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT de la tabla `event_images`
--
ALTER TABLE `event_images`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`guestId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`hostId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `businesses`
--
ALTER TABLE `businesses`
  ADD CONSTRAINT `businesses_ibfk_1` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `business_follows`
--
ALTER TABLE `business_follows`
  ADD CONSTRAINT `business_follows_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `business_follows_ibfk_2` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `business_photos`
--
ALTER TABLE `business_photos`
  ADD CONSTRAINT `business_photos_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `business_reservations`
--
ALTER TABLE `business_reservations`
  ADD CONSTRAINT `business_reservations_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `business_reservations_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `business_services`
--
ALTER TABLE `business_services`
  ADD CONSTRAINT `business_services_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `business_social_posts`
--
ALTER TABLE `business_social_posts`
  ADD CONSTRAINT `business_social_posts_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD CONSTRAINT `comment_likes_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `comment_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`user1Id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`user2Id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `conversations_ibfk_3` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `entertainment`
--
ALTER TABLE `entertainment`
  ADD CONSTRAINT `entertainment_ibfk_1` FOREIGN KEY (`businessServiceId`) REFERENCES `business_services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `entertainment_reservations`
--
ALTER TABLE `entertainment_reservations`
  ADD CONSTRAINT `entertainment_reservations_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `entertainment_reservations_ibfk_2` FOREIGN KEY (`entertainmentId`) REFERENCES `entertainment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_businessServiceId_fk` FOREIGN KEY (`businessServiceId`) REFERENCES `business_services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `events_organizerId_fk` FOREIGN KEY (`organizerId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `event_images`
--
ALTER TABLE `event_images`
  ADD CONSTRAINT `event_images_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD CONSTRAINT `event_registrations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `event_registrations_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `event_registrations_ibfk_3` FOREIGN KEY (`ticket_id`) REFERENCES `event_tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_event_registrations_checked_in_by` FOREIGN KEY (`checked_in_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `event_tickets`
--
ALTER TABLE `event_tickets`
  ADD CONSTRAINT `event_tickets_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `event_ticket_phases`
--
ALTER TABLE `event_ticket_phases`
  ADD CONSTRAINT `fk_phase_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `event_tickets` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiverId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `post_likes`
--
ALTER TABLE `post_likes`
  ADD CONSTRAINT `post_likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `post_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `properties`
--
ALTER TABLE `properties`
  ADD CONSTRAINT `fk_property_business` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`hostId`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `restaurants`
--
ALTER TABLE `restaurants`
  ADD CONSTRAINT `restaurants_ibfk_1` FOREIGN KEY (`businessServiceId`) REFERENCES `business_services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `restaurant_reservations`
--
ALTER TABLE `restaurant_reservations`
  ADD CONSTRAINT `restaurant_reservations_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `restaurant_reservations_ibfk_2` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `service_reviews`
--
ALTER TABLE `service_reviews`
  ADD CONSTRAINT `service_reviews_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `service_reviews_ibfk_2` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `userfollows`
--
ALTER TABLE `userfollows`
  ADD CONSTRAINT `userfollows_ibfk_1` FOREIGN KEY (`followerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `user_social_posts`
--
ALTER TABLE `user_social_posts`
  ADD CONSTRAINT `user_social_posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
