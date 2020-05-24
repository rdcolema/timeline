--
-- Database: `timelinedb`
--

-- --------------------------------------------------------

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

ALTER DATABASE timelinedb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

--
-- Table definitions
--

CREATE TABLE `timeline_event` (
  `id` int(255) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `url` varchar(250) NOT NULL,
  `date` varchar(25) NOT NULL,
  `latitude` float(2) NOT NULL,
  `longitude` float(2) NOT NULL,
  CONSTRAINT timeline_event_pk PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
