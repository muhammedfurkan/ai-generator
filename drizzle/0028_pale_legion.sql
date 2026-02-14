CREATE TABLE `adminRoles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`description` text,
	`permissions` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminRoles_id` PRIMARY KEY(`id`),
	CONSTRAINT `adminRoles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `adminUsersExtended` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roleId` int,
	`twoFactorEnabled` boolean NOT NULL DEFAULT false,
	`twoFactorSecret` varchar(255),
	`ipWhitelist` text,
	`lastLoginAt` timestamp,
	`lastLoginIp` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminUsersExtended_id` PRIMARY KEY(`id`),
	CONSTRAINT `adminUsersExtended_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `aiModelConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modelKey` varchar(100) NOT NULL,
	`modelName` varchar(200) NOT NULL,
	`modelType` enum('image','video','upscale') NOT NULL,
	`provider` varchar(100) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`isMaintenanceMode` boolean NOT NULL DEFAULT false,
	`maxResolutionWidth` int DEFAULT 4096,
	`maxResolutionHeight` int DEFAULT 4096,
	`maxVideoDurationSeconds` int,
	`freeUserDailyLimit` int DEFAULT 5,
	`premiumUserDailyLimit` int DEFAULT 50,
	`creditCostOverride` int,
	`fallbackModelId` int,
	`totalRequests` int NOT NULL DEFAULT 0,
	`successfulRequests` int NOT NULL DEFAULT 0,
	`failedRequests` int NOT NULL DEFAULT 0,
	`avgRenderTimeMs` int DEFAULT 0,
	`costPerRequest` decimal(10,6) DEFAULT '0',
	`totalCostUsd` decimal(10,2) DEFAULT '0',
	`priority` int NOT NULL DEFAULT 0,
	`description` text,
	`configJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiModelConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `aiModelConfig_modelKey_unique` UNIQUE(`modelKey`)
);
--> statement-breakpoint
CREATE TABLE `flaggedPrompts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`prompt` text NOT NULL,
	`flagReason` enum('nsfw','spam','abuse','illegal','copyright','user_report','auto_detected') NOT NULL,
	`matchedPatternId` int,
	`status` enum('pending','approved','rejected','banned') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewNotes` text,
	`reviewedAt` timestamp,
	`imageId` int,
	`videoId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flaggedPrompts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ipLoginHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`userAgent` text,
	`country` varchar(100),
	`city` varchar(100),
	`region` varchar(100),
	`deviceType` enum('desktop','mobile','tablet','unknown') DEFAULT 'unknown',
	`browser` varchar(100),
	`os` varchar(100),
	`loginType` enum('login','register','api_access') NOT NULL DEFAULT 'login',
	`isSuccessful` boolean NOT NULL DEFAULT true,
	`failReason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ipLoginHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobQueue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobType` enum('image','video','upscale','multi_angle','skin_enhancement','product_promo','ugc_ad') NOT NULL,
	`relatedId` int,
	`priority` int NOT NULL DEFAULT 0,
	`status` enum('queued','processing','completed','failed','cancelled') NOT NULL DEFAULT 'queued',
	`queuedAt` timestamp NOT NULL DEFAULT (now()),
	`startedAt` timestamp,
	`completedAt` timestamp,
	`workerId` varchar(100),
	`attempts` int NOT NULL DEFAULT 0,
	`maxAttempts` int NOT NULL DEFAULT 3,
	`lastError` text,
	`estimatedDurationMs` int,
	`actualDurationMs` int,
	`modelKey` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jobQueue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`packageId` int,
	`packageName` varchar(100),
	`credits` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`amountUsd` decimal(10,2),
	`currency` varchar(3) NOT NULL DEFAULT 'TRY',
	`paymentMethod` enum('credit_card','debit_card','crypto','bank_transfer','paypal','other') NOT NULL,
	`paymentProvider` varchar(50),
	`externalTransactionId` varchar(255),
	`externalOrderId` varchar(255),
	`status` enum('pending','completed','failed','refunded','cancelled','disputed') NOT NULL DEFAULT 'pending',
	`discountCodeId` int,
	`discountAmount` decimal(10,2),
	`ipAddress` varchar(45),
	`userAgent` text,
	`cardLastFour` varchar(4),
	`cardBrand` varchar(20),
	`binNumber` varchar(6),
	`metadata` text,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `paymentRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promptBlacklist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pattern` varchar(500) NOT NULL,
	`patternType` enum('exact','contains','regex','starts_with','ends_with') NOT NULL DEFAULT 'contains',
	`category` enum('nsfw','spam','abuse','illegal','copyright','other') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`actionType` enum('block','warn','flag_for_review','auto_ban') NOT NULL DEFAULT 'block',
	`warningMessage` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`hitCount` int NOT NULL DEFAULT 0,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promptBlacklist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemRateLimits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`limitKey` varchar(100) NOT NULL,
	`limitName` varchar(200) NOT NULL,
	`requestsPerWindow` int NOT NULL,
	`windowSizeSeconds` int NOT NULL,
	`freeUserMultiplier` decimal(3,2) DEFAULT '1.00',
	`premiumUserMultiplier` decimal(3,2) DEFAULT '2.00',
	`blockDurationSeconds` int DEFAULT 60,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemRateLimits_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemRateLimits_limitKey_unique` UNIQUE(`limitKey`)
);
--> statement-breakpoint
CREATE TABLE `userWarnings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`warningType` enum('nsfw_content','spam','abuse','tos_violation','payment_issue','other') NOT NULL,
	`severity` enum('notice','warning','final_warning') NOT NULL DEFAULT 'warning',
	`reason` text NOT NULL,
	`relatedPromptId` int,
	`issuedBy` int,
	`acknowledged` boolean NOT NULL DEFAULT false,
	`acknowledgedAt` timestamp,
	`autoActionTaken` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userWarnings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `adminUsersExtended` ADD CONSTRAINT `adminUsersExtended_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `adminUsersExtended` ADD CONSTRAINT `adminUsersExtended_roleId_adminRoles_id_fk` FOREIGN KEY (`roleId`) REFERENCES `adminRoles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flaggedPrompts` ADD CONSTRAINT `flaggedPrompts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flaggedPrompts` ADD CONSTRAINT `flaggedPrompts_matchedPatternId_promptBlacklist_id_fk` FOREIGN KEY (`matchedPatternId`) REFERENCES `promptBlacklist`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flaggedPrompts` ADD CONSTRAINT `flaggedPrompts_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flaggedPrompts` ADD CONSTRAINT `flaggedPrompts_imageId_generatedImages_id_fk` FOREIGN KEY (`imageId`) REFERENCES `generatedImages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flaggedPrompts` ADD CONSTRAINT `flaggedPrompts_videoId_videoGenerations_id_fk` FOREIGN KEY (`videoId`) REFERENCES `videoGenerations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ipLoginHistory` ADD CONSTRAINT `ipLoginHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobQueue` ADD CONSTRAINT `jobQueue_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paymentRecords` ADD CONSTRAINT `paymentRecords_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paymentRecords` ADD CONSTRAINT `paymentRecords_packageId_creditPackages_id_fk` FOREIGN KEY (`packageId`) REFERENCES `creditPackages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paymentRecords` ADD CONSTRAINT `paymentRecords_discountCodeId_discountCodes_id_fk` FOREIGN KEY (`discountCodeId`) REFERENCES `discountCodes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `promptBlacklist` ADD CONSTRAINT `promptBlacklist_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userWarnings` ADD CONSTRAINT `userWarnings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userWarnings` ADD CONSTRAINT `userWarnings_relatedPromptId_flaggedPrompts_id_fk` FOREIGN KEY (`relatedPromptId`) REFERENCES `flaggedPrompts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userWarnings` ADD CONSTRAINT `userWarnings_issuedBy_users_id_fk` FOREIGN KEY (`issuedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;