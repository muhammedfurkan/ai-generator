CREATE TABLE `feedbacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`type` enum('bug','suggestion','complaint','other') NOT NULL,
	`description` text NOT NULL,
	`screenshotUrl` text,
	`status` enum('new','in_progress','resolved','closed') NOT NULL DEFAULT 'new',
	`adminNotes` text,
	`userAgent` text,
	`pageUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedbacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;