CREATE TABLE `showcaseImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imageUrl` text NOT NULL,
	`thumbnailUrl` text,
	`title` varchar(200),
	`aspectRatio` enum('square','portrait','landscape') NOT NULL DEFAULT 'square',
	`order` int NOT NULL DEFAULT 0,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `showcaseImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `showcaseVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoUrl` text NOT NULL,
	`posterUrl` text,
	`title` varchar(200),
	`order` int NOT NULL DEFAULT 0,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `showcaseVideos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_user_image_unique` UNIQUE(`userId`,`imageId`);--> statement-breakpoint
ALTER TABLE `videoFavorites` ADD CONSTRAINT `video_favorites_user_video_unique` UNIQUE(`userId`,`videoId`);--> statement-breakpoint
CREATE INDEX `showcaseImages_order_idx` ON `showcaseImages` (`order`);--> statement-breakpoint
CREATE INDEX `showcaseImages_active_order_idx` ON `showcaseImages` (`isActive`,`order`);--> statement-breakpoint
CREATE INDEX `showcaseVideos_order_idx` ON `showcaseVideos` (`order`);--> statement-breakpoint
CREATE INDEX `showcaseVideos_active_order_idx` ON `showcaseVideos` (`isActive`,`order`);--> statement-breakpoint
CREATE INDEX `ai_char_images_user_created_idx` ON `aiCharacterImages` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `ai_char_images_char_created_idx` ON `aiCharacterImages` (`characterId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `ai_char_images_task_idx` ON `aiCharacterImages` (`taskId`);--> statement-breakpoint
CREATE INDEX `ai_characters_user_created_idx` ON `aiCharacters` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `ai_characters_public_usage_idx` ON `aiCharacters` (`isPublic`,`usageCount`);--> statement-breakpoint
CREATE INDEX `favorites_user_created_idx` ON `favorites` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `gen_images_user_created_idx` ON `generatedImages` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `gen_images_user_status_created_idx` ON `generatedImages` (`userId`,`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `gen_images_task_idx` ON `generatedImages` (`taskId`);--> statement-breakpoint
CREATE INDEX `gen_images_status_created_idx` ON `generatedImages` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `multi_angle_images_job_idx` ON `multiAngleImages` (`jobId`,`angleIndex`);--> statement-breakpoint
CREATE INDEX `multi_angle_images_job_status_idx` ON `multiAngleImages` (`jobId`,`status`);--> statement-breakpoint
CREATE INDEX `multi_angle_images_task_idx` ON `multiAngleImages` (`taskId`);--> statement-breakpoint
CREATE INDEX `multi_angle_jobs_user_created_idx` ON `multiAngleJobs` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `multi_angle_jobs_status_created_idx` ON `multiAngleJobs` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `notifications_user_created_idx` ON `notifications` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `notifications_user_read_created_idx` ON `notifications` (`userId`,`isRead`,`createdAt`);--> statement-breakpoint
CREATE INDEX `notifications_type_created_idx` ON `notifications` (`type`,`createdAt`);--> statement-breakpoint
CREATE INDEX `payment_records_user_created_idx` ON `paymentRecords` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `payment_records_status_created_idx` ON `paymentRecords` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `payment_records_external_txn_idx` ON `paymentRecords` (`externalTransactionId`);--> statement-breakpoint
CREATE INDEX `prompt_history_user_last_used_idx` ON `promptHistory` (`userId`,`lastUsedAt`);--> statement-breakpoint
CREATE INDEX `prompt_history_user_res_aspect_idx` ON `promptHistory` (`userId`,`resolution`,`aspectRatio`);--> statement-breakpoint
CREATE INDEX `stripe_orders_user_created_idx` ON `stripeOrders` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `stripe_orders_status_created_idx` ON `stripeOrders` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `stripe_orders_payment_intent_idx` ON `stripeOrders` (`stripePaymentIntentId`);--> statement-breakpoint
CREATE INDEX `upscale_history_user_created_idx` ON `upscaleHistory` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `upscale_history_user_task_idx` ON `upscaleHistory` (`userId`,`taskId`);--> statement-breakpoint
CREATE INDEX `users_email_verification_clerk_idx` ON `users` (`emailVerificationClerkId`);--> statement-breakpoint
CREATE INDEX `users_email_verification_code_idx` ON `users` (`emailVerificationCode`);--> statement-breakpoint
CREATE INDEX `video_favorites_user_created_idx` ON `videoFavorites` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `video_generations_user_created_idx` ON `videoGenerations` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `video_generations_task_idx` ON `videoGenerations` (`taskId`);--> statement-breakpoint
CREATE INDEX `video_generations_status_created_idx` ON `videoGenerations` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `video_generations_user_status_created_idx` ON `videoGenerations` (`userId`,`status`,`createdAt`);