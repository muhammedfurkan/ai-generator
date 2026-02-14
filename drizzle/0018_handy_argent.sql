CREATE TABLE `ugcAdVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productImageUrl` text,
	`productVideoUrl` text,
	`videoModel` enum('sora2','veo31') NOT NULL,
	`ugcScenario` enum('testimonial','unboxing','problem_solution','first_impression','lifestyle') NOT NULL,
	`characterGender` enum('male','female') NOT NULL,
	`language` varchar(50) NOT NULL DEFAULT 'tr',
	`tone` enum('casual','excited','calm','persuasive') NOT NULL,
	`productName` varchar(200),
	`keyBenefit` varchar(500),
	`generatedVideoUrl` text,
	`thumbnailUrl` text,
	`taskId` varchar(255),
	`prompt` text NOT NULL,
	`creditsCost` int NOT NULL DEFAULT 45,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `ugcAdVideos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ugcAdVideos` ADD CONSTRAINT `ugcAdVideos_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;