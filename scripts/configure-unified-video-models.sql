-- 1. DEPRECATE SEPARATE VARIANT MODELS (To avoid UI clutter)
-- We unify these under simpler keys: veo3, sora2, kling, wan-26, etc.
UPDATE aiModelConfig 
SET isActive = 0 
WHERE modelKey IN (
  'wan/2-6-text-to-video', 
  'wan/2-6-image-to-video', 
  'wan/2-6-video-to-video',
  'kling/2-6-text-to-video',
  'kling/2-6-image-to-video',
  'sora-2-pro-text-to-video',
  'sora-2-pro-image-to-video',
  'bytedance/seedance-1.5-pro' -- We use 'seedance-15-pro' as key
);

-- 2. UPDATE/INSERT UNIFIED 'WAN 2.6' CONFIGURATION
UPDATE aiModelConfig
SET 
  modelName = 'Wan 2.6',
  provider = 'Alibaba',
  isActive = 1,
  configJson = JSON_OBJECT(
    'supportsTextToVideo', true,
    'supportsImageToVideo', true,
    'supportsVideoToVideo', true,
    'supportedDurations', JSON_ARRAY('5', '10'),
    'defaultDuration', '5',
    'supportedResolutions', JSON_ARRAY('720p', '1080p'),
    'defaultResolution', '720p',
    'supportedAspectRatios', JSON_ARRAY('16:9', '9:16'),
    'defaultAspectRatio', '16:9',
    'hasAudioSupport', true
  )
WHERE modelKey = 'wan-26';

-- 3. UPDATE/INSERT UNIFIED 'Kling 2.6' CONFIGURATION
-- Ensure we have a primary 'kling' key for Kling 2.6
INSERT INTO aiModelConfig (modelKey, modelName, modelType, provider, isActive, priority, configJson)
VALUES ('kling', 'Kling 2.6', 'video', 'Kuaishou', 1, 3,
  JSON_OBJECT(
    'supportsTextToVideo', true,
    'supportsImageToVideo', true,
    'supportedDurations', JSON_ARRAY('5', '10'),
    'defaultDuration', '5',
    'supportedAspectRatios', JSON_ARRAY('16:9', '9:16', '1:1'),
    'defaultAspectRatio', '16:9',
    'hasAudioSupport', true
  )
) ON DUPLICATE KEY UPDATE 
  modelName = 'Kling 2.6',
  isActive = 1,
  configJson = VALUES(configJson);

-- 4. UPDATE/INSERT UNIFIED 'Sora 2' CONFIGURATION
UPDATE aiModelConfig
SET 
  modelName = 'Sora 2',
  provider = 'OpenAI',
  isActive = 1,
  configJson = JSON_OBJECT(
    'supportsTextToVideo', true,
    'supportsImageToVideo', true,
    'supportedDurations', JSON_ARRAY('5', '10', '15', '20'), -- Sora 2 supports longer
    'defaultDuration', '10',
    'supportedQualities', JSON_ARRAY('standard', 'pro'), -- Sora 2 Pro as quality option
    'defaultQuality', 'standard',
    'supportedAspectRatios', JSON_ARRAY('16:9', '9:16', '1:1'),
    'hasAudioSupport', true
  )
WHERE modelKey = 'sora2';

-- 5. UPDATE/INSERT UNIFIED 'Seedance 1.5 Pro' CONFIGURATION
INSERT INTO aiModelConfig (modelKey, modelName, modelType, provider, isActive, priority, configJson)
VALUES ('seedance-15-pro', 'Seedance 1.5 Pro', 'video', 'ByteDance', 1, 4,
  JSON_OBJECT(
    'supportsTextToVideo', true,
    'supportsImageToVideo', true,
    'supportedDurations', JSON_ARRAY('5', '10'),
    'defaultDuration', '5',
    'supportedResolutions', JSON_ARRAY('720p', '1080p'),
    'defaultResolution', '720p',
    'supportedAspectRatios', JSON_ARRAY('16:9', '9:16'),
    'hasAudioSupport', true
  )
) ON DUPLICATE KEY UPDATE 
  modelName = 'Seedance 1.5 Pro', 
  isActive = 1,
  configJson = VALUES(configJson);

-- Verify
SELECT modelKey, modelName, isActive, JSON_PRETTY(configJson) FROM aiModelConfig WHERE modelKey IN ('veo3', 'sora2', 'kling', 'wan-26', 'seedance-15-pro');
