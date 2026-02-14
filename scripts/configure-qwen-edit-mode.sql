-- QWEN Model Edit Mode Configuration
-- Adds support for edit mode toggle (similar to SeeDream 4.5)
-- This enables the user to toggle between text-to-image and edit mode on the frontend

UPDATE aiModelConfig 
SET configJson = JSON_OBJECT(
  'supportedAspectRatios', JSON_ARRAY('1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'),
  'supportedResolutions', JSON_ARRAY('1K', '2K'),
  'defaultAspectRatio', '1:1',
  'defaultResolution', '1K',
  'supportsReferenceImage', false,
  'maxReferenceImages', 0,
  'supportsEditMode', true,
  'editModeMaxReferenceImages', 3
)
WHERE modelKey = 'qwen';

-- Verify the update
SELECT modelKey, modelName, configJson 
FROM aiModelConfig 
WHERE modelKey = 'qwen';
