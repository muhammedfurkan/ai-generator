CREATE TABLE `activityLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50),
	`entityId` int,
	`oldValue` text,
	`newValue` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`type` enum('popup','banner','notification','maintenance') NOT NULL,
	`targetAudience` enum('all','logged_in','logged_out','new_users') NOT NULL DEFAULT 'all',
	`buttonText` varchar(100),
	`buttonUrl` varchar(500),
	`imageUrl` text,
	`backgroundColor` varchar(20),
	`textColor` varchar(20),
	`startDate` timestamp,
	`endDate` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`dismissible` boolean NOT NULL DEFAULT true,
	`showOnce` boolean NOT NULL DEFAULT false,
	`priority` int NOT NULL DEFAULT 0,
	`viewCount` int NOT NULL DEFAULT 0,
	`clickCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `apiUsageStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`apiName` varchar(100) NOT NULL,
	`endpoint` varchar(200),
	`requestCount` int NOT NULL DEFAULT 0,
	`successCount` int NOT NULL DEFAULT 0,
	`errorCount` int NOT NULL DEFAULT 0,
	`totalLatencyMs` int NOT NULL DEFAULT 0,
	`totalCost` decimal(10,4) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apiUsageStats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creditPackages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`credits` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`originalPrice` decimal(10,2),
	`badge` varchar(50),
	`features` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`isHighlighted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creditPackages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discountCodeUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`discountCodeId` int NOT NULL,
	`userId` int NOT NULL,
	`orderId` int,
	`discountAmount` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `discountCodeUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discountCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` text,
	`discountType` enum('percentage','fixed','credits') NOT NULL,
	`discountValue` decimal(10,2) NOT NULL,
	`minPurchase` decimal(10,2),
	`maxUses` int,
	`usedCount` int NOT NULL DEFAULT 0,
	`maxUsesPerUser` int NOT NULL DEFAULT 1,
	`validFrom` timestamp,
	`validUntil` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discountCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `discountCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` varchar(500) NOT NULL,
	`answer` text NOT NULL,
	`category` varchar(100),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`viewCount` int NOT NULL DEFAULT 0,
	`helpfulCount` int NOT NULL DEFAULT 0,
	`notHelpfulCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `featurePricing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`featureKey` varchar(100) NOT NULL,
	`featureName` varchar(200) NOT NULL,
	`category` enum('image','video','upscale','ai_character','viral_app','multi_angle','product_promo','ugc_ad') NOT NULL,
	`credits` int NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `featurePricing_id` PRIMARY KEY(`id`),
	CONSTRAINT `featurePricing_featureKey_unique` UNIQUE(`featureKey`)
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`category` enum('general','seo','contact','social','email','notification','security','maintenance') NOT NULL,
	`label` varchar(200) NOT NULL,
	`description` text,
	`inputType` enum('text','textarea','number','boolean','url','email','json','image') NOT NULL DEFAULT 'text',
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteSettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `userSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionToken` varchar(255) NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`deviceType` enum('desktop','mobile','tablet','unknown') NOT NULL DEFAULT 'unknown',
	`browser` varchar(100),
	`os` varchar(100),
	`country` varchar(100),
	`city` varchar(100),
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `userSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `userSessions_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `viralAppsConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appKey` varchar(100) NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`emoji` varchar(10),
	`coverImage` text,
	`promptTemplate` text NOT NULL,
	`credits` int NOT NULL,
	`category` varchar(100),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`isPopular` boolean NOT NULL DEFAULT false,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `viralAppsConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `viralAppsConfig_appKey_unique` UNIQUE(`appKey`)
);
--> statement-breakpoint
ALTER TABLE `activityLogs` ADD CONSTRAINT `activityLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `discountCodeUsage` ADD CONSTRAINT `discountCodeUsage_discountCodeId_discountCodes_id_fk` FOREIGN KEY (`discountCodeId`) REFERENCES `discountCodes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `discountCodeUsage` ADD CONSTRAINT `discountCodeUsage_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userSessions` ADD CONSTRAINT `userSessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;