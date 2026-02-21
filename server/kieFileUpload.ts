/**
 * kie.ai File Upload API helper
 * Uploads files to kie.ai's storage for use with their AI APIs
 */

const KIE_FILE_UPLOAD_BASE_URL = "https://kieai.redpandaai.co";

interface KieUploadResponse {
  success: boolean;
  code: number;
  msg: string;
  data?: {
    success?: boolean;
    fileId?: string;
    fileName: string;
    originalName?: string;
    fileSize: number;
    mimeType: string;
    filePath?: string;
    uploadPath?: string;
    fileUrl?: string;
    downloadUrl?: string;
    uploadTime?: string;
    uploadedAt?: string;
    expiresAt?: string;
  };
}

/**
 * Upload a file from a URL to kie.ai storage
 * This makes the file accessible to kie.ai's AI APIs
 */
export async function uploadToKieFromUrl(
  sourceUrl: string,
  fileName?: string
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  const apiKey = process.env.NANO_BANANA_API_KEY;
  if (!apiKey) {
    console.error("[Kie File Upload] API key not configured");
    return { success: false, error: "API key not configured" };
  }

  try {
    console.log("[Kie File Upload] Uploading from URL:", sourceUrl);

    const response = await fetch(
      `${KIE_FILE_UPLOAD_BASE_URL}/api/file-url-upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl: sourceUrl,
          uploadPath: "nano-influencer",
          fileName: fileName || undefined,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[Kie File Upload] HTTP error:",
        response.status,
        errorText
      );
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = (await response.json()) as KieUploadResponse;
    console.log("[Kie File Upload] Response:", JSON.stringify(data, null, 2));

    if (data.success && data.code === 200 && data.data) {
      const uploadedUrl = data.data.fileUrl || data.data.downloadUrl;
      if (uploadedUrl) {
        console.log(
          "[Kie File Upload] File uploaded successfully:",
          uploadedUrl
        );
        return { success: true, fileUrl: uploadedUrl };
      }
    }

    return { success: false, error: data.msg || "Upload failed" };
  } catch (error) {
    console.error("[Kie File Upload] Error:", error);
    return { success: false, error: "Request failed" };
  }
}

/**
 * Upload a file as base64 to kie.ai storage
 */
export async function uploadToKieBase64(
  base64Data: string,
  fileName?: string
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  const apiKey = process.env.NANO_BANANA_API_KEY;
  if (!apiKey) {
    console.error("[Kie File Upload] API key not configured");
    return { success: false, error: "API key not configured" };
  }

  try {
    console.log("[Kie File Upload] Uploading base64 data");

    const response = await fetch(
      `${KIE_FILE_UPLOAD_BASE_URL}/api/file-base64-upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64Data,
          uploadPath: "nano-influencer",
          fileName: fileName || undefined,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[Kie File Upload] HTTP error:",
        response.status,
        errorText
      );
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = (await response.json()) as KieUploadResponse;
    console.log("[Kie File Upload] Response:", JSON.stringify(data, null, 2));

    if (data.success && data.code === 200 && data.data) {
      const uploadedUrl = data.data.fileUrl || data.data.downloadUrl;
      if (uploadedUrl) {
        console.log(
          "[Kie File Upload] File uploaded successfully:",
          uploadedUrl
        );
        return { success: true, fileUrl: uploadedUrl };
      }
    }

    return { success: false, error: data.msg || "Upload failed" };
  } catch (error) {
    console.error("[Kie File Upload] Error:", error);
    return { success: false, error: "Request failed" };
  }
}
