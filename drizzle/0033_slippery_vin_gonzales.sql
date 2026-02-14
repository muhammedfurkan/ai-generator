CREATE TABLE `stripeOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`packageId` int,
	`creditsAmount` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'TRY',
	`stripeSessionId` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`stripeCustomerId` varchar(255),
	`status` enum('pending','processing','success','failed','refunded') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `stripeOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripeOrders_stripeSessionId_unique` UNIQUE(`stripeSessionId`)
);
--> statement-breakpoint
ALTER TABLE `stripeOrders` ADD CONSTRAINT `stripeOrders_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stripeOrders` ADD CONSTRAINT `stripeOrders_packageId_creditPackages_id_fk` FOREIGN KEY (`packageId`) REFERENCES `creditPackages`(`id`) ON DELETE set null ON UPDATE no action;