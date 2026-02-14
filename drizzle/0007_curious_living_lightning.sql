CREATE TABLE `videoGenerations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`prompt` text NOT NULL,
	`referenceImageUrl` text,
	`videoUrl` text,
	`thumbnailUrl` text,
	`model` varchar(50) NOT NULL,
	`mode` varchar(20) NOT NULL,
	`duration` int NOT NULL,
	`quality` varchar(20),
	`hasAudio` boolean NOT NULL DEFAULT false,
	`creditsCost` int NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`taskId` varchar(255),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `videoGenerations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `videoGenerations` ADD CONSTRAINT `videoGenerations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;