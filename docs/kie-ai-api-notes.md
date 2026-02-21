# Kie AI API Notes

## Base URL

https://api.kie.ai

## Authentication

Header: Authorization: Bearer YOUR_API_KEY

## Models

### Veo 3.1 (Google)

- Endpoint: POST /api/v1/veo/generate
- Models: veo3, veo3-fast
- Parameters:
  - prompt (string, required)
  - imageUrls (array, optional - for image-to-video)
  - model: "veo3" or "veo3-fast"
  - aspectRatio: "16:9", "9:16", "1:1"
  - callBackUrl (optional)
- Status Check: GET /api/v1/veo/record-info?taskId=xxx
- 1080P: GET /api/v1/veo/get-1080p-video?taskId=xxx

### Sora 2 (OpenAI)

- Endpoint: POST /api/v1/jobs/createTask
- Models:
  - sora-2-image-to-video (Standard Image to Video)
  - sora-2-text-to-video (Standard Text to Video)
  - sora-2-pro-image-to-video (Pro Image to Video)
  - sora-2-pro-text-to-video (Pro Text to Video)
- Parameters:
  - prompt (string, required)
  - image_urls (array, for image-to-video)
  - aspect_ratio: "landscape", "portrait"
  - n_frames: "10", "15"
  - remove_watermark: boolean

### Kling 2.6 (Kuaishou)

- Endpoint: POST /api/v1/jobs/createTask
- Models:
  - kling-2.6/text-to-video (Text to Video)
  - kling-2.6/image-to-video (Image to Video)
- Parameters:
  - prompt (string, required)
  - image_urls (array, for image-to-video)
  - sound: boolean (native audio generation)
  - aspect_ratio: "1:1", "16:9", "9:16"
  - duration: "5", "10"
  - negative_prompt (optional)
  - cfg_scale (optional)

### Grok Imagine (xAI)

- Endpoint: POST /api/v1/jobs/createTask
- Models:
  - grok-imagine/text-to-video (Text to Video)
  - grok-imagine/image-to-video (Image to Video)
- Parameters:
  - prompt (string, required)
  - image_url (string, for image-to-video)
  - aspect_ratio: "2:3", "3:2", "1:1"
  - mode: "fun", "normal", "spicy"

## Common Response Format

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_xxx_123456789"
  }
}
```

## Task Status Check (for non-Veo models)

GET /api/v1/jobs/getTaskDetails?taskId=xxx

## Pricing (Our Cost → Selling Price with 50% markup)

- Veo 3.1 Fast: $0.30 → 50 kredi
- Grok Imagine (6s): $0.10 → 17 kredi (round to 15)
- Kling 2.6 (5s no audio): $0.28 → 45 kredi
- Kling 2.6 (10s no audio): $0.55 → 90 kredi
- Kling 2.6 (5s with audio): $0.55 → 90 kredi
- Kling 2.6 (10s with audio): $1.10 → 180 kredi
- Sora 2 Standard (10s): $0.75 → 120 kredi
- Sora 2 Standard (15s): $1.35 → 220 kredi
- Sora 2 Pro High (10s): $1.65 → 265 kredi
- Sora 2 Pro High (15s): $3.15 → 510 kredi
