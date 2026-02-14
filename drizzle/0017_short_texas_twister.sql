CREATE TABLE `productPromoVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productImageUrl` text NOT NULL,
	`stylePreset` enum('minimal_clean','premium_luxury','tech_futuristic','social_viral') NOT NULL,
	`productName` varchar(200),
	`slogan` varchar(300),
	`generatedVideoUrl` text,
	`thumbnailUrl` text,
	`taskId` varchar(255),
	`prompt` text NOT NULL,
	`creditsCost` int NOT NULL DEFAULT 30,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `productPromoVideos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `productPromoVideos` ADD CONSTRAINT `productPromoVideos_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;