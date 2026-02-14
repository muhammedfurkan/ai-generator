import { ENV } from "./_core/env";

const KIE_AI_BASE_URL = "https://api.kie.ai";

// Video model types
export type VideoModel =
  | "veo3.1-quality"
  | "veo3.1-fast"
  // Sora 2 Models
  | "sora-2-text-to-video"
  | "sora-2-image-to-video"
  | "sora-2-pro"
  | "sora-2-pro-storyboard"
  | "sora2/sora-2-image-to-video"
  | "sora2/sora-2-text-to-video"
  | "sora2/sora-2-pro-image-to-video"
  | "sora2/sora-2-pro-text-to-video"
  | "sora2/sora-watermark-remover"
  | "sora-2-pro-storyboard"
  | "sora2/sora-2-characters"
  | "sora-watermark-remover"
  // Kling Models
  | "kling-2.1/text-to-video"
  | "kling-2.1/image-to-video"
  | "kling-2.5/text-to-video"
  | "kling-2.5/image-to-video"
  | "kling-2.6/text-to-video"
  | "kling-2.6/image-to-video"
  | "kling-2.6/video-to-video"
  | "kling-2.6/motion-control"
  | "kling/text-to-video"
  | "kling/image-to-video"
  | "kling/ai-avatar-standard"
  | "kling/ai-avatar-pro"
  | "kling/v2-1-master-image-to-video"
  | "kling/v2-1-master-text-to-video"
  | "kling/v2-1-pro"
  | "kling/v2-1-standard"
  | "kling/motion-control"
  // Bytedance/Seedance Models
  | "bytedance/seedance-1.0-lite"
  | "bytedance/seedance-1.0-pro"
  | "bytedance/seedance-1.5-pro"
  | "bytedance/v1-pro-fast-image-to-video"
  | "bytedance/v1-pro-image-to-video"
  | "bytedance/v1-pro-text-to-video"
  | "bytedance/v1-lite-image-to-video"
  | "bytedance/v1-lite-text-to-video"
  // Hailuo Models
  | "hailuo-2.3"
  | "hailuo/2-3-image-to-video-pro"
  | "hailuo/2-3-image-to-video-standard"
  | "hailuo/02-text-to-video-pro"
  | "hailuo/02-text-to-video-standard"
  | "hailuo/02-image-to-video-pro"
  | "hailuo/02-image-to-video-standard"
  // Wan Models
  | "wan-2.2"
  | "wan2.5-t2v-preview"
  | "wan2.5-i2v-preview"
  | "wan/2-6-text-to-video"
  | "wan/2-6-image-to-video"
  | "wan/2-6-video-to-video"
  | "wan/2-2-a14b-image-to-video-turbo"
  | "wan/2-2-a14b-text-to-video-turbo"
  | "wan/2-2-animate-move"
  | "wan/2-2-animate-replace"
  | "wan/2-2-a14b-speech-to-video-turbo"
  // Grok Imagine
  | "grok-imagine/text-to-video"
  | "grok-imagine/image-to-video"
  // Runway
  | "runway-gen3-alpha";


// Model pricing (in credits) - Based on Kie.ai official pricing
export const VIDEO_MODEL_PRICING: Record<string, number> = {
  // Veo 3.1 (Google) - Always 8s, pricing varies by mode
  "veo3.1-fast": 60,
  "veo3.1-quality": 250,
  "veo3.1-4k-upgrade": 120, // Additional cost for 4K
  // Legacy model names for backward compatibility
  "veo3_fast": 60,
  "veo3": 250,

  // Grok Imagine (6s video)
  "grok-imagine/text-to-video": 15,
  "grok-imagine/image-to-video": 15,

  // Sora 2
  "sora-2-image-to-video-10s": 24,
  "sora-2-image-to-video-15s": 30,

  // Sora 2 Pro - Quality and Duration based
  "sora-2-pro-standard-10s": 150,
  "sora-2-pro-standard-15s": 270,
  "sora-2-pro-high-10s": 330,
  "sora-2-pro-high-15s": 630,
  "sora-2-pro-storyboard": 80, // Storyboard mode

  // Kling 2.1 (5s/10s video)
  "kling-2.1/text-to-video-5s": 35,
  "kling-2.1/text-to-video-10s": 60,
  "kling-2.1/image-to-video-5s": 35,
  "kling-2.1/image-to-video-10s": 60,

  // Kling 2.5 (5s/10s video)
  "kling-2.5/text-to-video-5s": 40,
  "kling-2.5/text-to-video-10s": 70,
  "kling-2.5/image-to-video-5s": 40,
  "kling-2.5/image-to-video-10s": 70,

  // Kling 2.6 - Duration and Audio based (audio doubles the price)
  "kling-2.6-5s": 55,
  "kling-2.6-5s-audio": 110,
  "kling-2.6-10s": 110,
  "kling-2.6-10s-audio": 220,
  // Kling 2.6 Motion Control (per second pricing)
  "kling-2.6-motion-720p-per-sec": 6,
  "kling-2.6-motion-1080p-per-sec": 9,

  // Seedance 1.0 (ByteDance)
  "seedance/1.0-lite-3s": 20,
  "seedance/1.0-lite-6s": 35,
  "seedance/1.0-pro-3s": 30,
  "seedance/1.0-pro-6s": 50,

  // Seedance 1.5 Pro - Resolution, Duration and Audio based
  "seedance-1.5-pro-480p-4s": 8,
  "seedance-1.5-pro-480p-4s-audio": 14,
  "seedance-1.5-pro-480p-8s": 14,
  "seedance-1.5-pro-480p-8s-audio": 28,
  "seedance-1.5-pro-480p-12s": 19,
  "seedance-1.5-pro-480p-12s-audio": 38,
  "seedance-1.5-pro-720p-4s": 14,
  "seedance-1.5-pro-720p-4s-audio": 28,
  "seedance-1.5-pro-720p-8s": 28,
  "seedance-1.5-pro-720p-8s-audio": 56,
  "seedance-1.5-pro-720p-12s": 42,
  "seedance-1.5-pro-720p-12s-audio": 84,

  // Hailuo (MiniMax AI video model)
  "hailuo-2.3/text-to-video-6s": 25,
  "hailuo-2.3/image-to-video-6s": 25,

  // Wan 2.6 (Alibaba) - Resolution and Duration based
  "wan-2.6-720p-5s": 70,
  "wan-2.6-720p-10s": 140,
  "wan-2.6-720p-15s": 210,
  "wan-2.6-1080p-5s": 104.5,
  "wan-2.6-1080p-10s": 209.5,
  "wan-2.6-1080p-15s": 315,
  // Wan 2.2 and 2.5 (older versions)
  "wan-2.2-5s": 30,
  "wan-2.2-10s": 55,
  "wan2.5-t2v-preview-5s": 35,
  "wan2.5-t2v-preview-10s": 60,
  "wan2.5-i2v-preview-5s": 35,
  "wan2.5-i2v-preview-10s": 60,

  // Sora Watermark Remover
  "sora-watermark-remover": 20,

  // Runway Gen-3 Alpha
  "runway-gen3-alpha": 60,
};

// Calculate credit cost based on model and options
export function calculateVideoCreditCost(
  model: string,
  options: { duration?: string; sound?: boolean; quality?: string; resolution?: string }
): number {
  const { duration = "5", sound = false, quality = "standard", resolution = "720p" } = options;

  // Veo 3.1 (Always 8s, pricing by mode)
  if (model.startsWith("veo3")) {
    const mode = quality === "quality" || quality === "high" ? "quality" : "fast";
    let cost = mode === "quality" ? 250 : 60;
    // 4K upgrade adds extra 120 credits
    if (resolution === "4K" || resolution === "4k") {
      cost += 120;
    }
    return cost;
  }

  // Grok Imagine (always 6s)
  if (model.startsWith("grok-imagine")) {
    return 15;
  }

  // Sora 2 Pro - Quality and duration based
  if (model === "sora-2-pro") {
    const durationKey = duration === "15" || duration === "15s" ? "15s" : "10s";
    // Default to Standard quality unless explicitly set to high/pro
    const qualityKey = quality === "high" || quality === "pro" ? "high" : "standard";
    return VIDEO_MODEL_PRICING[`sora-2-pro-${qualityKey}-${durationKey}`] || 150;
  }

  // Sora 2 Pro Storyboard
  if (model === "sora-2-pro-storyboard") {
    return VIDEO_MODEL_PRICING["sora-2-pro-storyboard"] || 80;
  }

  // Sora 2 Normal (Standard quality)
  if (model.startsWith("sora-2")) {
    const durationKey = duration === "15" || duration === "15s" ? "15s" : "10s";
    const key = `${model}-${durationKey}`;
    return VIDEO_MODEL_PRICING[key] || 24;
  }

  // Kling 2.1
  if (model.startsWith("kling-2.1")) {
    const durationKey = duration === "10" ? "10s" : "5s";
    const key = `${model}-${durationKey}`;
    return VIDEO_MODEL_PRICING[key] || 35;
  }

  // Kling 2.5
  if (model.startsWith("kling-2.5")) {
    const durationKey = duration === "10" ? "10s" : "5s";
    const key = `${model}-${durationKey}`;
    return VIDEO_MODEL_PRICING[key] || 40;
  }

  // Kling 2.6 - Duration and audio based
  if (model.startsWith("kling-2.6")) {
    // Motion Control uses per-second pricing
    if (model.includes("motion-control") || model === "kling-2.6-motion") {
      const res = resolution === "1080p" ? "1080p" : "720p";
      const pricePerSecond = VIDEO_MODEL_PRICING[`kling-2.6-motion-${res}-per-sec`] || 6;
      return pricePerSecond * parseInt(duration || "5");
    }
    // Regular text-to-video and image-to-video
    const dur = duration === "10" ? "10s" : "5s";
    const audio = sound ? "-audio" : "";
    return VIDEO_MODEL_PRICING[`kling-2.6-${dur}${audio}`] || 55;
  }

  // Seedance 1.0 Lite
  if (model.startsWith("seedance/1.0-lite")) {
    const durationKey = duration === "6" ? "6s" : "3s";
    return VIDEO_MODEL_PRICING[`seedance/1.0-lite-${durationKey}`] || 20;
  }

  // Seedance 1.0 Pro
  if (model.startsWith("seedance/1.0-pro")) {
    const durationKey = duration === "6" ? "6s" : "3s";
    return VIDEO_MODEL_PRICING[`seedance/1.0-pro-${durationKey}`] || 30;
  }

  // Seedance 1.5 Pro - Resolution, duration and audio based
  if (model === "seedance/1.5-pro" || model === "bytedance/seedance-1.5-pro") {
    const res = resolution === "480p" ? "480p" : "720p";
    const dur = duration === "12" ? "12s" : duration === "8" ? "8s" : "4s";
    const audio = sound ? "-audio" : "";
    return VIDEO_MODEL_PRICING[`seedance-1.5-pro-${res}-${dur}${audio}`] || 14;
  }

  // Hailuo 2.3 (always 6s)
  if (model.startsWith("hailuo-2.3")) {
    return VIDEO_MODEL_PRICING[`${model}-6s`] || 25;
  }

  // Wan 2.6 - Resolution and duration based
  if (model.startsWith("wan-2.6") || model === "wan/2-6-text-to-video" || model === "wan/2-6-image-to-video") {
    // Default to 720p unless explicitly set to 1080p to reduce costs
    const res = resolution === "1080p" || resolution === "1080P" ? "1080p" : "720p";
    const dur = duration === "15" || duration === "15s" ? "15s" : duration === "10" || duration === "10s" ? "10s" : "5s";
    return VIDEO_MODEL_PRICING[`wan-2.6-${res}-${dur}`] || 70;
  }

  // Wan 2.2 and 2.5 (older versions)
  if (model.startsWith("wan-2.2")) {
    const durationKey = duration === "10" ? "10s" : "5s";
    return VIDEO_MODEL_PRICING[`wan-2.2-${durationKey}`] || 30;
  }
  if (model.startsWith("wan2.5")) {
    const durationKey = duration === "10" ? "10s" : "5s";
    const key = `${model}-${durationKey}`;
    return VIDEO_MODEL_PRICING[key] || 35;
  }

  // Sora Watermark Remover
  if (model === "sora-watermark-remover") {
    return VIDEO_MODEL_PRICING["sora-watermark-remover"] || 20;
  }

  // Runway
  if (model === "runway-gen3-alpha") {
    return VIDEO_MODEL_PRICING["runway-gen3-alpha"] || 60;
  }

  return 50; // Default
}

interface KieAiResponse {
  code: number;
  msg: string;
  data?: {
    taskId: string;
    [key: string]: unknown;
  };
}

interface VeoStatusResponse {
  code: number;
  msg: string;
  data?: {
    taskId: string;
    successFlag: number; // 0: processing, 1: success, 2/3: failed
    resultUrls?: string; // Eski format (string)
    response?: {
      taskId: string;
      resolution: string;
      originUrls: string[] | null;
      resultUrls: string[]; // Yeni format (array)
      hasAudioList: boolean[];
      seeds: number[];
    };
    errorCode?: number | null;
    errorMessage?: string | null;
    [key: string]: unknown;
  };
}

interface TaskStatusResponse {
  code: number;
  msg: string;
  data?: {
    taskId: string;
    model: string;
    state: string; // "waiting", "success", "fail"
    param: string; // JSON string of original params
    resultJson?: string; // JSON string with resultUrls array
    failCode?: string;
    failMsg?: string;
    costTime?: number;
    completeTime?: number;
    createTime: number;
    [key: string]: unknown;
  };
}

// Get API key from environment
function getApiKey(): string {
  const apiKey = ENV.kieAiApiKey;
  if (!apiKey) {
    throw new Error("KIE_AI_API_KEY is not configured");
  }
  return apiKey;
}

// Generic API request helper
async function makeRequest<T>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, unknown>
): Promise<T> {
  const url = `${KIE_AI_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method === "POST") {
    options.body = JSON.stringify(body);
  }

  console.log(`[KieAI] ${method} ${endpoint}`, body ? JSON.stringify(body).substring(0, 200) : "");

  const response = await fetch(url, options);
  const data = await response.json() as T;

  console.log(`[KieAI] Response:`, JSON.stringify(data).substring(0, 500));

  return data;
}

// ============ VEO 3.1 API ============
// Endpoint: POST /api/v1/veo/generate
// Status: GET /api/v1/veo/record-info?taskId=XXX
// 1080P: GET /api/v1/veo/get-1080p-video?taskId=XXX

export interface Veo31GenerateParams {
  prompt: string;
  imageUrls?: string[]; // 1-3 reference images for image-to-video
  model?: "veo3" | "veo3_fast";
  aspectRatio?: "16:9" | "9:16" | "Auto";
  generationType?: "TEXT_2_VIDEO" | "FIRST_AND_LAST_FRAMES_2_VIDEO" | "REFERENCE_2_VIDEO";
  enableTranslation?: boolean;
  enableFallback?: boolean;
  seeds?: number;
  watermark?: string;
  callBackUrl?: string;
}

export async function generateVeo31Video(params: Veo31GenerateParams): Promise<KieAiResponse> {
  const {
    prompt,
    imageUrls,
    model = "veo3_fast",
    aspectRatio = "16:9",
    generationType,
    enableTranslation = true,
    enableFallback = false,
    seeds,
    watermark,
    callBackUrl
  } = params;

  const body: Record<string, unknown> = {
    prompt,
    model,
    aspectRatio,
    enableTranslation,
    enableFallback,
  };

  // Add reference images for image-to-video
  if (imageUrls && imageUrls.length > 0) {
    body.imageUrls = imageUrls;
    // Auto-detect generation type if not specified
    if (!generationType) {
      // REFERENCE_2_VIDEO only supports 16:9 and veo3_fast
      // FIRST_AND_LAST_FRAMES_2_VIDEO supports all aspect ratios
      body.generationType = "FIRST_AND_LAST_FRAMES_2_VIDEO";
    }
  }

  if (generationType) {
    body.generationType = generationType;
  }

  if (seeds !== undefined) {
    body.seeds = seeds;
  }

  if (watermark) {
    body.watermark = watermark;
  }

  if (callBackUrl) {
    body.callBackUrl = callBackUrl;
  }

  return makeRequest<KieAiResponse>("/api/v1/veo/generate", "POST", body);
}

export async function getVeo31Status(taskId: string): Promise<VeoStatusResponse> {
  return makeRequest<VeoStatusResponse>(`/api/v1/veo/record-info?taskId=${taskId}`);
}

export async function getVeo31HD(taskId: string): Promise<KieAiResponse> {
  return makeRequest<KieAiResponse>(`/api/v1/veo/get-1080p-video?taskId=${taskId}`);
}

// Veo 3.1 4K Video (POST request, supports both 16:9 and 9:16)
// ~2x credit cost of Fast mode, recommended with callbacks, ~5-10min processing
export async function getVeo314K(taskId: string, callBackUrl?: string): Promise<KieAiResponse> {
  const body: Record<string, unknown> = { taskId };
  if (callBackUrl) {
    body.callBackUrl = callBackUrl;
  }
  return makeRequest<KieAiResponse>(`/api/v1/veo/get-4k-video`, "POST", body);
}


// ============ GENERIC VIDEO API (Sora, Kling, Grok) ============

export interface GenericVideoParams {
  model: VideoModel;
  prompt: string;
  imageUrl?: string;
  videoUrl?: string; // Reference video
  aspectRatio?: string;
  duration?: string;
  sound?: boolean;
  mode?: string;
  nFrames?: string;
  removeWatermark?: boolean;
  characterOrientation?: "image" | "video";
  quality?: string;
  callBackUrl?: string;
}

export async function generateGenericVideo(params: GenericVideoParams): Promise<KieAiResponse> {
  const {
    model,
    prompt,
    imageUrl,
    videoUrl,
    aspectRatio,
    duration,
    sound,
    mode,
    nFrames,
    removeWatermark,
    characterOrientation,
    quality,
    callBackUrl
  } = params;

  console.log("params------>", params)

  const input: Record<string, unknown> = {
    prompt,
  };

  // Motion Control için özel URL formatları
  if (model === "kling-2.6/motion-control") {
    // Motion Control: input_urls ve video_urls (array formatında)
    if (imageUrl) {
      input.input_urls = [imageUrl];
    }
    if (videoUrl) {
      input.video_urls = [videoUrl];
    }
  } else {
    // Diğer modeller için standart format
    // All models (Sora, Grok, Kling) use image_urls array format
    if (imageUrl) {
      input.image_urls = [imageUrl];
      // Some models (Wan, Seedance, Hailuo) might prefer singular/different key, adding singular for compatibility.
      // Kie docs suggest `image` or `image_url` for some endpoints.
      if (model.includes("wan") || model.includes("seedance") || model.includes("hailuo")) {
        input.image_url = imageUrl;
        input.image = imageUrl; // Some APIs use 'image'
      }
    }
    if (videoUrl) {
      input.video_url = videoUrl;
    }
  }

  // Audio parameter mapping
  if (sound) {
    // Kling, Seedance, Veo typically use 'generate_audio'
    if (model.includes("kling") || model.includes("seedance") || model.includes("veo")) {
      input.generate_audio = true;
    }
    // Wan uses 'audio'
    if (model.includes("wan")) {
      input.audio = true;
    }
    // Fallback/Legacy
    input.sound = true;
  }

  // Quality/Resolution parameter mapping
  // Default to standard/720p parameters unless 'high' or '1080p' is requested
  if (mode === "1080p" || mode === "high" || quality === "high" || quality === "quality" || quality === "pro") {
    if (model.includes("wan") || model.includes("seedance")) {
      input.resolution = "1080p";
    }
    if (model.includes("hailuo")) {
      input.resolution = "1080P";
    }
  } else if (mode === "720p" || quality === "standard" || quality === "fast") {
    // Explicitly set 720p for clarity if needed, though often default
    if (model.includes("wan") || model.includes("seedance")) {
      input.resolution = "720p";
    }
    if (model.includes("hailuo")) {
      input.resolution = "768P"; // Hailuo default is often 768P
    }
  }

  // Kling 2.6 specific parameters
  if (model.startsWith("kling-2.6")) {
    // Motion Control modeli için özel parametreler
    if (model === "kling-2.6/motion-control") {
      // Motion Control: video süresini API otomatik belirler
      // duration ve sound parametreleri GÖNDERİLMEZ
      input.character_orientation = characterOrientation || "video";
      if (mode) {
        input.mode = mode; // "720p" or "1080p"
      }
      // Motion control için aspect_ratio, negative_prompt, cfg_scale YOK
    } else {
      // Normal text-to-video ve image-to-video için parametreler
      input.duration = duration || "5";
      // input.sound = sound !== undefined ? sound : false; // Handled by new audio mapping
      input.aspect_ratio = aspectRatio || "16:9";
      input.negative_prompt = "blur, distort, and low quality";
      input.cfg_scale = 0.5;
    }
  }

  // Grok specific parameters
  // Note: Grok image-to-video does NOT support aspect_ratio parameter
  // Only supports: image_urls, prompt, mode (fun/normal/spicy)
  if (model.startsWith("grok-imagine")) {
    input.mode = mode || "normal";
    // Note: Spicy mode is not supported when using external images
  }

  // Sora 2 specific parameters
  // Supports: prompt, image_urls, aspect_ratio (landscape/portrait), n_frames (10/15)
  if (model.startsWith("sora-2")) {
    // Sora uses 'seconds' for duration
    const soraDuration = nFrames === "15" ? 15 : 10; // Default logic from before
    input.seconds = duration ? parseInt(duration) : soraDuration;

    // Sora uses 'size' (e.g. 1280x720) instead of aspect_ratio
    if (aspectRatio) {
      if (aspectRatio === "16:9" || aspectRatio === "landscape") {
        input.size = "1280x720";
      } else if (aspectRatio === "9:16" || aspectRatio === "portrait") {
        input.size = "720x1280";
      } else if (aspectRatio === "1:1") {
        input.size = "1024x1024";
      }
    }

    if (removeWatermark !== undefined) {
      input.remove_watermark = removeWatermark;
    }
  }

  // Wan models (Alibaba AI) - supports duration, aspect_ratio
  if (model.includes("wan")) {
    input.duration = duration || "5";
    if (aspectRatio) {
      input.aspect_ratio = aspectRatio;
    }
    // Wan 2.6 supports audio
    // if (model === "wan-2.6") { // Handled by new audio mapping
    //   input.sound = sound !== undefined ? sound : false;
    // Wan 2.6 might typically expect `size` instead of `aspect_ratio` in some implementations,
    // but Kie usually standardizes on aspect_ratio.
    // If image is provided, ensure we don't send conflicting text-to-video params if any.
    // }
  }

  // Hailuo 2.3 (MiniMax) - fixed 6s duration, supports aspect_ratio
  if (model.includes("hailuo")) {
    // Hailuo always generates 6s videos, duration is fixed
    if (aspectRatio) {
      // Hailuo might infer AR from resolution, but sending AR doesn't hurt if API wrapper supports it
      input.aspect_ratio = aspectRatio;
    }
  }

  // Seedance (ByteDance) - supports duration, aspect_ratio
  if (model.includes("seedance")) {
    input.duration = duration || "10";
    if (aspectRatio) {
      input.aspect_ratio = aspectRatio;
    }
    // SeeDance might require specific image key
    if (imageUrl) {
      input.image = imageUrl; // Reinforce 'image' key
    }
  }

  const body: Record<string, unknown> = {
    model,
    input,
  };

  if (callBackUrl) {
    body.callBackUrl = callBackUrl;
  }

  // Debug: Full request body
  console.log(`[KieAI] Full request body for ${model}:`, JSON.stringify(body, null, 2));

  return makeRequest<KieAiResponse>("/api/v1/jobs/createTask", "POST", body);
}

export async function getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const result = await makeRequest<TaskStatusResponse>(`/api/v1/jobs/recordInfo?taskId=${taskId}`);
  // Check if result data is actually present to avoid "recordInfo is null" errors downstream
  if (!result || !result.data) {
    console.warn(`[KieAI] Task status returned no data for task ${taskId}:`, result);
    // Return a constructed valid response indicating failure or wait
    // If we return code 200, the caller tries to access data. 
    // Let's return the result as is, but ensuring it's not null/undefined so callers don't crash
    if (!result) {
      return { code: 500, msg: "API returned null response" };
    }
  }
  return result;
}

// ============ UNIFIED VIDEO GENERATION ============

export interface UnifiedVideoParams {
  modelType: "veo3" | "sora2" | "kling" | "grok" | "kling-motion" | "wan-22" | "wan-25" | "wan-26" | "hailuo" | "seedance-lite" | "seedance-pro" | "seedance-15-pro" | "runway" | "runway-pro";
  generationType: "text-to-video" | "image-to-video" | "video-to-video";
  prompt: string;
  imageUrl?: string; // Geriye uyumluluk
  imageUrls?: string[]; // Çoklu görsel desteği (Veo 3.1: 1-3, Nano Banana Pro: 1-8)
  videoUrl?: string;
  aspectRatio?: string;
  duration?: string;
  sound?: boolean;
  quality?: "fast" | "standard" | "high" | "ultra" | "fast-4k" | "ultra-4k" | "pro" | "quality";
  characterOrientation?: "image" | "video";
  feature?: "default" | "characters" | "watermark-remover" | "storyboard"; // ✨ Sora 2 special features
  callBackUrl?: string;
}

export async function generateVideo(params: UnifiedVideoParams): Promise<{ taskId: string; creditCost: number }> {
  const { modelType, generationType, prompt, imageUrl, imageUrls, videoUrl, aspectRatio, duration, sound, quality, characterOrientation, callBackUrl } = params;

  let response: KieAiResponse;
  let model: string;
  // This is used for pricing calculation, distinct from API model name
  let pricingModel: string | undefined;

  // Birleştirme: imageUrls varsa onu kullan, yoksa imageUrl'i array'e çevir
  const combinedImageUrls = imageUrls || (imageUrl ? [imageUrl] : undefined);

  switch (modelType) {
    case "veo3":
      // Always use veo3_fast regardless of user selection to optimize API costs
      // User sees "Hızlı" (50 kredi) or "Kaliteli" (75 kredi) but both use fast mode
      model = "veo3_fast";
      // Map aspect ratio - Veo 3.1 supports 16:9, 9:16, Auto
      let veoAspectRatio: "16:9" | "9:16" | "Auto" = "16:9";
      if (aspectRatio === "9:16" || aspectRatio === "portrait") veoAspectRatio = "9:16";
      else if (aspectRatio === "1:1" || aspectRatio === "square") veoAspectRatio = "Auto";
      else veoAspectRatio = "16:9";

      // Veo 3.1 multi-image support (max 3 images)
      const veoImageUrls = combinedImageUrls ? combinedImageUrls.slice(0, 3) : undefined;

      // Birden fazla görsel varsa multi-image generation type kullan
      let veoGenerationType: "TEXT_2_VIDEO" | "FIRST_AND_LAST_FRAMES_2_VIDEO" | "REFERENCE_2_VIDEO" = "TEXT_2_VIDEO";
      if (veoImageUrls && veoImageUrls.length > 0) {
        // 2-3 görsel varsa REFERENCE_2_VIDEO kullan (16:9 ve 9:16 destekler, veo3_fast gerekli)
        // 1 görsel varsa FIRST_AND_LAST_FRAMES_2_VIDEO (tüm aspect ratio destekler)
        if (veoImageUrls.length >= 2 && (veoAspectRatio === "16:9" || veoAspectRatio === "9:16")) {
          veoGenerationType = "REFERENCE_2_VIDEO";
        } else {
          veoGenerationType = "FIRST_AND_LAST_FRAMES_2_VIDEO";
        }
      }

      response = await generateVeo31Video({
        prompt,
        imageUrls: veoImageUrls,
        model: model as "veo3" | "veo3_fast",
        aspectRatio: veoAspectRatio,
        generationType: veoGenerationType,
        callBackUrl,
      });
      break;

    case "sora2":
      // Unified Sora 2 with special features support
      const { feature = "default" } = params;
      const isSoraPro = quality === "high" || quality === "pro" || quality === "quality";

      // Feature-based model selection
      if (feature === "characters") {
        model = "sora-2-characters";
        pricingModel = "sora-2-characters";
      } else if (feature === "watermark-remover") {
        model = "sora-2/watermark-remover";
        pricingModel = "sora-2/watermark-remover";
      } else if (feature === "storyboard") {
        model = isSoraPro ? "sora-2-pro-storyboard" : "sora-2-storyboard";
        pricingModel = model;
      } else {
        // Default: Standard video generation
        if (generationType === "image-to-video") {
          model = isSoraPro ? "sora-2-pro-image-to-video" : "sora-2-image-to-video";
        } else {
          model = isSoraPro ? "sora-2-pro-text-to-video" : "sora-2-text-to-video";
        }
        pricingModel = model;
      }

      const soraImageUrl = combinedImageUrls?.[0];
      response = await generateGenericVideo({
        model: model as VideoModel,
        prompt,
        imageUrl: soraImageUrl,
        aspectRatio: aspectRatio === "16:9" ? "landscape" : "portrait",
        nFrames: duration === "15" || duration === "20" ? duration : "10",
        quality: isSoraPro ? "pro" : "standard",
        callBackUrl,
      });
      break;

    case "kling":
      // Kling 2.6 supports both text-to-video and image-to-video with native audio
      // Sadece tek görsel destekler
      model = generationType === "image-to-video" ? "kling-2.6/image-to-video" : "kling-2.6/text-to-video";
      const klingImageUrl = combinedImageUrls?.[0];
      response = await generateGenericVideo({
        model: model as VideoModel,
        prompt,
        imageUrl: klingImageUrl,
        aspectRatio,
        duration,
        sound,
        callBackUrl,
      });
      break;

    case "kling-motion":
      // Kling 2.6 Motion Control - uses dedicated motion-control model
      // Sadece tek görsel destekler
      model = "kling-2.6/motion-control";

      // Pricing uses custom key regardless of input type
      pricingModel = "kling-2.6-motion";

      const motionImageUrl = combinedImageUrls?.[0];

      // Motion Control: API otomatik video süresini belirler, duration parametresi gönderilmez
      // Ancak duration'ı kredi hesaplaması için kullanıyoruz (generateVideo fonksiyonunda)
      response = await generateGenericVideo({
        model: model as VideoModel,
        prompt, // Scene description (optional)
        imageUrl: motionImageUrl,
        videoUrl, // Reference video for motion transfer
        aspectRatio: "16:9", // Motion control always 16:9
        duration: duration, // Sadece kredi hesaplaması için, API'ye GÖNDERİLMEZ
        sound: undefined, // Motion control'de sound GÖNDERİLMEZ
        mode: quality === "high" ? "1080p" : "720p", // API'ye göre: "720p" veya "1080p"
        characterOrientation, // "image" or "video" orientation
        callBackUrl,
      });
      break;

    case "grok":
      // Grok Imagine - Sadece tek görsel destekler
      model = generationType === "image-to-video" ? "grok-imagine/image-to-video" : "grok-imagine/text-to-video";
      const grokImageUrl = combinedImageUrls?.[0];
      response = await generateGenericVideo({
        model: model as VideoModel,
        prompt,
        imageUrl: grokImageUrl,
        aspectRatio,
        mode: "normal",
        callBackUrl,
      });
      break;

    case "wan-22":
      // Wan 2.2 - Alibaba AI video model (supports both text-to-video and image-to-video)
      model = "wan-2.2";
      const wan22ImageUrl = combinedImageUrls?.[0];
      response = await generateGenericVideo({
        model: model as VideoModel,
        prompt,
        imageUrl: wan22ImageUrl,
        aspectRatio,
        duration,
        quality,
        callBackUrl,
      });
      break;

    case "wan-25":
      // Wan 2.5 - Alibaba AI video model
      // API expects: wan2.5-t2v-preview OR wan2.5-i2v-preview
      model = generationType === "image-to-video" ? "wan2.5-i2v-preview" : "wan2.5-t2v-preview";
      const wan25ImageUrl = combinedImageUrls?.[0];
      response = await generateGenericVideo({
        model: model as VideoModel,
        prompt,
        imageUrl: wan25ImageUrl,
        aspectRatio,
        duration,
        quality,
        callBackUrl,
      });
      break;

    case "wan-26":
      // Wan 2.6 - Alibaba AI video model
      // API uses wan/2-6-text-to-video and wan/2-6-image-to-video and wan/2-6-video-to-video
      if (generationType === "video-to-video") {
        model = "wan/2-6-video-to-video";
      } else if (generationType === "image-to-video") {
        model = "wan/2-6-image-to-video";
      } else {
        model = "wan/2-6-text-to-video";
      }

      const wan26ImageUrl = combinedImageUrls?.[0];
      response = await generateGenericVideo({
        model: model as VideoModel,
        prompt,
        imageUrl: wan26ImageUrl,
        videoUrl, // Pass videoUrl for video-to-video
        aspectRatio,
        duration,
        sound,
        quality,
        callBackUrl,
      });
      break;

    case "hailuo":
      // Hailuo 2.3 - MiniMax AI video model (6s fixed duration)
      // Kie.ai uses hailuo-2.3 (without minimax prefix)
      model = "hailuo-2.3";
      const hailuoImageUrl = combinedImageUrls?.[0];
      response = await generateGenericVideo({
        model: model as VideoModel,
        prompt,
        imageUrl: hailuoImageUrl,
        aspectRatio,
        quality,
        callBackUrl,
      });
      break;

    case "seedance-lite":
      // Seedance 1.0 Lite - ByteDance AI video model
      model = "bytedance/seedance-1.0-lite";
      const seedanceLiteImageUrl = combinedImageUrls?.[0];
      response = await generateGenericVideo({
        model: model as VideoModel,
        prompt,
        imageUrl: seedanceLiteImageUrl,
        aspectRatio,
        duration,
        quality,
        callBackUrl,
      });
      break;

    case "seedance-pro":
      // Seedance 1.0 Pro - ByteDance AI video model
      model = "bytedance/seedance-1.0-pro";
      const seedanceProImageUrl = combinedImageUrls?.[0];
      response = await generateGenericVideo({
        model: model as VideoModel,
        prompt,
        imageUrl: seedanceProImageUrl,
        aspectRatio,
        duration,
        quality,
        callBackUrl,
      });
      break;

    case "seedance-15-pro":
      // Seedance 1.5 Pro - ByteDance AI video model
      // API Key: bytedance/seedance-1.5-pro
      model = "bytedance/seedance-1.5-pro"; // Correct API key
      const seedance15ProImageUrl = combinedImageUrls?.[0];
      response = await generateGenericVideo({
        model: model as VideoModel,
        prompt,
        imageUrl: seedance15ProImageUrl,
        aspectRatio,
        duration,
        quality,
        callBackUrl,
      });
      break;

    case "runway":
      // Runway Gen-3 Alpha
      model = "runway-gen3-alpha";
      const runwayImageUrl = combinedImageUrls?.[0];
      response = await generateGenericVideo({
        model: model as VideoModel,
        prompt,
        imageUrl: runwayImageUrl,
        aspectRatio,
        duration: "5",
        callBackUrl,
      });
      break;

    default:
      throw new Error(`Unknown model type: ${modelType}`);
  }

  if (response.code !== 200 || !response.data?.taskId) {
    throw new Error(response.msg || "Video generation failed");
  }

  const creditCost = calculateVideoCreditCost(pricingModel || model, { duration, sound, quality });

  return {
    taskId: response.data.taskId,
    creditCost,
  };
}

// Get video status (unified for all models)
export async function getVideoStatus(
  taskId: string,
  modelType: "veo3" | "sora2" | "kling" | "grok" | "wan-22" | "wan-25" | "wan-26" | "hailuo" | "seedance-lite" | "seedance-pro" | "seedance-15-pro" | "kling-motion" | "runway"
): Promise<{
  status: "pending" | "processing" | "completed" | "failed";
  videoUrl?: string;
  error?: string;
  actualDuration?: number; // Actual video duration in seconds (from API)
}> {
  if (modelType === "veo3") {
    const response = await getVeo31Status(taskId);

    if (response.code !== 200) {
      return { status: "failed", error: response.msg };
    }

    const successFlag = response.data?.successFlag;

    if (successFlag === 0) {
      return { status: "processing" };
    } else if (successFlag === 1) {
      let videoUrl: string | undefined;

      // Yeni format: response.resultUrls (array)
      if (response.data?.response?.resultUrls && Array.isArray(response.data.response.resultUrls)) {
        videoUrl = response.data.response.resultUrls[0];
      }
      // Eski format: data.resultUrls (string veya JSON string)
      else if (response.data?.resultUrls) {
        const resultUrls = response.data.resultUrls;
        try {
          const urls = JSON.parse(resultUrls);
          videoUrl = Array.isArray(urls) ? urls[0] : urls;
        } catch {
          videoUrl = resultUrls;
        }
      }

      console.log(`[Veo3] Video URL extracted: ${videoUrl}`);
      return { status: "completed", videoUrl };
    } else {
      const errorMsg = response.data?.errorMessage || response.msg || "Video generation failed";
      return { status: "failed", error: errorMsg };
    }
  } else {
    const response = await getTaskStatus(taskId);

    if (response.code !== 200) {
      return { status: "failed", error: response.msg };
    }

    const state = response.data?.state;

    if (state === "waiting") {
      return { status: "processing" };
    } else if (state === "success") {
      let videoUrl: string | undefined;
      let actualDuration: number | undefined;

      if (response.data?.resultJson) {
        try {
          const result = JSON.parse(response.data.resultJson);
          videoUrl = result.resultUrls?.[0];

          // Try to extract actual video duration from API response
          // Motion Control and other models may include duration, videoDuration, or duration_s
          if (result.duration !== undefined) {
            actualDuration = parseFloat(result.duration);
          } else if (result.videoDuration !== undefined) {
            actualDuration = parseFloat(result.videoDuration);
          } else if (result.duration_s !== undefined) {
            actualDuration = parseFloat(result.duration_s);
          } else if (result.durationList && Array.isArray(result.durationList) && result.durationList.length > 0) {
            actualDuration = parseFloat(result.durationList[0]);
          }

          // Log the parsed duration for debugging
          if (actualDuration !== undefined) {
            console.log(`[KieAI] Actual video duration from API: ${actualDuration}s`);
          } else {
            console.log(`[KieAI] No duration found in resultJson: ${response.data.resultJson}`);
          }
        } catch {
          console.error("[KieAI] Failed to parse resultJson", response.data.resultJson);
        }
      }
      return { status: "completed", videoUrl, actualDuration };
    } else if (state === "fail") {
      return { status: "failed", error: response.data?.failMsg || "Video generation failed" };
    } else {
      return { status: "pending" };
    }
  }
}


// ============ TOPAZ IMAGE UPSCALE API ============

export type UpscaleFactor = "1" | "2" | "4" | "8";

// Upscale pricing (in credits) - with 50% markup
export const UPSCALE_PRICING: Record<UpscaleFactor, number> = {
  "1": 15,  // 1x (no upscale, just enhancement) - 10 credits base + 50%
  "2": 15,  // 2x upscale (≤2K output) - 10 credits base + 50%
  "4": 30,  // 4x upscale (4K output) - 20 credits base + 50%
  "8": 60,  // 8x upscale (8K output) - 40 credits base + 50%
};

export function calculateUpscaleCreditCost(factor: UpscaleFactor): number {
  return UPSCALE_PRICING[factor] || 15;
}

export interface TopazUpscaleParams {
  imageUrl: string;
  upscaleFactor: UpscaleFactor;
  callBackUrl?: string;
}

export async function createTopazUpscaleTask(params: TopazUpscaleParams): Promise<KieAiResponse> {
  const { imageUrl, upscaleFactor, callBackUrl } = params;

  const body: Record<string, unknown> = {
    model: "topaz/image-upscale",
    input: {
      image_url: imageUrl,
      upscale_factor: upscaleFactor,
    },
  };

  if (callBackUrl) {
    body.callBackUrl = callBackUrl;
  }

  return makeRequest<KieAiResponse>("/api/v1/jobs/createTask", "POST", body);
}

export interface TopazStatusResponse {
  code: number;
  msg: string;
  data?: {
    taskId: string;
    model: string;
    state: string; // "waiting", "success", "fail"
    resultJson?: string; // JSON string with output URL
    failCode?: string;
    failMsg?: string;
    costTime?: number;
    completeTime?: number;
    createTime: number;
  };
}

export async function getTopazUpscaleStatus(taskId: string): Promise<TopazStatusResponse> {
  return makeRequest<TopazStatusResponse>(`/api/v1/jobs/recordInfo?taskId=${taskId}`);
}

// Unified upscale function
export async function upscaleImage(params: TopazUpscaleParams): Promise<{ taskId: string; creditCost: number }> {
  const response = await createTopazUpscaleTask(params);

  if (response.code !== 200 || !response.data?.taskId) {
    throw new Error(response.msg || "Upscale task creation failed");
  }

  const creditCost = calculateUpscaleCreditCost(params.upscaleFactor);

  return {
    taskId: response.data.taskId,
    creditCost,
  };
}

// Get upscale status
export async function getUpscaleStatus(taskId: string): Promise<{
  status: "pending" | "processing" | "completed" | "failed";
  imageUrl?: string;
  error?: string;
}> {
  const response = await getTopazUpscaleStatus(taskId);

  console.log(`[Upscale] Status check for task ${taskId}, code: ${response.code}`);

  if (response.code !== 200) {
    console.error(`[Upscale] API error:`, response.msg);
    return { status: "failed", error: response.msg };
  }

  const state = response.data?.state;

  if (state === "waiting") {
    return { status: "processing" };
  } else if (state === "success") {
    let imageUrl: string | undefined;
    if (response.data?.resultJson) {
      try {
        const result = JSON.parse(response.data.resultJson);
        console.log(`[Upscale] Parsed resultJson:`, JSON.stringify(result, null, 2));

        // Try resultUrls array first (like video generation)
        if (result.resultUrls && Array.isArray(result.resultUrls) && result.resultUrls.length > 0) {
          imageUrl = result.resultUrls[0];
        }
        // Then try direct array
        else if (Array.isArray(result) && result.length > 0) {
          imageUrl = result[0];
        }
        // Finally try common field names
        else {
          imageUrl = result.output || result.url || result.image_url || result.imageUrl || result.output_url;
        }

        console.log(`[Upscale] Extracted imageUrl:`, imageUrl);
      } catch (error) {
        console.error(`[Upscale] Parse error:`, error);
        imageUrl = response.data.resultJson;
      }
    }
    return { status: "completed", imageUrl };
  } else if (state === "fail") {
    return { status: "failed", error: response.data?.failMsg || "Upscale failed" };
  }

  return { status: "pending" };
}


// ============ SEEDREAM 4.5 TEXT-TO-IMAGE API ============

export type SeedreamAspectRatio = "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "2:3" | "3:2" | "21:9";
export type SeedreamQuality = "basic" | "high";

// Seedream pricing (in credits)
export const SEEDREAM_PRICING: Record<SeedreamQuality, number> = {
  "basic": 8,  // 2K output
  "high": 15,  // 4K output
};

export function calculateSeedreamCreditCost(quality: SeedreamQuality): number {
  return SEEDREAM_PRICING[quality] || 8;
}

export interface SeedreamGenerateParams {
  prompt: string;
  aspectRatio?: SeedreamAspectRatio;
  quality?: SeedreamQuality;
  callBackUrl?: string;
}

export async function createSeedreamTask(params: SeedreamGenerateParams): Promise<KieAiResponse> {
  const { prompt, aspectRatio = "1:1", quality = "basic", callBackUrl } = params;

  const body: Record<string, unknown> = {
    model: "seedream/4.5-text-to-image",
    input: {
      prompt,
      aspect_ratio: aspectRatio,
      quality,
    },
  };

  if (callBackUrl) {
    body.callBackUrl = callBackUrl;
  }

  return makeRequest<KieAiResponse>("/api/v1/jobs/createTask", "POST", body);
}

// ============ SEEDREAM 4.5 EDIT (IMAGE-TO-IMAGE) API ============

export interface SeedreamEditParams {
  prompt: string;
  imageUrls: string[]; // Image(s) to edit (required for edit mode)
  aspectRatio?: SeedreamAspectRatio;
  quality?: SeedreamQuality;
  callBackUrl?: string;
}

export async function createSeedreamEditTask(params: SeedreamEditParams): Promise<KieAiResponse> {
  const { prompt, imageUrls, aspectRatio = "1:1", quality = "basic", callBackUrl } = params;

  const body: Record<string, unknown> = {
    model: "seedream/4.5-edit",
    input: {
      prompt,
      image_urls: imageUrls,
      aspect_ratio: aspectRatio,
      quality,
    },
  };

  if (callBackUrl) {
    body.callBackUrl = callBackUrl;
  }

  return makeRequest<KieAiResponse>("/api/v1/jobs/createTask", "POST", body);
}

export async function getSeedreamStatus(taskId: string): Promise<TaskStatusResponse> {
  return makeRequest<TaskStatusResponse>(`/api/v1/jobs/recordInfo?taskId=${taskId}`);
}

// Unified Seedream image generation function
export async function generateSeedreamImage(params: SeedreamGenerateParams): Promise<{ taskId: string; creditCost: number }> {
  const response = await createSeedreamTask(params);

  if (response.code !== 200 || !response.data?.taskId) {
    throw new Error(response.msg || "Seedream task creation failed");
  }

  const creditCost = calculateSeedreamCreditCost(params.quality || "basic");

  return {
    taskId: response.data.taskId,
    creditCost,
  };
}

// Unified Seedream Edit (image-to-image) function
export async function generateSeedreamEditImage(params: SeedreamEditParams): Promise<{ taskId: string; creditCost: number }> {
  const response = await createSeedreamEditTask(params);

  if (response.code !== 200 || !response.data?.taskId) {
    throw new Error(response.msg || "Seedream edit task creation failed");
  }

  const creditCost = calculateSeedreamCreditCost(params.quality || "basic");

  return {
    taskId: response.data.taskId,
    creditCost,
  };
}

// Get Seedream image status
export async function getSeedreamImageStatus(taskId: string): Promise<{
  status: "pending" | "processing" | "completed" | "failed";
  imageUrl?: string;
  error?: string;
}> {
  const response = await getSeedreamStatus(taskId);

  if (response.code !== 200) {
    return { status: "failed", error: response.msg };
  }

  const state = response.data?.state;

  if (state === "waiting") {
    return { status: "processing" };
  } else if (state === "success") {
    let imageUrl: string | undefined;
    if (response.data?.resultJson) {
      try {
        const result = JSON.parse(response.data.resultJson);
        imageUrl = result.resultUrls?.[0];
      } catch {
        console.error("[Seedream] Failed to parse resultJson", response.data.resultJson);
      }
    }
    return { status: "completed", imageUrl };
  } else if (state === "fail") {
    return { status: "failed", error: response.data?.failMsg || "Image generation failed" };
  }

  return { status: "pending" };
}
// Add at the end of kieAiApi.ts

// ============ NEW KIE.AI IMAGE MODELS API ============

// Generic Image Generation Models - Flux 2, 4o Image, Imagen 4, etc.
export type GenericImageModel =
  // Flux 2 Models
  | "flux-2/pro-image-to-image"
  | "flux-2/pro-text-to-image"
  | "flux-2/flex-text-to-image"
  | "flux-2/flex-image-to-image"
  | "flux-kontext-pro"
  | "flux-kontext-max"
  | "flux-1.1-pro"
  | "flux-1.1-pro-ultra"
  // Seedream Models
  | "bytedance/seedream"
  | "bytedance/seedream-v4-text-to-image"
  | "bytedance/seedream-v4-edit"
  | "bytedance/seedream-4.5-text-to-image"
  | "bytedance/seedream-4.5-edit"
  // Google/Imagen Models
  | "google/imagen4"
  | "google/imagen4-fast"
  | "google/imagen4-ultra"
  | "google/nano-banana"
  | "google/nano-banana-edit"
  | "google/pro-image-to-image"
  | "nano-banana"
  | "nano-banana-pro"
  // GPT Image Models
  | "gpt-image/1.5-text-to-image"
  | "gpt-image/1.5-image-to-image"
  | "4o-image"
  // Grok Imagine
  | "grok-imagine/text-to-image"
  | "grok-imagine/image-to-image"
  // Ideogram Models
  | "ideogram/v3-reframe"
  | "ideogram/character"
  | "ideogram/character-edit"
  | "ideogram/character-remix"
  // Qwen Models
  | "qwen/text-to-image"
  | "qwen/image-to-image"
  | "qwen/image-edit"
  // Recraft Models
  | "recraft/remove-background"
  | "recraft-v3"
  | "recraft-20b"
  // Z-Image
  | "z-image";

export type ImageAspectRatio = "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "2:3" | "3:2" | "21:9";
export type ImageQuality = "basic" | "standard" | "high" | "ultra";

// Model-specific pricing (in credits)
export const IMAGE_MODEL_PRICING: Record<string, number> = {
  // Flux Models
  "flux-2/pro-image-to-image": 12,
  "flux-2/pro-text-to-image": 12,
  "flux-2/flex-text-to-image": 10,
  "flux-2/flex-image-to-image": 10,
  "flux-kontext-pro": 15,
  "flux-kontext-max": 20,
  "flux-1.1-pro": 15,
  "flux-1.1-pro-ultra": 25,

  // Seedream Models
  "bytedance/seedream": 10,
  "bytedance/seedream-v4-text-to-image": 12,
  "bytedance/seedream-v4-edit": 12,
  "bytedance/seedream-4.5-text-to-image": 14,
  "bytedance/seedream-4.5-edit": 14,

  // Google/Imagen Models
  "google/imagen4": 15,
  "google/imagen4-fast": 12,
  "google/imagen4-ultra": 20,
  "google/nano-banana": 10,
  "google/nano-banana-edit": 12,
  "google/pro-image-to-image": 15,
  "nano-banana": 10,
  "nano-banana-pro": 15,

  // GPT Image Models
  "4o-image": 10,
  "gpt-image/1.5-text-to-image": 10,
  "gpt-image/1.5-image-to-image": 12,

  // Grok Imagine
  "grok-imagine/text-to-image": 12,
  "grok-imagine/image-to-image": 14,

  // Ideogram Models
  "ideogram/v3-reframe": 10,
  "ideogram/character": 12,
  "ideogram/character-edit": 14,
  "ideogram/character-remix": 14,

  // Qwen Models
  "qwen/text-to-image": 8,
  "qwen/image-to-image": 10,
  "qwen/image-edit": 10,

  // Recraft Models
  "recraft/remove-background": 8,
  "recraft-v3": 15,
  "recraft-20b": 12,

  // Z-Image
  "z-image": 10,
};

export function calculateImageModelCreditCost(modelKey: string): number {
  return IMAGE_MODEL_PRICING[modelKey] || 10;
}


export interface GenericImageGenerateParams {
  model: GenericImageModel | string;
  prompt: string;
  imageUrls?: string[]; // For image-to-image models
  aspectRatio?: ImageAspectRatio | string;
  quality?: ImageQuality;
  callBackUrl?: string;
}

export async function createGenericImageTask(params: GenericImageGenerateParams): Promise<KieAiResponse> {
  const { model, prompt, imageUrls, aspectRatio = "1:1", quality = "standard", callBackUrl } = params;

  let endpoint = "/api/v1/jobs/createTask";
  let body: Record<string, unknown>;

  if (model === "4o-image") {
    // 4o Image API uses a specialized endpoint and flat body structure
    // Ensure size is one of the supported formats: "1:1", "3:2", "2:3"
    let apiSize = aspectRatio;
    if (apiSize !== "1:1" && apiSize !== "3:2" && apiSize !== "2:3") {
      // Map common ratios to nearest supported format
      if (apiSize === "16:9" || apiSize === "4:3") apiSize = "3:2";
      else if (apiSize === "9:16" || apiSize === "3:4") apiSize = "2:3";
      else apiSize = "1:1"; // Fallback
    }

    endpoint = "/api/v1/gpt4o-image/generate";
    body = {
      prompt,
      size: apiSize,
      filesUrl: imageUrls,
      isEnhance: true, // Default to true for better quality
      callBackUrl,
    };
  } else if (model === "flux-kontext-pro" || model === "flux-kontext-max") {
    // Flux Kontext API uses a specialized endpoint and flat body structure
    endpoint = "/api/v1/flux/kontext/generate";
    body = {
      prompt,
      model,
      aspectRatio,
      enableTranslation: true,
      callBackUrl,
    };
  } else {
    // Standard Market Models use the generic createTask endpoint and nested body
    const input: Record<string, unknown> = {
      prompt,
    };

    // Add image URLs for image-to-image models
    if (imageUrls && imageUrls.length > 0) {
      // Qwen models use 'image_url' (single string) instead of 'image_urls' (array)
      if (model.startsWith("qwen/image-")) {
        input.image_url = imageUrls[0]; // Use first image only
      }
      // Flux 2 models use 'input_urls' instead of 'image_urls'
      else if (model.startsWith("flux-2/")) {
        input.input_urls = imageUrls;
      } else {
        input.image_urls = imageUrls;
      }
    }

    // PARAMETER MAPPING BASED ON MODEL TYPE
    if (model === "qwen/image-edit" || model === "qwen/text-to-image") {
      // Qwen text/image-edit models use 'image_size' values from Kie docs.
      let imageSize = "square"; // Default 1:1
      if (aspectRatio === "16:9") imageSize = "landscape_16_9";
      else if (aspectRatio === "9:16") imageSize = "portrait_16_9";
      else if (aspectRatio === "4:3") imageSize = "landscape_4_3";
      else if (aspectRatio === "3:4") imageSize = "portrait_4_3";
      else if (aspectRatio === "3:2") imageSize = "landscape_4_3"; // Map to closest
      else if (aspectRatio === "2:3") imageSize = "portrait_4_3"; // Map to closest
      else if (aspectRatio === "1:1") imageSize = "square";
      else if (aspectRatio === "21:9") imageSize = "landscape_16_9"; // Map to closest

      input.image_size = imageSize;

      if (model === "qwen/image-edit") {
        // Defaults aligned with Kie Qwen Image Edit docs
        input.acceleration = "none";
        input.num_inference_steps = 25;
        input.guidance_scale = 4;
        input.sync_mode = false;
        input.enable_safety_checker = true;
        input.output_format = "png";
        input.negative_prompt = "blurry, ugly";
      }
    } else if (model.includes("ideogram")) {
      // Ideogram uses 'image_size' with specific string values
      let imageSize = "square_hd"; // Default
      if (aspectRatio === "16:9") imageSize = "landscape_16_9";
      else if (aspectRatio === "9:16") imageSize = "portrait_9_16";
      else if (aspectRatio === "3:2") imageSize = "landscape_3_2";
      else if (aspectRatio === "2:3") imageSize = "portrait_2_3";

      input.image_size = imageSize;
    } else if (model.includes("recraft")) {
      // Recraft likely uses 'size' with pixel dimensions
      let size = "1024x1024"; // Default 1:1
      if (aspectRatio === "16:9") size = "1024x576";
      else if (aspectRatio === "9:16") size = "576x1024";
      else if (aspectRatio === "3:2") size = "1024x683";
      else if (aspectRatio === "2:3") size = "683x1024";
      else if (aspectRatio === "4:3") size = "1024x768";
      else if (aspectRatio === "3:4") size = "768x1024";

      input.size = size;
    } else if (!model.startsWith("qwen/")) {
      // Valid for Flux 2, Grok, and others
      if (aspectRatio) {
        input.aspect_ratio = aspectRatio;
      }
    }

    // Flux 2 models require resolution parameter
    if (model.startsWith("flux-2/")) {
      // Kie.ai supports "1K" or "2K" for Flux 2 models
      // Use 2K for high quality, 1K for standard
      input.resolution = quality === "high" || quality === "ultra" ? "2K" : "1K";
    }

    // Qwen endpoints are strict and don't expect 'quality' in input payload.
    if (quality && !model.startsWith("qwen/")) {
      input.quality = quality;
    }

    body = {
      model,
      input,
      callBackUrl,
    };
  }

  console.log(`[KieAI] Creating image task at ${endpoint} for model: ${model}`, JSON.stringify(body, null, 2));

  return makeRequest<KieAiResponse>(endpoint, "POST", body);
}

// Unified function for generating images with new models
export async function generateImageWithModel(params: GenericImageGenerateParams): Promise<{ taskId: string; creditCost: number }> {
  const response = await createGenericImageTask(params);

  if (response.code !== 200 || !response.data?.taskId) {
    throw new Error(response.msg || "Image generation task creation failed");
  }

  const creditCost = calculateImageModelCreditCost(params.model);

  return {
    taskId: response.data.taskId,
    creditCost,
  };
}

// Get generic image task status (reuses existing task status endpoint)
export async function getGenericImageStatus(taskId: string, model?: string): Promise<{
  status: "pending" | "processing" | "completed" | "failed";
  imageUrl?: string;
  error?: string;
}> {
  // 4o-image uses a different status endpoint
  if (taskId && !taskId.includes("_") && taskId.length === 32) {
    // 4o-image task IDs are 32-char hex strings without underscores
    const response = await makeRequest<TaskStatusResponse>(`/api/v1/gpt4o-image/record-info?taskId=${taskId}`);

    if (response.code !== 200) {
      return { status: "failed", error: response.msg };
    }

    // 4o-image uses 'status' instead of 'state', and 'response.resultUrls' instead of 'resultJson'
    const data = response.data as any;
    const apiStatus = data?.status;

    if (apiStatus === "GENERATING" || !apiStatus) {
      return { status: "processing" };
    } else if (apiStatus === "SUCCESS" && data?.successFlag === 1) {
      const imageUrl = data?.response?.resultUrls?.[0];
      return { status: "completed", imageUrl };
    } else if (apiStatus === "GENERATE_FAILED" || apiStatus === "CREATE_TASK_FAILED") {
      return { status: "failed", error: data?.errorMessage || "Image generation failed" };
    }

    return { status: "pending" };
  }

  // Flux Kontext uses a different status endpoint
  if (taskId.startsWith("fluxkontext_")) {
    const response = await makeRequest<TaskStatusResponse>(`/api/v1/flux/kontext/record-info?taskId=${taskId}`);

    if (response.code !== 200) {
      return { status: "failed", error: response.msg };
    }

    const state = response.data?.state;

    if (state === "waiting") {
      return { status: "processing" };
    } else if (state === "success") {
      let imageUrl: string | undefined;
      if (response.data?.resultJson) {
        try {
          const result = JSON.parse(response.data.resultJson);
          imageUrl = result.resultUrls?.[0];
        } catch {
          console.error("[FluxKontext] Failed to parse resultJson", response.data.resultJson);
        }
      }
      return { status: "completed", imageUrl };
    } else if (state === "fail") {
      return { status: "failed", error: response.data?.failMsg || "Image generation failed" };
    }

    return { status: "pending" };
  }

  // Standard models use generic endpoint
  const response = await getTaskStatus(taskId);

  if (response.code !== 200) {
    return { status: "failed", error: response.msg };
  }

  const state = response.data?.state;

  if (state === "waiting") {
    return { status: "processing" };
  } else if (state === "success") {
    let imageUrl: string | undefined;
    if (response.data?.resultJson) {
      try {
        const result = JSON.parse(response.data.resultJson);
        console.log(`[GenericImage] Parsed resultJson:`, JSON.stringify(result, null, 2));

        // Try resultUrls array first
        if (result.resultUrls && Array.isArray(result.resultUrls) && result.resultUrls.length > 0) {
          imageUrl = result.resultUrls[0];
        }
        // Try images array (common in some APIs)
        else if (result.images && Array.isArray(result.images) && result.images.length > 0) {
          imageUrl = result.images[0].url || result.images[0];
        }
        // Try direct array
        else if (Array.isArray(result) && result.length > 0) {
          imageUrl = result[0];
        }
        // Finally try common field names
        else {
          imageUrl = result.output || result.url || result.image_url || result.imageUrl || result.output_url || result.resultUrl;
        }

        console.log(`[GenericImage] Extracted imageUrl: ${imageUrl}`);
      } catch (error) {
        console.error("[GenericImage] Failed to parse resultJson", response.data.resultJson);
        // Fallback: use resultJson directly if it looks like a URL
        if (response.data.resultJson.startsWith("http")) {
          imageUrl = response.data.resultJson;
        }
      }
    }
    return { status: "completed", imageUrl };
  } else if (state === "fail") {
    return { status: "failed", error: response.data?.failMsg || "Image generation failed" };
  }

  return { status: "pending" };
}


// ============ SPECIALIZED MODEL FUNCTIONS ============

// Flux 2 Pro - Image-to-Image
export interface Flux2ProParams {
  prompt: string;
  imageUrl: string; // Source image for transformation
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateFlux2ProImage(params: Flux2ProParams): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "flux-2/pro-image-to-image",
    prompt: params.prompt,
    imageUrls: [params.imageUrl],
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}

// 4o Image API
export interface FourOImageParams {
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generate4oImage(params: FourOImageParams): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "4o-image",
    prompt: params.prompt,
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}

// Flux Kontext Pro
export interface FluxKontextParams {
  prompt: string;
  imageUrls?: string[]; // Optional context images
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateFluxKontextImage(params: FluxKontextParams): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "flux-kontext-pro",
    prompt: params.prompt,
    imageUrls: params.imageUrls,
    aspectRatio: params.aspectRatio,
    quality: "high",
    callBackUrl: params.callBackUrl,
  });
}

// Google Imagen 4
export interface Imagen4Params {
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateImagen4Image(params: Imagen4Params): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "google/imagen4-fast",
    prompt: params.prompt,
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}

// Ideogram V3 Reframe
export interface IdeogramV3Params {
  prompt: string;
  imageUrl?: string; // Optional source image for reframing
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateIdeogramV3Image(params: IdeogramV3Params): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "ideogram/v3-reframe",
    prompt: params.prompt,
    imageUrls: params.imageUrl ? [params.imageUrl] : undefined,
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}

// Ideogram Character
export interface IdeogramCharacterParams {
  prompt: string;
  characterImage?: string; // Reference character image for consistency
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateIdeogramCharacterImage(params: IdeogramCharacterParams): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "ideogram/character",
    prompt: params.prompt,
    imageUrls: params.characterImage ? [params.characterImage] : undefined,
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}

// Qwen Text-to-Image
export interface QwenImageParams {
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateQwenImage(params: QwenImageParams): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "qwen/text-to-image",
    prompt: params.prompt,
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}

// Z-Image
export interface ZImageParams {
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateZImage(params: ZImageParams): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "z-image",
    prompt: params.prompt,
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}

// Grok Imagine
export interface GrokImagineParams {
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  mode?: "fun" | "normal" | "spicy"; // Grok-specific modes
  callBackUrl?: string;
}

export async function generateGrokImagineImage(params: GrokImagineParams): Promise<{ taskId: string; creditCost: number }> {
  const body: Record<string, unknown> = {
    model: "grok-imagine/text-to-image",
    input: {
      prompt: params.prompt,
      mode: params.mode || "normal",
    },
  };

  if (params.aspectRatio) {
    (body.input as Record<string, unknown>).aspect_ratio = params.aspectRatio;
  }

  if (params.callBackUrl) {
    body.callBackUrl = params.callBackUrl;
  }

  const response = await makeRequest<KieAiResponse>("/api/v1/jobs/createTask", "POST", body);

  if (response.code !== 200 || !response.data?.taskId) {
    throw new Error(response.msg || "Grok Imagine task creation failed");
  }

  return {
    taskId: response.data.taskId,
    creditCost: IMAGE_MODEL_PRICING["grok-imagine/text-to-image"] || 12,
  };
}

// GPT Image 1.5
export interface GPTImageParams {
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateGPTImage(params: GPTImageParams): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "gpt-image/1.5-text-to-image",
    prompt: params.prompt,
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}

// Flux 1.1 Pro
export interface Flux11ProParams {
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateFlux11ProImage(params: Flux11ProParams): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "flux-1.1-pro",
    prompt: params.prompt,
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}

// Flux 1.1 Pro Ultra (4K)
export interface Flux11UltraParams {
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateFlux11UltraImage(params: Flux11UltraParams): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "flux-1.1-pro-ultra",
    prompt: params.prompt,
    aspectRatio: params.aspectRatio,
    quality: "ultra",
    callBackUrl: params.callBackUrl,
  });
}

// Recraft V3 (Vector art and graphic design)
export interface RecraftV3Params {
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateRecraftV3Image(params: RecraftV3Params): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "recraft-v3",
    prompt: params.prompt,
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}

// Recraft 20B
export interface Recraft20BParams {
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateRecraft20BImage(params: Recraft20BParams): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "recraft-20b",
    prompt: params.prompt,
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}

// Qwen Image Edit (Image-to-Image)
export interface QwenImageEditParams {
  prompt: string;
  imageUrl: string; // Source image for editing
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateQwenImageEdit(params: QwenImageEditParams): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "qwen/image-edit",
    prompt: params.prompt,
    imageUrls: [params.imageUrl],
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}

// Qwen Image-to-Image
export interface QwenImageToImageParams {
  prompt: string;
  imageUrl: string; // Source image for transformation
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateQwenImageToImage(params: QwenImageToImageParams): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "qwen/image-to-image",
    prompt: params.prompt,
    imageUrls: [params.imageUrl],
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}

// Nano Banana Edit (Google)
export interface NanoBananaEditParams {
  prompt: string;
  imageUrls: string[]; // Up to 8 reference images for editing
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateNanoBananaEdit(params: NanoBananaEditParams): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "google/nano-banana-edit",
    prompt: params.prompt,
    imageUrls: params.imageUrls,
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}

// Ideogram Character Edit
export interface IdeogramCharacterEditParams {
  prompt: string;
  characterImage: string; // Reference character image
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateIdeogramCharacterEdit(params: IdeogramCharacterEditParams): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "ideogram/character-edit",
    prompt: params.prompt,
    imageUrls: [params.characterImage],
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}

// Ideogram Character Remix
export interface IdeogramCharacterRemixParams {
  prompt: string;
  characterImage: string; // Reference character image to remix
  aspectRatio?: ImageAspectRatio;
  callBackUrl?: string;
}

export async function generateIdeogramCharacterRemix(params: IdeogramCharacterRemixParams): Promise<{ taskId: string; creditCost: number }> {
  return generateImageWithModel({
    model: "ideogram/character-remix",
    prompt: params.prompt,
    imageUrls: [params.characterImage],
    aspectRatio: params.aspectRatio,
    callBackUrl: params.callBackUrl,
  });
}
