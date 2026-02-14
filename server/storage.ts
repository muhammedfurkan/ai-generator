/**
 * Storage helpers with support for:
 * 1. Local (Simple) - Stores files on the local filesystem
 * 2. Cloudinary (Recommended for images/videos) - Easy setup, generous free tier
 * 3. Cloudflare R2 (Budget-friendly, S3-compatible) - Free egress
 * 4. AWS S3 (Enterprise-grade)
 * 
 * Set STORAGE_PROVIDER in .env to: 'local', 'cloudinary', 'r2', or 's3'
 */

import { ENV } from './_core/env';
import fs from 'fs/promises';
import path from 'path';

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'local';

// ============ LOCAL FILESYSTEM IMPLEMENTATION ============

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

async function ensureUploadsDir(subPath: string): Promise<void> {
  const fullPath = path.join(UPLOADS_DIR, path.dirname(subPath));
  await fs.mkdir(fullPath, { recursive: true });
}

async function localUpload(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, '');

  // Ensure the directory exists
  await ensureUploadsDir(key);

  // Write file to disk
  const filePath = path.join(UPLOADS_DIR, key);
  const buffer = data instanceof Buffer ? data : Buffer.from(data);
  await fs.writeFile(filePath, buffer);

  // Generate public URL
  // Use LOCAL_BASE_URL if set, otherwise use relative path
  const baseUrl = process.env.LOCAL_BASE_URL || '';
  const url = `${baseUrl}/uploads/${key}`;

  console.log(`[Storage] Local file saved: ${filePath}`);

  return { key, url };
}

async function localGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, '');
  const baseUrl = process.env.LOCAL_BASE_URL || '';
  const url = `${baseUrl}/uploads/${key}`;
  return { key, url };
}

// ============ CLOUDINARY IMPLEMENTATION ============

async function cloudinaryUpload(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
    );
  }

  const key = relKey.replace(/^\/+/, "");
  const resourceType = contentType.startsWith('video/') ? 'video' : 'image';

  // Convert to base64
  const base64Data = Buffer.from(data).toString('base64');
  const dataUri = `data:${contentType};base64,${base64Data}`;

  // Generate signature
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = key.replace(/\.[^.]+$/, ''); // Remove extension

  const params = {
    timestamp: timestamp.toString(),
    public_id: publicId,
    folder: 'nanoinf',
  };

  const signature = await generateCloudinarySignature(params, apiSecret);

  const formData = new FormData();
  formData.append('file', dataUri);
  formData.append('api_key', apiKey);
  formData.append('timestamp', params.timestamp);
  formData.append('public_id', params.public_id);
  formData.append('folder', params.folder);
  formData.append('signature', signature);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  const result = await response.json();
  return { key, url: result.secure_url };
}

async function generateCloudinarySignature(
  params: Record<string, string>,
  apiSecret: string
): Promise<string> {
  // Sort params alphabetically and create signature string
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const message = sortedParams + apiSecret;

  // Use Web Crypto API for SHA-1
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

// ============ CLOUDFLARE R2 / AWS S3 IMPLEMENTATION ============

let s3Client: any = null;

async function initS3Client() {
  if (s3Client) return s3Client;

  // Dynamically import AWS SDK (only when needed)
  const { S3Client } = await import('@aws-sdk/client-s3');

  const config: any = {
    region: process.env.S3_REGION || 'auto',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || '',
      secretAccessKey: process.env.S3_SECRET_KEY || '',
    },
  };

  // For Cloudflare R2, endpoint is required
  if (STORAGE_PROVIDER === 'r2' || process.env.S3_ENDPOINT) {
    config.endpoint = process.env.S3_ENDPOINT;
  }

  s3Client = new S3Client(config);
  return s3Client;
}

async function s3Upload(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    throw new Error('S3_BUCKET not configured');
  }

  const client = await initS3Client();
  const { PutObjectCommand } = await import('@aws-sdk/client-s3');

  const key = relKey.replace(/^\/+/, '');

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data instanceof Buffer ? data : Buffer.from(data),
      ContentType: contentType,
      ACL: 'public-read', // Make files publicly accessible
    })
  );

  // Generate public URL
  // Generate public URL
  const publicUrl = getPublicUrl(key);

  return { key, url: publicUrl };
}

function getPublicUrl(key: string): string {
  // Use S3_PUBLIC_URL or R2_PUBLIC_URL if set (Custom Domain or R2.dev subdomain)
  const publicBaseUrl = process.env.S3_PUBLIC_URL || process.env.R2_PUBLIC_URL;

  if (publicBaseUrl) {
    return `${publicBaseUrl}/${key}`;
  }

  if (STORAGE_PROVIDER === 'r2') {
    // Cloudflare R2 public URL
    // Option 1: R2_DEV_SUBDOMAIN (e.g. pub-xxxxxxxx)
    const devSubdomain = process.env.R2_DEV_SUBDOMAIN;
    if (devSubdomain) {
      return `https://${devSubdomain}.r2.dev/${key}`;
    }

    // Option 2: Fallback to account ID (Legacy/Incorrect assumption but kept for backward compat with warning)
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
    if (accountId) {
      // NOTE: utilization of accountId as subdomain is likely incorrect for R2.dev authentication
      return `https://pub-${accountId}.r2.dev/${key}`;
    }
  }

  // AWS S3 default
  const bucket = process.env.S3_BUCKET || '';
  const region = process.env.S3_REGION || 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

// ============ PUBLIC API ============

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = 'application/octet-stream'
): Promise<{ key: string; url: string }> {
  try {
    switch (STORAGE_PROVIDER) {
      case 'local':
        return await localUpload(relKey, data, contentType);
      case 'cloudinary':
        return await cloudinaryUpload(relKey, data, contentType);
      case 'r2':
      case 's3':
        return await s3Upload(relKey, data, contentType);
      default:
        throw new Error(
          `Unknown STORAGE_PROVIDER: ${STORAGE_PROVIDER}. Use 'local', 'cloudinary', 'r2', or 's3'`
        );
    }
  } catch (error) {
    console.error('[Storage] Upload failed:', error);
    throw error;
  }
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, '');

  // For Local
  if (STORAGE_PROVIDER === 'local') {
    return await localGet(key);
  }

  // For Cloudinary
  if (STORAGE_PROVIDER === 'cloudinary') {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('CLOUDINARY_CLOUD_NAME not configured');
    }
    const url = `https://res.cloudinary.com/${cloudName}/image/upload/nanoinf/${key}`;
    return { key, url };
  }

  // For S3/R2
  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    throw new Error('S3_BUCKET not configured');
  }

  const publicUrl = getPublicUrl(key);

  return { key, url: publicUrl };
}
