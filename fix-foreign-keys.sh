#!/bin/bash
# Fix all foreign key constraints to use correct schema

mysql -h localhost -u root -p'Aa123456+' nanoinf << 'EOF'

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS=0;

-- activityLogs
ALTER TABLE activityLogs DROP FOREIGN KEY activityLogs_userId_users_id_fk;
ALTER TABLE activityLogs ADD CONSTRAINT activityLogs_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- aiCharacterImages
ALTER TABLE aiCharacterImages DROP FOREIGN KEY aiCharacterImages_characterId_aiCharacters_id_fk;
ALTER TABLE aiCharacterImages ADD CONSTRAINT aiCharacterImages_characterId_aiCharacters_id_fk 
  FOREIGN KEY (characterId) REFERENCES nanoinf.aiCharacters(id) ON DELETE CASCADE;

ALTER TABLE aiCharacterImages DROP FOREIGN KEY aiCharacterImages_userId_users_id_fk;
ALTER TABLE aiCharacterImages ADD CONSTRAINT aiCharacterImages_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- aiCharacters
ALTER TABLE aiCharacters DROP FOREIGN KEY aiCharacters_userId_users_id_fk;
ALTER TABLE aiCharacters ADD CONSTRAINT aiCharacters_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- creditTransactions
ALTER TABLE creditTransactions DROP FOREIGN KEY creditTransactions_userId_users_id_fk;
ALTER TABLE creditTransactions ADD CONSTRAINT creditTransactions_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- discountCodeUsage
ALTER TABLE discountCodeUsage DROP FOREIGN KEY discountCodeUsage_discountCodeId_discountCodes_id_fk;
ALTER TABLE discountCodeUsage ADD CONSTRAINT discountCodeUsage_discountCodeId_discountCodes_id_fk 
  FOREIGN KEY (discountCodeId) REFERENCES nanoinf.discountCodes(id) ON DELETE CASCADE;

ALTER TABLE discountCodeUsage DROP FOREIGN KEY discountCodeUsage_userId_users_id_fk;
ALTER TABLE discountCodeUsage ADD CONSTRAINT discountCodeUsage_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- errorLogs
ALTER TABLE errorLogs DROP FOREIGN KEY errorLogs_userId_users_id_fk;
ALTER TABLE errorLogs ADD CONSTRAINT errorLogs_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- favorites
ALTER TABLE favorites DROP FOREIGN KEY favorites_imageId_generatedImages_id_fk;
ALTER TABLE favorites ADD CONSTRAINT favorites_imageId_generatedImages_id_fk 
  FOREIGN KEY (imageId) REFERENCES nanoinf.generatedImages(id) ON DELETE CASCADE;

ALTER TABLE favorites DROP FOREIGN KEY favorites_userId_users_id_fk;
ALTER TABLE favorites ADD CONSTRAINT favorites_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- feedbacks
ALTER TABLE feedbacks DROP FOREIGN KEY feedbacks_userId_users_id_fk;
ALTER TABLE feedbacks ADD CONSTRAINT feedbacks_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- multiAngleImages
ALTER TABLE multiAngleImages DROP FOREIGN KEY multiAngleImages_jobId_multiAngleJobs_id_fk;
ALTER TABLE multiAngleImages ADD CONSTRAINT multiAngleImages_jobId_multiAngleJobs_id_fk 
  FOREIGN KEY (jobId) REFERENCES nanoinf.multiAngleJobs(id) ON DELETE CASCADE;

-- multiAngleJobs
ALTER TABLE multiAngleJobs DROP FOREIGN KEY multiAngleJobs_userId_users_id_fk;
ALTER TABLE multiAngleJobs ADD CONSTRAINT multiAngleJobs_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- notifications
ALTER TABLE notifications DROP FOREIGN KEY notifications_userId_users_id_fk;
ALTER TABLE notifications ADD CONSTRAINT notifications_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- productPromoVideos
ALTER TABLE productPromoVideos DROP FOREIGN KEY productPromoVideos_userId_users_id_fk;
ALTER TABLE productPromoVideos ADD CONSTRAINT productPromoVideos_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- promptHistory
ALTER TABLE promptHistory DROP FOREIGN KEY promptHistory_userId_users_id_fk;
ALTER TABLE promptHistory ADD CONSTRAINT promptHistory_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- referrals
ALTER TABLE referrals DROP FOREIGN KEY referrals_referredId_users_id_fk;
ALTER TABLE referrals ADD CONSTRAINT referrals_referredId_users_id_fk 
  FOREIGN KEY (referredId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

ALTER TABLE referrals DROP FOREIGN KEY referrals_referrerId_users_id_fk;
ALTER TABLE referrals ADD CONSTRAINT referrals_referrerId_users_id_fk 
  FOREIGN KEY (referrerId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- skinEnhancementJobs
ALTER TABLE skinEnhancementJobs DROP FOREIGN KEY skinEnhancementJobs_userId_users_id_fk;
ALTER TABLE skinEnhancementJobs ADD CONSTRAINT skinEnhancementJobs_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- ugcAdVideos
ALTER TABLE ugcAdVideos DROP FOREIGN KEY ugcAdVideos_userId_users_id_fk;
ALTER TABLE ugcAdVideos ADD CONSTRAINT ugcAdVideos_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- upscaleHistory
ALTER TABLE upscaleHistory DROP FOREIGN KEY upscaleHistory_userId_users_id_fk;
ALTER TABLE upscaleHistory ADD CONSTRAINT upscaleHistory_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- userPromptTemplates
ALTER TABLE userPromptTemplates DROP FOREIGN KEY userPromptTemplates_userId_users_id_fk;
ALTER TABLE userPromptTemplates ADD CONSTRAINT userPromptTemplates_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- userSessions
ALTER TABLE userSessions DROP FOREIGN KEY userSessions_userId_users_id_fk;
ALTER TABLE userSessions ADD CONSTRAINT userSessions_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- videoFavorites
ALTER TABLE videoFavorites DROP FOREIGN KEY videoFavorites_userId_users_id_fk;
ALTER TABLE videoFavorites ADD CONSTRAINT videoFavorites_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

ALTER TABLE videoFavorites DROP FOREIGN KEY videoFavorites_videoId_videoGenerations_id_fk;
ALTER TABLE videoFavorites ADD CONSTRAINT videoFavorites_videoId_videoGenerations_id_fk 
  FOREIGN KEY (videoId) REFERENCES nanoinf.videoGenerations(id) ON DELETE CASCADE;

-- videoGenerations
ALTER TABLE videoGenerations DROP FOREIGN KEY videoGenerations_userId_users_id_fk;
ALTER TABLE videoGenerations ADD CONSTRAINT videoGenerations_userId_users_id_fk 
  FOREIGN KEY (userId) REFERENCES nanoinf.users(id) ON DELETE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Verify all are fixed
SELECT COUNT(*) as wrong_fk_count
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA='nanoinf' 
  AND REFERENCED_TABLE_SCHEMA != 'nanoinf' 
  AND REFERENCED_TABLE_NAME IS NOT NULL;

EOF

echo "✅ All foreign keys fixed!"
