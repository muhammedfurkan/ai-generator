CREATE TABLE `promptHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`prompt` text NOT NULL,
	`aspectRatio` varchar(10) NOT NULL,
	`resolution` varchar(10) NOT NULL,
	`usageCount` int NOT NULL DEFAULT 1,
	`lastUsedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promptHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `promptHistory` ADD CONSTRAINT `promptHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;