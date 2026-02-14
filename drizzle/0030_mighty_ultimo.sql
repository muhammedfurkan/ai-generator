ALTER TABLE `users` ADD `emailVerificationCode` varchar(6);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerificationCodeExpiry` timestamp;