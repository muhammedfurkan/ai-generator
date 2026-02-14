CREATE TABLE `modalCards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cardKey` varchar(100) NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` varchar(500),
	`imageDesktop` text,
	`imageMobile` text,
	`badge` varchar(50),
	`badgeColor` varchar(50),
	`path` varchar(255),
	`category` enum('images','videos','tools') NOT NULL,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `modalCards_id` PRIMARY KEY(`id`),
	CONSTRAINT `modalCards_cardKey_unique` UNIQUE(`cardKey`)
);
