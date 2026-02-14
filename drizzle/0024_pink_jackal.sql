CREATE TABLE `videoFavorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`videoId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `videoFavorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `videoFavorites` ADD CONSTRAINT `videoFavorites_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `videoFavorites` ADD CONSTRAINT `videoFavorites_videoId_videoGenerations_id_fk` FOREIGN KEY (`videoId`) REFERENCES `videoGenerations`(`id`) ON DELETE cascade ON UPDATE no action;