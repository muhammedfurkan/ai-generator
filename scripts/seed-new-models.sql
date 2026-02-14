-- Seed script for adding new AI models to aiModelConfig table
-- Run: npm run db:push

-- ============================================
-- IMAGE MODELS
-- ============================================

-- Seedream Models
INSERT INTO aiModelConfig (modelKey, modelName, modelType, provider, isActive, description) VALUES
('bytedance/seedream', 'Seedream 3.0', 'image', 'kie_ai', true, 'Text to image generation by Seedream 3.0'),
('bytedance/seedream-v4-text-to-image', 'Seedream 4.0', 'image', 'kie_ai', true, 'High-quality photorealistic image generation'),
('bytedance/seedream-v4-edit', 'Seedream 4.0 Edit', 'image', 'kie_ai', true, 'Image editing by Seedream 4.0'),
('bytedance/seedream-4.5-text-to-image', 'Seedream 4.5', 'image', 'kie_ai', true, 'High-quality photorealistic image generation'),
('bytedance/seedream-4.5-edit', 'Seedream 4.5 Edit', 'image', 'kie_ai', true, 'Image editing by Seedream 4.5'),

-- Z-Image
('z-image', 'Z-Image', 'image', 'kie_ai', true, 'Image generation by Z-Image'),

-- Google Imagen Models
('google/imagen4-fast', 'Imagen 4 Fast', 'image', 'kie_ai', true, 'Fast image generation by Google Imagen 4'),
('google/imagen4-ultra', 'Imagen 4 Ultra', 'image', 'kie_ai', true, 'Ultra quality image generation by Google Imagen 4'),
('google/imagen4', 'Imagen 4', 'image', 'kie_ai', true, 'Image generation by Google Imagen 4'),
('google/nano-banana-edit', 'Nano Banana Edit', 'image', 'kie_ai', true, 'Image editing using Google Nano Banana Edit'),
('google/nano-banana', 'Nano Banana', 'image', 'kie_ai', true, 'Image generation using Google Nano Banana'),
('google/pro-image-to-image', 'Nano Banana Pro', 'image', 'kie_ai', true, 'Pro Image to Image generation'),

-- Flux 2 Models
('flux-2/pro-image-to-image', 'Flux-2 Pro I2I', 'image', 'kie_ai', true, 'Image to Image by Flux-2 Pro'),
('flux-2/pro-text-to-image', 'Flux-2 Pro', 'image', 'kie_ai', true, 'High-quality photorealistic image generation by Flux-2'),
('flux-2/flex-image-to-image', 'Flux-2 Flex I2I', 'image', 'kie_ai', true, 'Image to Image by Flux-2 Flex'),
('flux-2/flex-text-to-image', 'Flux-2 Flex', 'image', 'kie_ai', true, 'Image generation by Flux-2 Flex'),

-- Grok Imagine Models
('grok-imagine/text-to-image', 'Grok Imagine', 'image', 'kie_ai', true, 'High-quality photorealistic image generation by Grok'),
('grok-imagine/image-to-image', 'Grok Imagine I2I', 'image', 'kie_ai', true, 'Image to Image by Grok Imagine'),

-- Grok Upscale
('grok-imagine/upscale', 'Grok Upscale', 'upscale', 'kie_ai', true, 'Enhance image resolution using Grok'),

-- GPT Image Models
('gpt-image/1.5-text-to-image', 'GPT Image 1.5', 'image', 'kie_ai', true, 'Generate images using GPT Image 1.5'),
('gpt-image/1.5-image-to-image', 'GPT Image 1.5 I2I', 'image', 'kie_ai', true, 'Image to Image using GPT Image 1.5'),

-- Topaz Upscale
('topaz/image-upscale', 'Topaz Upscale', 'upscale', 'kie_ai', true, 'Enhance image resolution using Topaz AI'),

-- Recraft Models
('recraft/remove-background', 'Recraft BG Remove', 'image', 'kie_ai', true, 'Remove background by Recraft'),
('recraft/crisp-upscale', 'Recraft Upscale', 'upscale', 'kie_ai', true, 'Enhance image resolution using Recraft'),

-- Ideogram Models
('ideogram/v3-reframe', 'Ideogram V3 Reframe', 'image', 'kie_ai', true, 'Image reframing by Ideogram'),
('ideogram/character-edit', 'Ideogram Character Edit', 'image', 'kie_ai', true, 'Character editing by Ideogram'),
('ideogram/character-remix', 'Ideogram Character Remix', 'image', 'kie_ai', true, 'Character remixing by Ideogram'),
('ideogram/character', 'Ideogram Character', 'image', 'kie_ai', true, 'Character generation by Ideogram'),

-- Qwen Models
('qwen/text-to-image', 'Qwen Text to Image', 'image', 'kie_ai', true, 'High-quality photorealistic image generation by Qwen'),
('qwen/image-to-image', 'Qwen Image to Image', 'image', 'kie_ai', true, 'Image to Image by Qwen'),
('qwen/image-edit', 'Qwen Image Edit', 'image', 'kie_ai', true, 'Image editing by Qwen');

-- ============================================
-- VIDEO MODELS
-- ============================================

-- Grok Imagine Video
INSERT INTO aiModelConfig (modelKey, modelName, modelType, provider, isActive, description, maxVideoDurationSeconds) VALUES
('grok-imagine/text-to-video', 'Grok Text to Video', 'video', 'kie_ai', true, 'High-quality video generation from text by Grok', 6),
('grok-imagine/image-to-video', 'Grok Image to Video', 'video', 'kie_ai', true, 'Transform images into videos by Grok', 6),

-- Kling Models
('kling/text-to-video', 'Kling 2.6 Text to Video', 'video', 'kie_ai', true, 'Generate videos from text with Kling 2.6', 10),
('kling/image-to-video', 'Kling 2.6 Image to Video', 'video', 'kie_ai', true, 'Convert images into videos with Kling 2.6', 10),
('kling/ai-avatar-standard', 'Kling AI Avatar Standard', 'video', 'kie_ai', true, 'AI Avatar generation - Standard quality', 10),
('kling/ai-avatar-pro', 'Kling AI Avatar Pro', 'video', 'kie_ai', true, 'AI Avatar generation - Pro quality', 10),
('kling/v2-1-master-image-to-video', 'Kling V2.1 Master I2V', 'video', 'kie_ai', true, 'Master quality Image to Video by Kling V2.1', 10),
('kling/v2-1-master-text-to-video', 'Kling V2.1 Master T2V', 'video', 'kie_ai', true, 'Master quality Text to Video by Kling V2.1', 10),
('kling/v2-1-pro', 'Kling V2.1 Pro', 'video', 'kie_ai', true, 'Pro quality by Kling V2.1', 10),
('kling/v2-1-standard', 'Kling V2.1 Standard', 'video', 'kie_ai', true, 'Standard quality by Kling V2.1', 10),
('kling/motion-control', 'Kling Motion Control', 'video', 'kie_ai', true, 'Advanced motion control for video generation', 10),

-- Bytedance (Seedance) Models
('bytedance/seedance-1.5-pro', 'Seedance 1.5 Pro', 'video', 'kie_ai', true, 'Generate high-quality videos with Seedance 1.5 Pro', 10),
('bytedance/v1-pro-fast-image-to-video', 'Bytedance V1 Pro Fast I2V', 'video', 'kie_ai', true, 'Fast Image to Video by Bytedance V1 Pro', 5),
('bytedance/v1-pro-image-to-video', 'Bytedance V1 Pro I2V', 'video', 'kie_ai', true, 'Image to Video by Bytedance V1 Pro', 10),
('bytedance/v1-pro-text-to-video', 'Bytedance V1 Pro T2V', 'video', 'kie_ai', true, 'Text to Video by Bytedance V1 Pro', 10),
('bytedance/v1-lite-image-to-video', 'Bytedance V1 Lite I2V', 'video', 'kie_ai', true, 'Image to Video by Bytedance V1 Lite', 5),
('bytedance/v1-lite-text-to-video', 'Bytedance V1 Lite T2V', 'video', 'kie_ai', true, 'Text to Video by Bytedance V1 Lite', 5),

-- Hailuo Models
('hailuo/2-3-image-to-video-pro', 'Hailuo 2.3 I2V Pro', 'video', 'kie_ai', true, 'Pro Image to Video by Hailuo 2.3', 10),
('hailuo/2-3-image-to-video-standard', 'Hailuo 2.3 I2V Standard', 'video', 'kie_ai', true, 'Standard Image to Video by Hailuo 2.3', 5),
('hailuo/02-text-to-video-pro', 'Hailuo 02 T2V Pro', 'video', 'kie_ai', true, 'Pro Text to Video by Hailuo 02', 10),
('hailuo/02-text-to-video-standard', 'Hailuo 02 T2V Standard', 'video', 'kie_ai', true, 'Standard Text to Video by Hailuo 02', 5),
('hailuo/02-image-to-video-pro', 'Hailuo 02 I2V Pro', 'video', 'kie_ai', true, 'Pro Image to Video by Hailuo 02', 10),
('hailuo/02-image-to-video-standard', 'Hailuo 02 I2V Standard', 'video', 'kie_ai', true, 'Standard Image to Video by Hailuo 02', 5),

-- Sora2 Models
('sora2/sora-2-image-to-video', 'Sora 2 I2V', 'video', 'kie_ai', true, 'Image to Video by Sora 2', 10),
('sora2/sora-2-text-to-video', 'Sora 2 T2V', 'video', 'kie_ai', true, 'Text to Video by Sora 2', 10),
('sora2/sora-2-pro-image-to-video', 'Sora 2 Pro I2V', 'video', 'kie_ai', true, 'Pro Image to Video by Sora 2', 10),
('sora2/sora-2-pro-text-to-video', 'Sora 2 Pro T2V', 'video', 'kie_ai', true, 'Pro Text to Video by Sora 2', 10),
('sora2/sora-watermark-remover', 'Sora Watermark Remove', 'video', 'kie_ai', true, 'Remove watermarks from Sora videos', 10),
('sora-2-pro-storyboard', 'Sora 2 Pro Storyboard', 'video', 'kie_ai', true, 'Storyboard generation by Sora 2 Pro', 10),
('sora2/sora-2-characters', 'Sora 2 Characters', 'video', 'kie_ai', true, 'Character animation by Sora 2', 10),

-- Wan Models
('wan/2-6-image-to-video', 'Wan 2.6 I2V', 'video', 'kie_ai', true, 'Image to Video by Wan 2.6', 10),
('wan/2-6-text-to-video', 'Wan 2.6 T2V', 'video', 'kie_ai', true, 'Text to Video by Wan 2.6', 10),
('wan/2-6-video-to-video', 'Wan 2.6 V2V', 'video', 'kie_ai', true, 'Video to Video by Wan 2.6', 10),
('wan/2-2-a14b-image-to-video-turbo', 'Wan 2.2 I2V Turbo', 'video', 'kie_ai', true, 'Turbo Image to Video by Wan 2.2', 5),
('wan/2-2-a14b-text-to-video-turbo', 'Wan 2.2 T2V Turbo', 'video', 'kie_ai', true, 'Turbo Text to Video by Wan 2.2', 5),
('wan/2-2-animate-move', 'Wan 2.2 Animate Move', 'video', 'kie_ai', true, 'Animate with movement by Wan 2.2', 5),
('wan/2-2-animate-replace', 'Wan 2.2 Animate Replace', 'video', 'kie_ai', true, 'Animate with replacement by Wan 2.2', 5),
('wan/2-2-a14b-speech-to-video-turbo', 'Wan 2.2 S2V Turbo', 'video', 'kie_ai', true, 'Speech to Video by Wan 2.2 Turbo', 5);
