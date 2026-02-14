-- Kie.ai Market'ten Eksik Olan Modelleri Ekleme
-- Kaynak: https://kie.ai/market
-- Tarih: 2026-01-17

-- WAN 2.5 Series
INSERT INTO aiModelConfig (modelKey, modelName, modelType, provider, isActive, priority, description, configJson)
VALUES 
  ('wan/2-5-text-to-video', 'Wan 2.5 Text to Video', 'video', 'kie.ai', 1, 85, 
   'Wan 2.5 text-to-video generation model',
   '{"supportsTextToVideo":true,"supportsImageToVideo":false,"supportsVideoToVideo":false,"supportedDurations":[5,10],"supportedResolutions":["720p","1080p"],"hasAudioSupport":true}'),
   
  ('wan/2-5-image-to-video', 'Wan 2.5 Image to Video', 'video', 'kie.ai', 1, 85,
   'Wan 2.5 image-to-video generation model',
   '{"supportsTextToVideo":false,"supportsImageToVideo":true,"supportsVideoToVideo":false,"supportedDurations":[5,10],"supportedResolutions":["720p","1080p"],"hasAudioSupport":true}')
ON DUPLICATE KEY UPDATE modelName = VALUES(modelName);

-- KLING 2.5 Turbo Series
INSERT INTO aiModelConfig (modelKey, modelName, modelType, provider, isActive, priority, description, configJson)
VALUES 
  ('kling/2-5-turbo-text-to-video', 'Kling 2.5 Turbo Text to Video', 'video', 'kie.ai', 1, 88,
   'Kling 2.5 Turbo fast text-to-video generation',
   '{"supportsTextToVideo":true,"supportsImageToVideo":false,"supportsVideoToVideo":false,"supportedDurations":[5,10],"supportedResolutions":["720p","1080p"],"hasAudioSupport":true,"isTurbo":true}'),
   
  ('kling/2-5-turbo-image-to-video', 'Kling 2.5 Turbo Image to Video', 'video', 'kie.ai', 1, 88,
   'Kling 2.5 Turbo fast image-to-video generation',
   '{"supportsTextToVideo":false,"supportsImageToVideo":true,"supportsVideoToVideo":false,"supportedDurations":[5,10],"supportedResolutions":["720p","1080p"],"hasAudioSupport":true,"isTurbo":true}')
ON DUPLICATE KEY UPDATE modelName = VALUES(modelName);

-- SEEDANCE 1.5 Pro Text to Video
INSERT INTO aiModelConfig (modelKey, modelName, modelType, provider, isActive, priority, description, configJson)
VALUES 
  ('bytedance/seedance-1.5-pro-text-to-video', 'Seedance 1.5 Pro Text to Video', 'video', 'kie.ai', 1, 82,
   'Seedance 1.5 Pro text-to-video generation',
   '{"supportsTextToVideo":true,"supportsImageToVideo":false,"supportsVideoToVideo":false,"supportedDurations":[5,10],"supportedResolutions":["720p","1080p"],"hasAudioSupport":false}')
ON DUPLICATE KEY UPDATE modelName = VALUES(modelName);

-- HAILUO 2.3 Text to Video Series
INSERT INTO aiModelConfig (modelKey, modelName, modelType, provider, isActive, priority, description, configJson)
VALUES 
  ('hailuo/2-3-text-to-video-pro', 'Hailuo 2.3 Text to Video Pro', 'video', 'kie.ai', 1, 75,
   'Hailuo 2.3 professional text-to-video generation',
   '{"supportsTextToVideo":true,"supportsImageToVideo":false,"supportsVideoToVideo":false,"supportedDurations":[5,10],"supportedResolutions":["720p","1080p"],"hasAudioSupport":false}'),
   
  ('hailuo/2-3-text-to-video-standard', 'Hailuo 2.3 Text to Video Standard', 'video', 'kie.ai', 1, 73,
   'Hailuo 2.3 standard text-to-video generation',
   '{"supportsTextToVideo":true,"supportsImageToVideo":false,"supportsVideoToVideo":false,"supportedDurations":[5],"supportedResolutions":["720p"],"hasAudioSupport":false}')
ON DUPLICATE KEY UPDATE modelName = VALUES(modelName);

-- VEO 3 Series (separate from 3.1)
INSERT INTO aiModelConfig (modelKey, modelName, modelType, provider, isActive, priority, description, configJson)
VALUES 
  ('veo/3-text-to-video', 'Veo 3 Text to Video', 'video', 'kie.ai', 1, 92,
   'Google Veo 3 text-to-video generation',
   '{"supportsTextToVideo":true,"supportsImageToVideo":false,"supportsVideoToVideo":false,"supportedDurations":[5,10],"supportedResolutions":["720p","1080p"],"hasAudioSupport":true}'),
   
  ('veo/3-image-to-video', 'Veo 3 Image to Video', 'video', 'kie.ai', 1, 92,
   'Google Veo 3 image-to-video generation',
   '{"supportsTextToVideo":false,"supportsImageToVideo":true,"supportsVideoToVideo":false,"supportedDurations":[5,10],"supportedResolutions":["720p","1080p"],"hasAudioSupport":true}')
ON DUPLICATE KEY UPDATE modelName = VALUES(modelName);

-- TOPAZ Video Upscaler
INSERT INTO aiModelConfig (modelKey, modelName, modelType, provider, isActive, priority, description, configJson)
VALUES 
  ('topaz/video-upscale', 'Topaz Video Upscaler', 'video', 'kie.ai', 1, 70,
   'Topaz AI-powered video upscaling',
   '{"supportsTextToVideo":false,"supportsImageToVideo":false,"supportsVideoToVideo":true,"supportedResolutions":["1080p","4k"],"isUpscaler":true}')
ON DUPLICATE KEY UPDATE modelName = VALUES(modelName);

-- Başarı mesajı
SELECT CONCAT('✅ Eksik modeller başarıyla eklendi! Toplam: ', COUNT(*), ' model') as result
FROM aiModelConfig 
WHERE modelKey IN (
  'wan/2-5-text-to-video',
  'wan/2-5-image-to-video',
  'kling/2-5-turbo-text-to-video',
  'kling/2-5-turbo-image-to-video',
  'bytedance/seedance-1.5-pro-text-to-video',
  'hailuo/2-3-text-to-video-pro',
  'hailuo/2-3-text-to-video-standard',
  'veo/3-text-to-video',
  'veo/3-image-to-video',
  'topaz/video-upscale'
);
