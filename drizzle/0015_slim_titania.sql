CREATE TABLE `multiAngleImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`angleIndex` int NOT NULL,
	`angleName` varchar(100) NOT NULL,
	`prompt` text NOT NULL,
	`generatedImageUrl` text,
	`taskId` varchar(255),
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `multiAngleImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `multiAngleJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`referenceImageUrl` text NOT NULL,
	`angleSet` enum('standard_9','influencer_8','creator_12') NOT NULL,
	`totalImages` int NOT NULL,
	`completedImages` int NOT NULL DEFAULT 0,
	`creditsCost` int NOT NULL,
	`status` enum('pending','processing','completed','failed','partial') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `multiAngleJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `multiAngleImages` ADD CONSTRAINT `multiAngleImages_jobId_multiAngleJobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `multiAngleJobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `multiAngleJobs` ADD CONSTRAINT `multiAngleJobs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;