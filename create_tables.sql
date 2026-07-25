-- Active: 1784986557756@@ib2zgu.h.filess.io@3307@poultry_nowexactam
-- Table structure for table `outputs`
CREATE TABLE IF NOT EXISTS `outputs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `gpio` VARCHAR(111) NOT NULL,
  `state` INT(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `tbl_temperature`
CREATE TABLE IF NOT EXISTS `tbl_temperature` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `temperature` INT(11) NOT NULL,
  `humidity` INT(11) NOT NULL,
  `gaz` INT(11) NOT NULL,
  `added_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
