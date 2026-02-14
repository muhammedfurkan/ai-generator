CREATE TABLE `upscaleHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalImageUrl` text NOT NULL,
	`upscaledImageUrl` text,
	`upscaleFactor` varchar(5) NOT NULL,
	`creditsCost` int NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`taskId` varchar(255),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `upscaleHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `upscaleHistory` ADD CONSTRAINT `upscaleHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;