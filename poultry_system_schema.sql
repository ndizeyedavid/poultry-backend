-- Active: 1784986557756@@ib2zgu.h.filess.io@3307@poultry_nowexactam
CREATE DATABASE IF NOT EXISTS poultry_system
    DEFAULT CHARACTER SET = 'utf8mb4';

USE poultry_system;

-- Table structure for table `users` (farmer accounts)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'farmer',
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
-- Table structure for table `outputs`
CREATE TABLE IF NOT EXISTS `outputs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `gpio` VARCHAR(111) NOT NULL,
  `state` INT(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Fan on physical GPIO 19, LED/Heater on physical GPIO 14
INSERT INTO `outputs` (`gpio`, `state`)
SELECT '19', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `outputs` WHERE `gpio` = '19');

INSERT INTO `outputs` (`gpio`, `state`)
SELECT '14', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `outputs` WHERE `gpio` = '14');

-- Table structure for table `tbl_temperature`
CREATE TABLE IF NOT EXISTS `tbl_temperature` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `temperature` INT(11) NOT NULL,
  `humidity` INT(11) NOT NULL,
  `gaz` INT(11) NOT NULL,
  `added_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table Data [tbl_temperature]
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (1, 20, 100, 43, '2026-07-25 00:00:00');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (2, 29, 38, 0, '2026-07-27 17:47:46');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (3, 29, 38, 0, '2026-07-27 17:48:09');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (4, 29, 38, 0, '2026-07-27 17:48:32');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (5, 29, 38, 0, '2026-07-27 17:49:18');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (6, 29, 37, 0, '2026-07-27 17:49:41');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (7, 29, 37, 0, '2026-07-27 17:50:00');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (8, 29, 38, 0, '2026-07-27 17:50:29');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (9, 29, 38, 0, '2026-07-27 17:50:52');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (10, 29, 38, 0, '2026-07-27 17:51:16');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (11, 29, 38, 0, '2026-07-27 17:51:39');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (12, 29, 38, 0, '2026-07-27 17:52:02');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (13, 29, 38, 0, '2026-07-27 17:52:25');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (14, 29, 38, 0, '2026-07-27 17:52:45');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (15, 29, 38, 0, '2026-07-27 17:52:52');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (16, 29, 38, 0, '2026-07-27 17:53:06');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (17, 29, 38, 0, '2026-07-27 17:53:20');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (18, 28, 38, 0, '2026-07-27 17:53:35');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (19, 28, 38, 0, '2026-07-27 17:53:50');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (20, 28, 38, 0, '2026-07-27 17:54:07');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (21, 28, 38, 0, '2026-07-27 17:54:22');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (22, 28, 39, 0, '2026-07-27 17:54:37');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (23, 28, 38, 0, '2026-07-27 17:55:08');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (24, 28, 38, 0, '2026-07-27 17:55:35');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (25, 28, 39, 0, '2026-07-27 17:55:59');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (26, 28, 40, 0, '2026-07-27 17:58:41');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (27, 28, 40, 0, '2026-07-27 17:59:05');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (28, 28, 39, 0, '2026-07-27 17:59:30');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (29, 28, 39, 0, '2026-07-27 17:59:54');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (30, 28, 38, 0, '2026-07-27 18:00:00');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (31, 28, 38, 0, '2026-07-27 18:00:36');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (32, 28, 39, 0, '2026-07-27 18:00:59');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (33, 28, 41, 0, '2026-07-28 14:43:00');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (34, 28, 42, 0, '2026-07-28 14:43:15');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (35, 28, 41, 0, '2026-07-28 14:43:30');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (36, 28, 41, 0, '2026-07-28 14:43:44');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (37, 28, 40, 0, '2026-07-28 14:43:59');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (38, 28, 40, 0, '2026-07-28 14:44:13');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (39, 28, 42, 0, '2026-07-28 14:44:37');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (40, 28, 41, 0, '2026-07-28 14:44:51');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (41, 29, 41, 0, '2026-07-28 14:45:06');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (42, 29, 41, 0, '2026-07-28 14:45:21');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (43, 29, 46, 0, '2026-07-28 14:45:36');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (44, 29, 44, 0, '2026-07-28 14:45:50');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (45, 29, 42, 0, '2026-07-28 14:46:05');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (46, 29, 41, 0, '2026-07-28 14:46:21');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (47, 29, 41, 0, '2026-07-28 14:46:35');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (48, 29, 40, 0, '2026-07-28 14:46:54');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (49, 29, 40, 0, '2026-07-28 14:47:09');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (50, 29, 41, 0, '2026-07-28 14:47:23');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (51, 29, 41, 0, '2026-07-28 14:47:38');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (52, 29, 41, 0, '2026-07-28 14:47:52');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (53, 29, 40, 0, '2026-07-28 14:48:19');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (54, 29, 40, 0, '2026-07-28 14:48:35');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (55, 29, 40, 0, '2026-07-28 14:48:52');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (56, 29, 40, 0, '2026-07-28 14:49:07');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (57, 29, 40, 0, '2026-07-28 14:49:22');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (58, 29, 40, 0, '2026-07-28 14:49:37');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (59, 29, 40, 0, '2026-07-28 14:49:51');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (60, 28, 40, 0, '2026-07-28 14:50:06');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (61, 28, 40, 0, '2026-07-28 14:50:21');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (62, 28, 40, 0, '2026-07-28 14:50:36');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (63, 28, 40, 0, '2026-07-28 14:50:51');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (64, 28, 40, 0, '2026-07-28 14:51:05');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (65, 28, 40, 0, '2026-07-28 14:51:39');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (66, 29, 49, 0, '2026-07-28 14:52:04');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (67, 28, 43, 0, '2026-07-28 14:52:28');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (68, 28, 42, 0, '2026-07-28 14:52:51');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (69, 28, 42, 0, '2026-07-28 14:53:18');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (70, 28, 41, 0, '2026-07-28 14:53:32');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (71, 28, 41, 0, '2026-07-28 14:53:55');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (72, 28, 41, 0, '2026-07-28 14:54:20');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (73, 28, 41, 0, '2026-07-28 14:54:50');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (74, 28, 40, 0, '2026-07-28 14:55:13');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (75, 28, 42, 0, '2026-07-28 14:55:36');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (76, 30, 41, 0, '2026-07-29 09:34:17');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (77, 30, 41, 0, '2026-07-29 09:34:32');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (78, 30, 42, 0, '2026-07-29 09:34:55');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (79, 30, 42, 0, '2026-07-29 09:35:10');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (80, 30, 43, 0, '2026-07-29 09:35:51');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (81, 30, 43, 0, '2026-07-29 09:36:06');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (82, 30, 43, 0, '2026-07-29 09:36:20');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (83, 30, 43, 0, '2026-07-29 09:36:30');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (84, 30, 43, 0, '2026-07-29 09:36:45');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (85, 30, 44, 0, '2026-07-29 09:37:00');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (86, 30, 44, 0, '2026-07-29 09:37:15');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (87, 29, 43, 0, '2026-07-29 09:37:31');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (88, 29, 43, 0, '2026-07-29 09:37:46');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (89, 29, 43, 0, '2026-07-29 09:38:14');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (90, 29, 43, 0, '2026-07-29 09:38:44');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (91, 29, 48, 0, '2026-07-29 09:39:05');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (92, 29, 46, 0, '2026-07-29 09:39:17');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (93, 29, 44, 0, '2026-07-29 09:40:55');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (94, 29, 44, 0, '2026-07-29 09:41:40');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (95, 29, 44, 0, '2026-07-29 09:42:04');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (96, 29, 44, 0, '2026-07-29 09:42:23');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (97, 29, 44, 0, '2026-07-29 09:43:04');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (98, 29, 44, 0, '2026-07-29 09:43:27');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (99, 29, 43, 0, '2026-07-29 09:43:49');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (100, 29, 43, 0, '2026-07-29 09:44:13');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (101, 29, 44, 0, '2026-07-29 09:44:36');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (102, 29, 45, 0, '2026-07-29 09:45:00');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (103, 29, 45, 0, '2026-07-29 09:45:22');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (104, 29, 48, 0, '2026-07-29 09:45:45');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (105, 29, 51, 0, '2026-07-29 09:46:09');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (106, 29, 46, 0, '2026-07-29 09:46:35');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (107, 29, 46, 0, '2026-07-29 09:46:58');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (108, 29, 44, 0, '2026-07-29 09:47:09');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (109, 29, 44, 0, '2026-07-29 09:47:44');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (110, 30, 43, 0, '2026-07-29 09:47:49');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (111, 29, 43, 0, '2026-07-29 09:48:09');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (112, 30, 43, 0, '2026-07-29 09:48:24');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (113, 30, 43, 0, '2026-07-29 09:48:39');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (114, 30, 43, 0, '2026-07-29 09:49:08');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (115, 30, 43, 0, '2026-07-29 09:49:36');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (116, 30, 44, 0, '2026-07-29 09:49:45');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (117, 30, 44, 0, '2026-07-29 09:50:00');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (118, 30, 45, 0, '2026-07-29 09:50:15');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (119, 30, 44, 0, '2026-07-29 09:50:30');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (120, 30, 45, 0, '2026-07-29 09:50:45');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (121, 30, 44, 0, '2026-07-29 09:51:00');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (122, 30, 43, 0, '2026-07-29 09:51:29');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (123, 30, 43, 0, '2026-07-29 09:51:59');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (124, 30, 43, 0, '2026-07-29 09:52:22');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (125, 30, 42, 0, '2026-07-29 09:52:46');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (126, 30, 43, 0, '2026-07-29 09:53:09');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (127, 30, 45, 0, '2026-07-29 09:53:33');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (128, 30, 43, 0, '2026-07-29 09:54:17');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (129, 30, 43, 0, '2026-07-29 09:54:44');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (130, 30, 43, 0, '2026-07-29 09:55:08');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (131, 30, 43, 0, '2026-07-29 09:55:32');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (132, 30, 43, 0, '2026-07-29 09:55:55');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (133, 30, 43, 0, '2026-07-29 09:56:18');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (134, 30, 42, 0, '2026-07-29 09:56:42');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (135, 29, 42, 0, '2026-07-29 09:57:05');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (136, 29, 42, 0, '2026-07-29 09:57:28');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (137, 29, 42, 0, '2026-07-29 09:57:40');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (138, 29, 42, 0, '2026-07-29 09:57:55');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (139, 29, 42, 0, '2026-07-29 09:58:10');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (140, 29, 42, 0, '2026-07-29 09:58:25');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (141, 29, 42, 0, '2026-07-29 09:58:39');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (142, 29, 42, 0, '2026-07-29 09:58:55');
INSERT INTO `tbl_temperature` (`id`, `temperature`, `humidity`, `gaz`, `added_date`) VALUES (143, 29, 42, 0, '2026-07-29 09:59:09');

-- table data [outputs]
INSERT INTO `outputs` (`id`, `gpio`, `state`) VALUES (1, '2', 0);

