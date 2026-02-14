CREATE TABLE `skinEnhancementJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalImageUrl` text NOT NULL,
	`enhancedImageUrl` text,
	`mode` enum('natural_clean','soft_glow','studio_look','no_makeup_real') NOT NULL,
	`proMode` boolean NOT NULL DEFAULT false,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`creditCost` int NOT NULL,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `skinEnhancementJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `skinEnhancementJobs` ADD CONSTRAINT `skinEnhancementJobs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;