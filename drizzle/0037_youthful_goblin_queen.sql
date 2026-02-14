CREATE TABLE `errorLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`errorType` varchar(50) NOT NULL,
	`errorCode` varchar(50),
	`errorMessage` text NOT NULL,
	`endpoint` varchar(255),
	`requestData` text,
	`stackTrace` text,
	`userAgent` varchar(500),
	`ipAddress` varchar(45),
	`resolved` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `errorLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `creditPackages` RENAME COLUMN `usage1k` TO `usage1K`;--> statement-breakpoint
ALTER TABLE `activityLogs` DROP FOREIGN KEY `activityLogs_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `feedbacks` DROP FOREIGN KEY `feedbacks_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `adminRoles` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `adminUsersExtended` MODIFY COLUMN `twoFactorEnabled` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `adminUsersExtended` MODIFY COLUMN `twoFactorEnabled` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `aiCharacters` MODIFY COLUMN `isPublic` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `aiCharacters` MODIFY COLUMN `isPublic` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `aiModelConfig` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `aiModelConfig` MODIFY COLUMN `isMaintenanceMode` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `aiModelConfig` MODIFY COLUMN `isMaintenanceMode` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `aiModelConfig` MODIFY COLUMN `costPerRequest` decimal(10,6) DEFAULT '0.000000';--> statement-breakpoint
ALTER TABLE `aiModelConfig` MODIFY COLUMN `totalCostUsd` decimal(10,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `announcements` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `announcements` MODIFY COLUMN `dismissible` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `announcements` MODIFY COLUMN `showOnce` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `announcements` MODIFY COLUMN `showOnce` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `apiUsageStats` MODIFY COLUMN `totalCost` decimal(10,4) NOT NULL DEFAULT '0.0000';--> statement-breakpoint
ALTER TABLE `bannedEmails` MODIFY COLUMN `isPattern` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `bannedEmails` MODIFY COLUMN `isPattern` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `creditPackages` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `creditPackages` MODIFY COLUMN `isHighlighted` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `creditPackages` MODIFY COLUMN `isHighlighted` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `discountCodes` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `faqs` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `featurePricing` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `generatedImages` MODIFY COLUMN `status` varchar(20) NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `globalSeoConfig` MODIFY COLUMN `sitemapEnabled` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `homepageSections` MODIFY COLUMN `isVisible` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `ipLoginHistory` MODIFY COLUMN `isSuccessful` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `modalCards` MODIFY COLUMN `isFeatured` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `modalCards` MODIFY COLUMN `isFeatured` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `modalCards` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `isRead` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `isRead` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `promptBlacklist` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `referrals` MODIFY COLUMN `referrerBonusGiven` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `referrals` MODIFY COLUMN `referrerBonusGiven` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `referrals` MODIFY COLUMN `referredBonusGiven` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `referrals` MODIFY COLUMN `referredBonusGiven` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `seoSettings` MODIFY COLUMN `robotsIndex` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `seoSettings` MODIFY COLUMN `robotsFollow` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `seoSettings` MODIFY COLUMN `robotsNoArchive` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `seoSettings` MODIFY COLUMN `robotsNoArchive` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `seoSettings` MODIFY COLUMN `robotsNoSnippet` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `seoSettings` MODIFY COLUMN `robotsNoSnippet` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `seoSettings` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `siteSettings` MODIFY COLUMN `isPublic` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `siteSettings` MODIFY COLUMN `isPublic` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `skinEnhancementJobs` MODIFY COLUMN `proMode` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `skinEnhancementJobs` MODIFY COLUMN `proMode` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `systemRateLimits` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `userWarnings` MODIFY COLUMN `acknowledged` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `userWarnings` MODIFY COLUMN `acknowledged` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `emailVerified` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `emailVerified` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `isBanned` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `isBanned` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `videoGenerations` MODIFY COLUMN `hasAudio` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `videoGenerations` MODIFY COLUMN `hasAudio` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `viralAppsConfig` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `viralAppsConfig` MODIFY COLUMN `isPopular` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `viralAppsConfig` MODIFY COLUMN `isPopular` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `creditPackages` ADD `usage2K` int;--> statement-breakpoint
ALTER TABLE `creditPackages` ADD `usage4K` int;--> statement-breakpoint
ALTER TABLE `errorLogs` ADD CONSTRAINT `errorLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activityLogs` ADD CONSTRAINT `activityLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `users_referredBy_users_id_fk` ON `users` (`referredBy`);--> statement-breakpoint
ALTER TABLE `creditPackages` DROP COLUMN `usage2k`;--> statement-breakpoint
ALTER TABLE `creditPackages` DROP COLUMN `usage4k`;