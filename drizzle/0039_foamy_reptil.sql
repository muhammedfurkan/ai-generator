CREATE TABLE `generatedAudio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`text` text NOT NULL,
	`provider` enum('minimax','elevenlabs') NOT NULL,
	`model` varchar(100) NOT NULL,
	`voiceId` varchar(255) NOT NULL,
	`language` varchar(50),
	`speed` decimal(3,2) DEFAULT '1.00',
	`audioUrl` text,
	`durationMs` int,
	`creditsCost` int NOT NULL DEFAULT 10,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `generatedAudio_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generatedMusic` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`prompt` text,
	`lyrics` text NOT NULL,
	`model` varchar(100) NOT NULL DEFAULT 'music-2.5',
	`audioUrl` text,
	`durationMs` int,
	`creditsCost` int NOT NULL DEFAULT 20,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `generatedMusic_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `generatedAudio` ADD CONSTRAINT `generatedAudio_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generatedMusic` ADD CONSTRAINT `generatedMusic_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `gen_audio_user_created_idx` ON `generatedAudio` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `gen_audio_user_status_idx` ON `generatedAudio` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `gen_music_user_created_idx` ON `generatedMusic` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `gen_music_user_status_idx` ON `generatedMusic` (`userId`,`status`);