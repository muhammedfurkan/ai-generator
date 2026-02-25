ALTER TABLE `aiModelConfig` MODIFY COLUMN `modelType` enum('image','video','upscale','audio','music') NOT NULL;--> statement-breakpoint
ALTER TABLE `featurePricing` MODIFY COLUMN `category` enum('image','video','upscale','ai_character','viral_app','multi_angle','product_promo','ugc_ad','music','chat') NOT NULL;--> statement-breakpoint
ALTER TABLE `featurePricing` ADD `kieModelDescription` varchar(300);--> statement-breakpoint
ALTER TABLE `featurePricing` ADD `kieInterfaceType` varchar(50);--> statement-breakpoint
ALTER TABLE `featurePricing` ADD `kieProvider` varchar(100);--> statement-breakpoint
ALTER TABLE `featurePricing` ADD `kieCreditPrice` varchar(50);--> statement-breakpoint
ALTER TABLE `featurePricing` ADD `kieCreditUnit` varchar(100);--> statement-breakpoint
ALTER TABLE `featurePricing` ADD `kieUsdPrice` varchar(50);--> statement-breakpoint
ALTER TABLE `featurePricing` ADD `lastSyncedAt` timestamp;