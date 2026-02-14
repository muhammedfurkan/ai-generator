CREATE TABLE `shopierOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`packageId` int,
	`creditsAmount` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'TRY',
	`merchantOrderId` varchar(100) NOT NULL,
	`status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`shopierOrderId` varchar(100),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shopierOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `shopierOrders_merchantOrderId_unique` UNIQUE(`merchantOrderId`)
);
--> statement-breakpoint
ALTER TABLE `seoSettings` ADD `lastMod` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `shopierOrders` ADD CONSTRAINT `shopierOrders_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shopierOrders` ADD CONSTRAINT `shopierOrders_packageId_creditPackages_id_fk` FOREIGN KEY (`packageId`) REFERENCES `creditPackages`(`id`) ON DELETE set null ON UPDATE no action;