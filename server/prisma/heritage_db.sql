-- ==============================================================
-- SANSKRITI KHOJ - HERITAGE PLATFORM (MYSQL COMPLETE DUMP)
-- Smart India Hackathon - SIH26197
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `heritage_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `heritage_db`;

-- Drop tables in safe order
DROP TABLE IF EXISTS `bookmarks`;
DROP TABLE IF EXISTS `posts`;
DROP TABLE IF EXISTS `media_links`;
DROP TABLE IF EXISTS `places`;
DROP TABLE IF EXISTS `users`;

-- 1. Users Table
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'user',
  `avatar_url` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Places Table
CREATE TABLE `places` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `category` VARCHAR(191) NOT NULL,
  `state` VARCHAR(191) NULL,
  `short_description` VARCHAR(500) NOT NULL,
  `full_story` TEXT NOT NULL,
  `latitude` DOUBLE NOT NULL,
  `longitude` DOUBLE NOT NULL,
  `cover_image` VARCHAR(191) NOT NULL,
  `youtube_video_id` VARCHAR(191) NULL,
  `audio_narration_url` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Media Links Table
CREATE TABLE `media_links` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `place_id` INT NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `youtube_url` VARCHAR(191) NOT NULL,
  `thumbnail_url` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_media_place` FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Posts / Reviews Table
CREATE TABLE `posts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `place_id` INT NOT NULL,
  `rating` INT NOT NULL DEFAULT 5,
  `caption` TEXT NULL,
  `image_url` VARCHAR(191) NOT NULL,
  `is_approved` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_post_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_post_place` FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bookmarks Table
CREATE TABLE `bookmarks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `place_id` INT NOT NULL,
  `visited` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_place` (`user_id`, `place_id`),
  CONSTRAINT `fk_bookmark_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bookmark_place` FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- SEED DATA INSERTIONS
-- ==============================================================

-- Passwords are encrypted with bcrypt for 'password123'
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `avatar_url`) VALUES
(1, 'Admin Heritage', 'admin@heritage.gov.in', '$2a$10$wTf2zD3R4X7Q9d1v5JkKteY4s7q6P0G8uF9n4wJmZ1mE2vX9q8b8W', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
(2, 'Rahul Sharma', 'rahul@example.com', '$2a$10$wTf2zD3R4X7Q9d1v5JkKteY4s7q6P0G8uF9n4wJmZ1mE2vX9q8b8W', 'user', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'),
(3, 'Priya Patel', 'priya@example.com', '$2a$10$wTf2zD3R4X7Q9d1v5JkKteY4s7q6P0G8uF9n4wJmZ1mE2vX9q8b8W', 'user', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80');

INSERT INTO `places` (`id`, `name`, `slug`, `category`, `state`, `short_description`, `full_story`, `latitude`, `longitude`, `cover_image`, `youtube_video_id`) VALUES
(1, 'Taj Mahal', 'taj-mahal', 'monument', 'Uttar Pradesh', 'An ivory-white marble mausoleum on the south bank of the Yamuna river, a UNESCO World Heritage site and symbol of eternal love.', 'Commissioned in 1631 by Mughal Emperor Shah Jahan to house the tomb of his favorite wife, Mumtaz Mahal, the Taj Mahal is widely considered one of the most stunning achievements in Indo-Islamic architecture. Over 20,000 artisans and craftsmen were brought together from across northern India and Central Asia. The white marble was quarried from Makrana in Rajasthan, while 28 types of precious stones were inlaid using the pietra dura technique. The play of light on the white marble changes dramatically from dawn pink to dazzling white at noon, and golden at sunset.', 27.1751, 78.0421, 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80', 'i9E_Bl4E6nE'),
(2, 'Group of Monuments at Hampi', 'hampi-monuments', 'monument', 'Karnataka', 'The magnificent capital of the Vijayanagara Empire situated on the banks of Tungabhadra River, dotted with stone chariots and monoliths.', 'Hampi was the majestic capital of the Vijayanagara Empire in the 14th to 16th century. Chronicles by Persian and European travelers state that Hampi was one of the largest and wealthiest cities in the world. Set against a surreal landscape of giant granite boulders, Hampi contains over 1,600 surviving monuments spread across 41 square kilometers, including the Vijaya Vittala Temple with its world-famous Stone Chariot and musical pillars.', 15.3350, 76.4600, 'https://images.unsplash.com/photo-1600100397608-f010f443b749?auto=format&fit=crop&w=1200&q=80', 'yv52FkL1n_M'),
(3, 'Konark Sun Temple', 'konark-sun-temple', 'temple', 'Odisha', 'A 13th-century monumental chariot of the Sun God Surya, with 24 elaborately carved stone wheels pulled by seven horses.', 'Built around 1250 CE by King Narasimhadeva I of the Eastern Ganga Dynasty, the Sun Temple at Konark is conceived as a cosmic chariot for Surya, the Hindu Sun God. The chariot has 24 intricately carved stone wheels symbolizing the 24 hours of the day, steered by seven stone horses. The spokes of the sundial wheels function as accurate clocks that tell time down to minutes by observing shadow directions.', 19.8876, 86.0945, 'https://images.unsplash.com/photo-1629814421865-c39bebfd68f2?auto=format&fit=crop&w=1200&q=80', 'UeQxP4k7d5Q'),
(4, 'Meenakshi Amman Temple', 'meenakshi-amman-temple', 'temple', 'Tamil Nadu', 'An ancient Dravidian temple in Madurai renowned for its towering multi-tiered Gopurams adorned with thousands of vibrant sculptures.', 'Located on the southern bank of the Vaigai River in Madurai, the temple is dedicated to Goddess Meenakshi and Sundareswarar. The temple complex is enclosed by massive high stone walls and entered through 14 majestic Gopurams, the tallest rising to 52 meters. Inside lies the Hall of Thousand Pillars, famed for carved pillars that emit musical notes when struck.', 9.9195, 78.1193, 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80', 'c2eW4Y8lE6Y'),
(5, 'Varanasi Ghats & Ganga Aarti', 'varanasi-ghats', 'festival', 'Uttar Pradesh', 'One of the oldest continuously inhabited cities in the world, famous for sacred riverfront ghats and mesmerizing evening Ganga Aarti ceremonies.', 'The sacred city lines the western bank of the holy Ganges with 88 ghats used for bathing, prayer ceremonies, and cremation rituals. Dashashwamedh Ghat hosts the world-renowned evening Ganga Aarti ceremony, where young priests hold multi-tiered brass oil lamps accompanied by conch shells, bells, and Vedic chants.', 25.3076, 83.0089, 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80', 'm4X3e27r2L4'),
(6, 'Amer Fort', 'amer-fort-jaipur', 'fort', 'Rajasthan', 'A majestic hilltop fort in Jaipur combining Rajput and Mughal artistry, famed for the sparkling Sheesh Mahal (Mirror Palace).', 'Perched high overlooking Maota Lake, Amer Fort was built in 1592 by Raja Man Singh I. Constructed of red sandstone and marble, it features the breathtaking Sheesh Mahal (Mirror Palace) engineered so that even a single candle reflection would illuminate the entire chamber like starry night skies.', 26.9855, 75.8513, 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80', 'rZcO5jWp_f0'),
(7, 'Qutub Minar Complex', 'qutub-minar', 'monument', 'Delhi', 'A 72.5-meter soaring victory tower of red sandstone, the worlds tallest brick minaret alongside the 1600-year-old rust-resistant Iron Pillar.', 'Founded in 1192 by Qutb-ud-din Aibak, Qutub Minar is a towering 72.5-meter minaret consisting of five distinct storeys. The complex also houses the legendary Iron Pillar of Chandragupta II (4th century CE), a metallurgical marvel that has resisted corrosion for over 1,600 years in open air.', 28.5245, 77.1855, 'https://images.unsplash.com/photo-1592635196078-9fe3d54f2377?auto=format&fit=crop&w=1200&q=80', 'P_j5z2M3gE8');

INSERT INTO `media_links` (`place_id`, `type`, `title`, `youtube_url`, `thumbnail_url`) VALUES
(1, 'documentary', 'The Secrets of Taj Mahal - National Geographic', 'https://www.youtube.com/watch?v=i9E_Bl4E6nE', 'https://img.youtube.com/vi/i9E_Bl4E6nE/hqdefault.jpg'),
(1, 'song', 'Suno Na Sangemarmar (Youngistaan)', 'https://www.youtube.com/watch?v=iYQjC7G8Y_w', 'https://img.youtube.com/vi/iYQjC7G8Y_w/hqdefault.jpg'),
(2, 'documentary', 'Hampi: The Ruined Empire - Archaeological Survey of India', 'https://www.youtube.com/watch?v=yv52FkL1n_M', 'https://img.youtube.com/vi/yv52FkL1n_M/hqdefault.jpg'),
(5, 'song', 'Ganga Aarti Theme - Live from Dashashwamedh', 'https://www.youtube.com/watch?v=m4X3e27r2L4', 'https://img.youtube.com/vi/m4X3e27r2L4/hqdefault.jpg'),
(6, 'movie', 'Jodhaa Akbar - Shot at Amer Fort', 'https://www.youtube.com/watch?v=rZcO5jWp_f0', 'https://img.youtube.com/vi/rZcO5jWp_f0/hqdefault.jpg');

INSERT INTO `posts` (`user_id`, `place_id`, `rating`, `caption`, `image_url`, `is_approved`) VALUES
(2, 1, 5, 'Sunrise view was truly magical! Words and pictures cannot do justice to the symmetrical perfection of this monument.', 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80', 1),
(3, 2, 5, 'Standing beside the Stone Chariot at sunrise gave me goosebumps. Renting a moped to explore the ruins across the river is a must!', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80', 1),
(2, 5, 5, 'Evening Ganga Aarti at Dashashwamedh Ghat will leave you spellbound. Unforgettable spiritual atmosphere.', 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80', 1);
