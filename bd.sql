-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 16-12-2025 a las 03:51:38
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
  `serviceId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `serviceType` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'property, restaurant, entertainment, event',
  `userId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `businessId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `checkIn` date NOT NULL,
  `checkOut` date DEFAULT NULL COMMENT 'Para propiedades y hoteles',
  `reservationDate` date DEFAULT NULL COMMENT 'Para restaurantes y entretenimiento',
  `reservationTime` time DEFAULT NULL,
  `guests` int NOT NULL DEFAULT '1',
  `basePrice` decimal(10,2) NOT NULL,
  `serviceFee` decimal(10,2) DEFAULT '0.00',
  `taxes` decimal(10,2) DEFAULT '0.00',
  `totalPrice` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_general_ci DEFAULT 'USD',
  `status` enum('pending','confirmed','cancelled','completed','rejected') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `paymentStatus` enum('pending','paid','refunded','failed') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `paymentIntentId` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `paymentMethod` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `specialRequests` text COLLATE utf8mb4_general_ci,
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

--
-- Volcado de datos para la tabla `businesses`
--

INSERT INTO `businesses` (`id`, `ownerId`, `name`, `slug`, `description`, `logo`, `coverImage`, `businessType`, `taxId`, `verificationStatus`, `verificationDocuments`, `address`, `contactPhone`, `contactEmail`, `website`, `operatingHours`, `socialMediaLinks`, `ratingAverage`, `reviewCount`, `followersCount`, `status`, `isActive`, `createdAt`, `updatedAt`) VALUES
('442e02f2-502f-4f00-a0a7-7651153d686b', 'a7c2fe86-5d03-46cc-8f54-6b4c5e52e504', 'Restaurant Chorrillano', 'restaurant-chorrillano', 'restaurante chorrillano en cajamarca', 'images-1765832131458-808018664.jpeg', '19-1765832137161-662442407.jpg', 'restaurant', NULL, 'pending', NULL, '{\"city\": \"Cajamarca\", \"state\": \"Cajamarca\", \"street\": \"Av. San Martin de Porres, 1423 Cajamarca\", \"country\": \"Perú\", \"zipCode\": \"06002\", \"latitude\": -7.1595, \"longitude\": -78.5125}', '', NULL, NULL, NULL, NULL, 0.0, 0, 0, 'active', 1, '2025-12-15 15:39:22', '2025-12-15 20:55:39'),
('68e3cdeb-b28d-47d8-a1fc-4869451c7143', 'a7c2fe86-5d03-46cc-8f54-6b4c5e52e504', 'Hotel Paraiso', 'hotel-paraiso', 'Este es el hotel paraiso', '1-1765813182216-592177050.jpeg', '19-1765813188720-426965213.jpg', 'hotel', NULL, 'pending', NULL, '{\"city\": \"Cajamarca\", \"state\": \"Cajamarca\", \"street\": \"Av. San Martin de Porres, 1423 Cajamarca\", \"country\": \"Perú\", \"zipCode\": \"06002\", \"latitude\": null, \"longitude\": null}', '', NULL, NULL, NULL, NULL, 0.0, 0, 0, 'pending_verification', 1, '2025-12-15 13:48:13', '2025-12-15 15:39:51'),
('f7e71cf1-8160-4e4c-ae2a-eb23db6d9ba0', 'a7c2fe86-5d03-46cc-8f54-6b4c5e52e504', 'Disco Bar', 'disco-bar', 'esta es una discoteca', '20-1765832738965-749817949.jpg', '20-1765832743279-117714528.jpg', 'entertainment', NULL, 'pending', NULL, '{\"city\": \"Cajamarca\", \"state\": \"Cajamarca\", \"street\": \"Av. San Martin de Porres 1423\", \"country\": \"Perú\", \"zipCode\": \"06002\", \"latitude\": \"-7.173949\", \"longitude\": \"-78.498165\"}', '', NULL, NULL, NULL, NULL, 0.0, 0, 0, 'pending_verification', 1, '2025-12-15 21:05:29', '2025-12-15 21:05:47');

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
  `businessServiceId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `eventDate` date NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `address` json DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `organizer` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `images` json DEFAULT NULL,
  `status` enum('draft','active','inactive','under_maintenance') COLLATE utf8mb4_general_ci DEFAULT 'active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `event_registrations`
--

CREATE TABLE `event_registrations` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `eventId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `userId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `ticketId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `totalPrice` decimal(10,2) NOT NULL,
  `registrationDate` datetime DEFAULT (now()),
  `status` enum('pending','confirmed','cancelled','attended') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `event_tickets`
--

CREATE TABLE `event_tickets` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `eventId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `ticketType` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantityAvailable` int NOT NULL,
  `quantitySold` int DEFAULT '0',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menu_categories`
--

CREATE TABLE `menu_categories` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `restaurantId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `displayOrder` int DEFAULT '0',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menu_items`
--

CREATE TABLE `menu_items` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `categoryId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `price` decimal(10,2) NOT NULL,
  `isAvailable` tinyint(1) DEFAULT '1',
  `isVegetarian` tinyint(1) DEFAULT '0',
  `isSpicy` tinyint(1) DEFAULT '0',
  `displayOrder` int DEFAULT '0',
  `imageUrl` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
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

--
-- Volcado de datos para la tabla `properties`
--

INSERT INTO `properties` (`id`, `hostId`, `accommodationType`, `multipleUnits`, `hotelName`, `hotelCategory`, `propertyName`, `description`, `cancellationPolicy`, `addressStreet`, `addressCity`, `addressState`, `addressCountry`, `addressZipCode`, `addressLatitude`, `addressLongitude`, `propertyAmenities`, `breakfastIncluded`, `parkingType`, `parkingDetails`, `checkInTime`, `checkOutTime`, `childrenAllowed`, `petsAllowed`, `petFee`, `petFeePer`, `additionalRules`, `status`, `ratingAverage`, `ratingCount`, `isActive`, `createdAt`, `updatedAt`) VALUES
('55319087-ca76-4370-874b-dbe1269a5358', 'a7c2fe86-5d03-46cc-8f54-6b4c5e52e504', 'hotel', 1, 'Hotel Paraiso', NULL, 'Hotel Paraiso', 'Este es el hotel paraiso', 'standard', 'Av. San Martin de Porres, 1423 Cajamarca', 'Cajamarca', 'Cajamarca', 'Perú', '06002', -7.16190000, -78.51280000, '[\"wifi\"]', 0, 'no', NULL, '14:00:00', '12:00:00', 1, 'no', NULL, NULL, NULL, 'published', 0.0, 0, 1, '2025-12-15 13:52:40', '2025-12-15 13:52:40');

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

--
-- Volcado de datos para la tabla `rooms`
--

INSERT INTO `rooms` (`id`, `propertyId`, `roomType`, `name`, `quantity`, `guestCapacity`, `beds`, `pricePerNight`, `amenities`, `images`, `isAvailable`, `createdAt`, `updatedAt`) VALUES
('08ac131b-bf79-4e32-ab35-4ddb42e48d7a', '55319087-ca76-4370-874b-dbe1269a5358', 'double', 'Habitación Doble', 5, 2, '[{\"type\": \"queen_bed\", \"count\": 1}]', 180.00, '[\"tv\", \"wifi\", \"private_bathroom\"]', '[\"1-1765806757681-524226823.jpg\", \"1-1765806757685-426349618.png\", \"1-1765806757691-335692733.webp\", \"2-1765806757691-559080806.jpg\"]', 1, '2025-12-15 13:52:40', '2025-12-15 13:52:40');

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
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `userId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `contentType` enum('user_post','user_reel','business_post','business_reel','service') COLLATE utf8mb4_general_ci NOT NULL,
  `contentId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `text` text COLLATE utf8mb4_general_ci NOT NULL,
  `likesCount` int DEFAULT '0',
  `createdAt` datetime DEFAULT (now()),
  `updatedAt` datetime DEFAULT (now())
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `social_likes`
--

CREATE TABLE `social_likes` (
  `id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `userId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `contentType` enum('user_post','user_reel','business_post','business_reel','service') COLLATE utf8mb4_general_ci NOT NULL,
  `contentId` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime DEFAULT (now())
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `username`, `password`, `role`, `phone`, `avatar`, `isVerified`, `isActive`, `bio`, `location`, `languages`, `dateOfBirth`, `identityStatus`, `identityDocumentType`, `identityDocumentUrl`, `identityVerifiedAt`, `emailVerified`, `emailVerifiedAt`, `phoneVerified`, `phoneVerifiedAt`, `travelInterests`, `visitedDestinations`, `travelStyle`, `followersCount`, `followingCount`, `postsCount`, `reelsCount`, `totalLikes`, `isPublicProfile`, `allowMessages`, `createdAt`, `updatedAt`) VALUES
('a7c2fe86-5d03-46cc-8f54-6b4c5e52e504', 'Edwin Chavez', 'quipuh@gmail.com', NULL, '$2a$12$a.Bl7FHdcjlpuVW7S6bQJuwaD7SDs4BCFYsIDhfpMMQ.sWK8MaMLe', 'business_owner', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, 0, 0, 0, 0, 0, 1, 1, '2025-12-15 01:24:09', '2025-12-15 01:24:09'),
('cd3e094f-d950-11f0-8aae-e454e870e666', 'Juan Test Business', 'juan@test.com', NULL, 'a\0.', 'business_owner', NULL, NULL, 1, 1, NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, 0, 0, 0, 0, 0, 1, 1, '2025-12-14 19:55:51', '2025-12-14 19:55:51');

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
  ADD KEY `userId` (`userId`),
  ADD KEY `businessId` (`businessId`);

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
  ADD KEY `businessServiceId` (`businessServiceId`);

--
-- Indices de la tabla `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `eventId` (`eventId`),
  ADD KEY `ticketId` (`ticketId`);

--
-- Indices de la tabla `event_tickets`
--
ALTER TABLE `event_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `eventId` (`eventId`);

--
-- Indices de la tabla `menu_categories`
--
ALTER TABLE `menu_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `restaurantId` (`restaurantId`);

--
-- Indices de la tabla `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoryId` (`categoryId`);

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
  ADD KEY `properties_address_country` (`addressCountry`);

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indices de la tabla `social_likes`
--
ALTER TABLE `social_likes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

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
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`businessServiceId`) REFERENCES `business_services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD CONSTRAINT `event_registrations_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `event_registrations_ibfk_2` FOREIGN KEY (`eventId`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `event_registrations_ibfk_3` FOREIGN KEY (`ticketId`) REFERENCES `event_tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `event_tickets`
--
ALTER TABLE `event_tickets`
  ADD CONSTRAINT `event_tickets_ibfk_1` FOREIGN KEY (`eventId`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `menu_categories`
--
ALTER TABLE `menu_categories`
  ADD CONSTRAINT `menu_categories_ibfk_1` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `menu_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
-- Filtros para la tabla `social_comments`
--
ALTER TABLE `social_comments`
  ADD CONSTRAINT `social_comments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `social_likes`
--
ALTER TABLE `social_likes`
  ADD CONSTRAINT `social_likes_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
