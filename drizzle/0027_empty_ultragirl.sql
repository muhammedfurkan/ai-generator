CREATE TABLE `bannedEmails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`isPattern` boolean NOT NULL DEFAULT false,
	`reason` text,
	`bannedBy` int,
	`bannedUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bannedEmails_id` PRIMARY KEY(`id`),
	CONSTRAINT `bannedEmails_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `bannedIps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`reason` text,
	`bannedBy` int,
	`bannedUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bannedIps_id` PRIMARY KEY(`id`),
	CONSTRAINT `bannedIps_ipAddress_unique` UNIQUE(`ipAddress`)
);
--> statement-breakpoint
CREATE TABLE `homepageSections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectionKey` varchar(50) NOT NULL,
	`title` varchar(100) NOT NULL,
	`isVisible` boolean NOT NULL DEFAULT true,
	`order` int NOT NULL DEFAULT 0,
	`config` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `homepageSections_id` PRIMARY KEY(`id`),
	CONSTRAINT `homepageSections_sectionKey_unique` UNIQUE(`sectionKey`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `isBanned` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `bannedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `banReason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bannedBy` int;--> statement-breakpoint
ALTER TABLE `users` ADD `lastKnownIp` varchar(45);--> statement-breakpoint
ALTER TABLE `bannedEmails` ADD CONSTRAINT `bannedEmails_bannedBy_users_id_fk` FOREIGN KEY (`bannedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bannedEmails` ADD CONSTRAINT `bannedEmails_bannedUserId_users_id_fk` FOREIGN KEY (`bannedUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bannedIps` ADD CONSTRAINT `bannedIps_bannedBy_users_id_fk` FOREIGN KEY (`bannedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bannedIps` ADD CONSTRAINT `bannedIps_bannedUserId_users_id_fk` FOREIGN KEY (`bannedUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;