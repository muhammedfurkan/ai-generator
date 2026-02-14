-- Update configJson for all image and video models
-- This script sets the model-specific configuration for UI dynamic controls

-- ===== IMAGE MODELS =====

-- Seedream Models
UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"],
  "supportedResolutions": ["1K", "2K", "4K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "2K",
  "supportsReferenceImage": false,
  "maxReferenceImages": 0
}' WHERE modelKey = 'bytedance/seedream';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"],
  "supportedResolutions": ["1K", "2K", "4K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "2K",
  "supportsReferenceImage": false,
  "maxReferenceImages": 0
}' WHERE modelKey = 'bytedance/seedream-v4-text-to-image';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"],
  "supportedResolutions": ["1K", "2K", "4K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "2K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 1
}' WHERE modelKey = 'bytedance/seedream-v4-edit';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"],
  "supportedResolutions": ["1K", "2K", "4K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "2K",
  "supportsReferenceImage": false,
  "maxReferenceImages": 0
}' WHERE modelKey = 'bytedance/seedream-4.5-text-to-image';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"],
  "supportedResolutions": ["1K", "2K", "4K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "2K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 1
}' WHERE modelKey = 'bytedance/seedream-4.5-edit';

-- Z-Image
UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1"],
  "supportedResolutions": ["1K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": false,
  "maxReferenceImages": 0
}' WHERE modelKey = 'z-image';

-- Google Imagen Models
UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4"],
  "supportedResolutions": ["1K", "2K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": false,
  "maxReferenceImages": 0
}' WHERE modelKey = 'google/imagen4-fast';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4"],
  "supportedResolutions": ["2K", "4K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "2K",
  "supportsReferenceImage": false,
  "maxReferenceImages": 0
}' WHERE modelKey = 'google/imagen4-ultra';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4"],
  "supportedResolutions": ["1K", "2K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": false,
  "maxReferenceImages": 0
}' WHERE modelKey = 'google/imagen4';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4", "2:3", "3:2"],
  "supportedResolutions": ["1K", "2K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 1
}' WHERE modelKey = 'google/nano-banana-edit';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4", "2:3", "3:2"],
  "supportedResolutions": ["1K", "2K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": false,
  "maxReferenceImages": 0
}' WHERE modelKey = 'google/nano-banana';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4", "2:3", "3:2"],
  "supportedResolutions": ["1K", "2K"],
  "defaultAspectRatio": "16:9",
  "defaultResolution": "2K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 8
}' WHERE modelKey = 'google/pro-image-to-image';

-- Flux 2 Models
UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "21:9", "4:3", "3:4", "2:3", "3:2"],
  "supportedResolutions": ["1K", "2K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "2K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 1
}' WHERE modelKey = 'flux-2/pro-image-to-image';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "21:9", "4:3", "3:4", "2:3", "3:2"],
  "supportedResolutions": ["1K", "2K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "2K",
  "supportsReferenceImage": false,
  "maxReferenceImages": 0
}' WHERE modelKey = 'flux-2/pro-text-to-image';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "21:9", "4:3", "3:4", "2:3", "3:2"],
  "supportedResolutions": ["1K", "2K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 1
}' WHERE modelKey = 'flux-2/flex-image-to-image';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "21:9", "4:3", "3:4", "2:3", "3:2"],
  "supportedResolutions": ["1K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": false,
  "maxReferenceImages": 0
}' WHERE modelKey = 'flux-2/flex-text-to-image';

-- Grok Imagine
UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4"],
  "supportedResolutions": ["1K", "2K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": false,
  "maxReferenceImages": 0
}' WHERE modelKey = 'grok-imagine/text-to-image';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4"],
  "supportedResolutions": ["1K", "2K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 1
}' WHERE modelKey = 'grok-imagine/image-to-image';

-- GPT Image
UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "3:2", "2:3"],
  "supportedResolutions": ["1K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": false,
  "maxReferenceImages": 0
}' WHERE modelKey = 'gpt-image/1.5-text-to-image';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "3:2", "2:3"],
  "supportedResolutions": ["1K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 1
}' WHERE modelKey = 'gpt-image/1.5-image-to-image';

-- Recraft Models
UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1"],
  "supportedResolutions": ["1K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 1
}' WHERE modelKey = 'recraft/remove-background';

-- Ideogram Models
UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "3:2", "2:3"],
  "supportedResolutions": ["1K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": false,
  "maxReferenceImages": 0
}' WHERE modelKey = 'ideogram/v3-reframe';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "3:2", "2:3"],
  "supportedResolutions": ["1K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 1
}' WHERE modelKey = 'ideogram/character-edit';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "3:2", "2:3"],
  "supportedResolutions": ["1K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 1
}' WHERE modelKey = 'ideogram/character-remix';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "3:2", "2:3"],
  "supportedResolutions": ["1K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": false,
  "maxReferenceImages": 0
}' WHERE modelKey = 'ideogram/character';

-- Qwen Models
UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4"],
  "supportedResolutions": ["1K", "2K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": false,
  "maxReferenceImages": 0
}' WHERE modelKey = 'qwen/text-to-image';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4"],
  "supportedResolutions": ["1K", "2K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 1
}' WHERE modelKey = 'qwen/image-to-image';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4"],
  "supportedResolutions": ["1K", "2K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "1K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 1
}' WHERE modelKey = 'qwen/image-edit';

-- ===== UPSCALE MODELS =====

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1"],
  "supportedResolutions": ["2K", "4K", "8K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "4K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 1,
  "upscaleFactors": ["2x", "4x", "8x"]
}' WHERE modelKey = 'grok-imagine/upscale';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1"],
  "supportedResolutions": ["2K", "4K", "8K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "4K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 1,
  "upscaleFactors": ["2x", "4x", "8x"]
}' WHERE modelKey = 'topaz/image-upscale';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["1:1"],
  "supportedResolutions": ["2K", "4K"],
  "defaultAspectRatio": "1:1",
  "defaultResolution": "2K",
  "supportsReferenceImage": true,
  "maxReferenceImages": 1,
  "upscaleFactors": ["2x", "4x"]
}' WHERE modelKey = 'recraft/crisp-upscale';

-- ===== VIDEO MODELS =====

-- Grok Imagine Video
UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["3", "6"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "6",
  "defaultQuality": "standard",
  "supportsImageToVideo": false,
  "supportsAudio": false
}' WHERE modelKey = 'grok-imagine/text-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["3", "6"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "6",
  "defaultQuality": "standard",
  "supportsImageToVideo": true,
  "supportsAudio": false
}' WHERE modelKey = 'grok-imagine/image-to-video';

-- Kling Models
UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["standard", "pro"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "standard",
  "supportsImageToVideo": false,
  "supportsAudio": true
}' WHERE modelKey = 'kling/text-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["standard", "pro"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "standard",
  "supportsImageToVideo": true,
  "supportsAudio": true
}' WHERE modelKey = 'kling/image-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "standard",
  "supportsImageToVideo": true,
  "supportsAudio": false
}' WHERE modelKey = 'kling/ai-avatar-standard';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["pro", "high"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "pro",
  "supportsImageToVideo": true,
  "supportsAudio": false
}' WHERE modelKey = 'kling/ai-avatar-pro';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["master"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "master",
  "supportsImageToVideo": true,
  "supportsAudio": true
}' WHERE modelKey = 'kling/v2-1-master-image-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["master"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "master",
  "supportsImageToVideo": false,
  "supportsAudio": true
}' WHERE modelKey = 'kling/v2-1-master-text-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["pro"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "pro",
  "supportsImageToVideo": true,
  "supportsAudio": true
}' WHERE modelKey = 'kling/v2-1-pro';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "standard",
  "supportsImageToVideo": true,
  "supportsAudio": false
}' WHERE modelKey = 'kling/v2-1-standard';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "standard",
  "supportsImageToVideo": true,
  "supportsAudio": false,
  "supportsMotionControl": true
}' WHERE modelKey = 'kling/motion-control';

-- Bytedance/Seedance Models
UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["pro"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "pro",
  "supportsImageToVideo": true,
  "supportsAudio": true
}' WHERE modelKey = 'bytedance/seedance-1.5-pro';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5"],
  "supportedQualities": ["fast"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "fast",
  "supportsImageToVideo": true,
  "supportsAudio": false
}' WHERE modelKey = 'bytedance/v1-pro-fast-image-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["pro"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "pro",
  "supportsImageToVideo": true,
  "supportsAudio": false
}' WHERE modelKey = 'bytedance/v1-pro-image-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["pro"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "pro",
  "supportsImageToVideo": false,
  "supportsAudio": false
}' WHERE modelKey = 'bytedance/v1-pro-text-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5"],
  "supportedQualities": ["lite"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "lite",
  "supportsImageToVideo": true,
  "supportsAudio": false
}' WHERE modelKey = 'bytedance/v1-lite-image-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5"],
  "supportedQualities": ["lite"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "lite",
  "supportsImageToVideo": false,
  "supportsAudio": false
}' WHERE modelKey = 'bytedance/v1-lite-text-to-video';

-- Hailuo Models
UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["pro"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "pro",
  "supportsImageToVideo": true,
  "supportsAudio": false
}' WHERE modelKey = 'hailuo/2-3-image-to-video-pro';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "standard",
  "supportsImageToVideo": true,
  "supportsAudio": false
}' WHERE modelKey = 'hailuo/2-3-image-to-video-standard';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["pro"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "pro",
  "supportsImageToVideo": false,
  "supportsAudio": false
}' WHERE modelKey = 'hailuo/02-text-to-video-pro';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "standard",
  "supportsImageToVideo": false,
  "supportsAudio": false
}' WHERE modelKey = 'hailuo/02-text-to-video-standard';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["pro"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "pro",
  "supportsImageToVideo": true,
  "supportsAudio": false
}' WHERE modelKey = 'hailuo/02-image-to-video-pro';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "standard",
  "supportsImageToVideo": true,
  "supportsAudio": false
}' WHERE modelKey = 'hailuo/02-image-to-video-standard';

-- Sora2 Models
UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["10", "15"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "10",
  "defaultQuality": "standard",
  "supportsImageToVideo": true,
  "supportsAudio": false
}' WHERE modelKey = 'sora2/sora-2-image-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["10", "15"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "10",
  "defaultQuality": "standard",
  "supportsImageToVideo": false,
  "supportsAudio": false
}' WHERE modelKey = 'sora2/sora-2-text-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["10", "15", "20"],
  "supportedQualities": ["pro"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "15",
  "defaultQuality": "pro",
  "supportsImageToVideo": true,
  "supportsAudio": true
}' WHERE modelKey = 'sora2/sora-2-pro-image-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["10", "15", "20"],
  "supportedQualities": ["pro"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "15",
  "defaultQuality": "pro",
  "supportsImageToVideo": false,
  "supportsAudio": true
}' WHERE modelKey = 'sora2/sora-2-pro-text-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9"],
  "supportedDurations": ["10"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "10",
  "defaultQuality": "standard",
  "supportsImageToVideo": true,
  "supportsAudio": false,
  "isUtility": true
}' WHERE modelKey = 'sora2/sora-watermark-remover';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16"],
  "supportedDurations": ["10", "15"],
  "supportedQualities": ["pro"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "10",
  "defaultQuality": "pro",
  "supportsImageToVideo": true,
  "supportsAudio": true,
  "supportsStoryboard": true
}' WHERE modelKey = 'sora-2-pro-storyboard';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["10", "15"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "10",
  "defaultQuality": "standard",
  "supportsImageToVideo": true,
  "supportsAudio": false,
  "supportsCharacterAnimation": true
}' WHERE modelKey = 'sora2/sora-2-characters';

-- Wan Models
UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "standard",
  "supportsImageToVideo": true,
  "supportsAudio": true
}' WHERE modelKey = 'wan/2-6-image-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "standard",
  "supportsImageToVideo": false,
  "supportsAudio": true
}' WHERE modelKey = 'wan/2-6-text-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16", "1:1"],
  "supportedDurations": ["5", "10"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "standard",
  "supportsImageToVideo": false,
  "supportsAudio": true,
  "supportsVideoToVideo": true
}' WHERE modelKey = 'wan/2-6-video-to-video';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16"],
  "supportedDurations": ["5"],
  "supportedQualities": ["turbo"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "turbo",
  "supportsImageToVideo": true,
  "supportsAudio": false
}' WHERE modelKey = 'wan/2-2-a14b-image-to-video-turbo';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16"],
  "supportedDurations": ["5"],
  "supportedQualities": ["turbo"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "turbo",
  "supportsImageToVideo": false,
  "supportsAudio": false
}' WHERE modelKey = 'wan/2-2-a14b-text-to-video-turbo';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9"],
  "supportedDurations": ["5"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "standard",
  "supportsImageToVideo": true,
  "supportsAudio": false,
  "supportsAnimation": true
}' WHERE modelKey = 'wan/2-2-animate-move';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9"],
  "supportedDurations": ["5"],
  "supportedQualities": ["standard"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "standard",
  "supportsImageToVideo": true,
  "supportsAudio": false,
  "supportsAnimation": true
}' WHERE modelKey = 'wan/2-2-animate-replace';

UPDATE aiModelConfig SET configJson = '{
  "supportedAspectRatios": ["16:9", "9:16"],
  "supportedDurations": ["5"],
  "supportedQualities": ["turbo"],
  "defaultAspectRatio": "16:9",
  "defaultDuration": "5",
  "defaultQuality": "turbo",
  "supportsImageToVideo": false,
  "supportsAudio": true,
  "supportsSpeechToVideo": true
}' WHERE modelKey = 'wan/2-2-a14b-speech-to-video-turbo';

SELECT 'Model configurations updated successfully!' AS Status;
