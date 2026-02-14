-- Performance index optimization for frequently used read/write paths.
-- Requires MySQL 8.0+ for CREATE INDEX IF NOT EXISTS support.

CREATE INDEX IF NOT EXISTS ai_char_images_user_created_idx ON aiCharacterImages (userId, createdAt);
CREATE INDEX IF NOT EXISTS ai_char_images_char_created_idx ON aiCharacterImages (characterId, createdAt);
CREATE INDEX IF NOT EXISTS ai_char_images_task_idx ON aiCharacterImages (taskId);

CREATE INDEX IF NOT EXISTS ai_characters_user_created_idx ON aiCharacters (userId, createdAt);
CREATE INDEX IF NOT EXISTS ai_characters_public_usage_idx ON aiCharacters (isPublic, usageCount);

CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_image_unique ON favorites (userId, imageId);
CREATE INDEX IF NOT EXISTS favorites_user_created_idx ON favorites (userId, createdAt);

CREATE INDEX IF NOT EXISTS gen_images_user_created_idx ON generatedImages (userId, createdAt);
CREATE INDEX IF NOT EXISTS gen_images_user_status_created_idx ON generatedImages (userId, status, createdAt);
CREATE INDEX IF NOT EXISTS gen_images_task_idx ON generatedImages (taskId);
CREATE INDEX IF NOT EXISTS gen_images_status_created_idx ON generatedImages (status, createdAt);

CREATE INDEX IF NOT EXISTS multi_angle_images_job_idx ON multiAngleImages (jobId, angleIndex);
CREATE INDEX IF NOT EXISTS multi_angle_images_job_status_idx ON multiAngleImages (jobId, status);
CREATE INDEX IF NOT EXISTS multi_angle_images_task_idx ON multiAngleImages (taskId);

CREATE INDEX IF NOT EXISTS multi_angle_jobs_user_created_idx ON multiAngleJobs (userId, createdAt);
CREATE INDEX IF NOT EXISTS multi_angle_jobs_status_created_idx ON multiAngleJobs (status, createdAt);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON notifications (userId, createdAt);
CREATE INDEX IF NOT EXISTS notifications_user_read_created_idx ON notifications (userId, isRead, createdAt);
CREATE INDEX IF NOT EXISTS notifications_type_created_idx ON notifications (type, createdAt);

CREATE INDEX IF NOT EXISTS payment_records_user_created_idx ON paymentRecords (userId, createdAt);
CREATE INDEX IF NOT EXISTS payment_records_status_created_idx ON paymentRecords (status, createdAt);
CREATE INDEX IF NOT EXISTS payment_records_external_txn_idx ON paymentRecords (externalTransactionId);

CREATE INDEX IF NOT EXISTS prompt_history_user_last_used_idx ON promptHistory (userId, lastUsedAt);
CREATE INDEX IF NOT EXISTS prompt_history_user_res_aspect_idx ON promptHistory (userId, resolution, aspectRatio);

CREATE INDEX IF NOT EXISTS stripe_orders_user_created_idx ON stripeOrders (userId, createdAt);
CREATE INDEX IF NOT EXISTS stripe_orders_status_created_idx ON stripeOrders (status, createdAt);
CREATE INDEX IF NOT EXISTS stripe_orders_payment_intent_idx ON stripeOrders (stripePaymentIntentId);

CREATE INDEX IF NOT EXISTS upscale_history_user_created_idx ON upscaleHistory (userId, createdAt);
CREATE INDEX IF NOT EXISTS upscale_history_user_task_idx ON upscaleHistory (userId, taskId);

CREATE INDEX IF NOT EXISTS users_email_verification_clerk_idx ON users (emailVerificationClerkId);
CREATE INDEX IF NOT EXISTS users_email_verification_code_idx ON users (emailVerificationCode);

CREATE UNIQUE INDEX IF NOT EXISTS video_favorites_user_video_unique ON videoFavorites (userId, videoId);
CREATE INDEX IF NOT EXISTS video_favorites_user_created_idx ON videoFavorites (userId, createdAt);

CREATE INDEX IF NOT EXISTS video_generations_user_created_idx ON videoGenerations (userId, createdAt);
CREATE INDEX IF NOT EXISTS video_generations_task_idx ON videoGenerations (taskId);
CREATE INDEX IF NOT EXISTS video_generations_status_created_idx ON videoGenerations (status, createdAt);
CREATE INDEX IF NOT EXISTS video_generations_user_status_created_idx ON videoGenerations (userId, status, createdAt);
