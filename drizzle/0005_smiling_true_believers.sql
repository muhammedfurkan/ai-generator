CREATE TABLE `aiCharacterImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`characterId` int NOT NULL,
	`userId` int NOT NULL,
	`prompt` text NOT NULL,
	`referenceImageUrl` text,
	`generatedImageUrl` text NOT NULL,
	`aspectRatio` varchar(10) NOT NULL,
	`resolution` varchar(10) NOT NULL,
	`creditsCost` int NOT NULL DEFAULT 10,
	`taskId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiCharacterImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiCharacters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`characterImageUrl` text NOT NULL,
	`description` text,
	`gender` varchar(20),
	`style` varchar(100),
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiCharacters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `aiCharacterImages` ADD CONSTRAINT `aiCharacterImages_characterId_aiCharacters_id_fk` FOREIGN KEY (`characterId`) REFERENCES `aiCharacters`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aiCharacterImages` ADD CONSTRAINT `aiCharacterImages_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aiCharacters` ADD CONSTRAINT `aiCharacters_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;