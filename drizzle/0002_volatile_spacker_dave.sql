CREATE TABLE `userPromptTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`prompt` text NOT NULL,
	`category` varchar(100),
	`aspectRatio` varchar(10) NOT NULL,
	`resolution` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPromptTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `userPromptTemplates` ADD CONSTRAINT `userPromptTemplates_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;