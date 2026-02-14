-- Veo 3.1 Model Configuration
-- Based on kie.ai/veo-3-1 playground interface

UPDATE aiModelConfig
SET 
  modelName = 'Veo 3.1',
  provider = 'Google DeepMind',
  isActive = 1,
  isMaintenanceMode = 0,
  configJson = JSON_OBJECT(
    -- Supported generation types
    'supportsTextToVideo', true,
    'supportsImageToVideo', true,
    'supportsReferenceVideo', true,
    'supportsVideoToVideo', false,
    
    -- Quality options (Fast and Quality)
    'supportedQualities', JSON_ARRAY('fast', 'quality'),
    'defaultQuality', 'fast',
    
    -- Aspect ratios (Horizontal 16:9, Vertical 9:16)
    'supportedAspectRatios', JSON_ARRAY('16:9', '9:16'),
    'defaultAspectRatio', '16:9',
    
    -- Duration is automatic, no manual selection
    'supportedDurations', JSON_ARRAY('auto'),
    'defaultDuration', 'auto',
    
    -- Additional features
    'hasAudioSupport', false,
    'hasMultiShotSupport', false,
    'supportedResolutions', JSON_ARRAY()
  )
WHERE modelKey = 'veo3';

-- Verify the update
SELECT 
  modelKey, 
  modelName, 
  provider,
  isActive,
  JSON_PRETTY(configJson) as configuration
FROM aiModelConfig 
WHERE modelKey = 'veo3';
