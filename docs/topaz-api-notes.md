# Topaz Image Upscale API - Kie AI

## Endpoint
- **Create Task:** POST /api/v1/jobs/createTask
- **Query Task:** GET (status check)

## Model Name
- `topaz/image-upscale`

## Authentication
- Bearer Token: Authorization: Bearer YOUR_API_KEY

## Request Parameters

### Required
- `model`: "topaz/image-upscale"
- `input.image_url`: URL of the image to be upscaled (string, URL)
  - Accepted types: image/jpeg, image/png, image/webp
  - Max size: 10.0MB
- `input.upscale_factor`: Factor to upscale (string)
  - Available options: "1", "2", "4", "8" (1x, 2x, 4x, 8x)

### Optional
- `callBackUrl`: Callback URL for task completion notifications

## Pricing (Kie AI Credits)
- ≤2K image: 10 credits ($0.05)
- 4K image: 20 credits ($0.10)
- 8K image: 40 credits ($0.20)

## NanoInf Credit Calculation (50% markup)
- 2x upscale (≤2K): 10 × 1.5 = 15 credits
- 4x upscale (4K): 20 × 1.5 = 30 credits
- 8x upscale (8K): 40 × 1.5 = 60 credits

## Example Request
```json
{
  "model": "topaz/image-upscale",
  "input": {
    "image_url": "https://example.com/image.png",
    "upscale_factor": "2"
  }
}
```
