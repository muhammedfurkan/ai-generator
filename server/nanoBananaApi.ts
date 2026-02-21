import { uploadToKieFromUrl } from "./kieFileUpload";
import { translateApiError } from "./utils/errorTranslations";

const API_BASE_URL = "https://api.kie.ai/api/v1";

interface TaskStatusResponse {
  code: number;
  message?: string;
  data?: {
    taskId: string;
    model: string;
    state: "waiting" | "queuing" | "generating" | "success" | "fail";
    resultJson?: string;
    failMsg?: string;
    [key: string]: unknown;
  };
}

interface CreateTaskResponse {
  taskId: string;
  success: boolean;
  error?: string;
}

/**
 * Create a generation task on Nano Banana Pro or Qwen
 */
export async function createGenerationTask(input: {
  prompt: string;
  aspectRatio:
    | "1:1"
    | "16:9"
    | "9:16"
    | "4:3"
    | "3:4"
    | "3:2"
    | "2:3"
    | "21:9"
    | "4:5"
    | "5:4";
  resolution: "1K" | "2K" | "4K";
  referenceImageUrls?: string[]; // Çoklu görsel desteği (max 8)
  referenceImageUrl?: string; // Geriye uyumluluk için
  model?: "nano-banana-pro" | "qwen" | "seedream";
}): Promise<CreateTaskResponse> {
  const apiKey = process.env.NANO_BANANA_API_KEY;
  if (!apiKey) {
    console.error("[Nano Banana API] API key not configured");
    return {
      taskId: "",
      success: false,
      error: "API anahtarı yapılandırılmamış",
    };
  }

  try {
    // Use the model from input, default to nano-banana-pro
    const selectedModel = input.model || "nano-banana-pro";

    const payload: Record<string, unknown> = {
      model: selectedModel,
      input: {
        prompt: input.prompt,
        aspect_ratio: input.aspectRatio,
        resolution: input.resolution,
        output_format: "png",
      },
    };

    // Add reference images if available - upload to kie.ai storage
    const imageUrls =
      input.referenceImageUrls ||
      (input.referenceImageUrl ? [input.referenceImageUrl] : []);

    if (imageUrls.length > 0) {
      console.log(
        `[Nano Banana API] Processing ${imageUrls.length} reference image(s)...`
      );
      const uploadedUrls: string[] = [];

      for (let i = 0; i < Math.min(imageUrls.length, 8); i++) {
        const imageUrl = imageUrls[i];
        console.log(
          `[Nano Banana API] Uploading reference image ${i + 1}/${imageUrls.length} to kie.ai storage...`
        );
        const uploadResult = await uploadToKieFromUrl(imageUrl);

        if (uploadResult.success && uploadResult.fileUrl) {
          uploadedUrls.push(uploadResult.fileUrl);
          console.log(
            `[Nano Banana API] Image ${i + 1} uploaded to kie.ai:`,
            uploadResult.fileUrl
          );
        } else {
          console.warn(
            `[Nano Banana API] Failed to upload image ${i + 1}, using original URL`
          );
          console.warn("[Nano Banana API] Upload error:", uploadResult.error);
          // Fallback to original URL
          uploadedUrls.push(imageUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        (payload.input as Record<string, unknown>).image_input = uploadedUrls;
        console.log(
          `[Nano Banana API] Total ${uploadedUrls.length} reference image(s) ready for API`
        );
      }
    }

    console.log(
      "[Nano Banana API] Creating task with payload:",
      JSON.stringify(payload, null, 2)
    );

    const response = await fetch(`${API_BASE_URL}/jobs/createTask`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Check if response is OK before parsing JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[Nano Banana API] HTTP error:",
        response.status,
        errorText
      );
      return {
        taskId: "",
        success: false,
        error: `Sunucu hatası: HTTP ${response.status}`,
      };
    }

    let data: Record<string, unknown>;
    try {
      data = (await response.json()) as Record<string, unknown>;
    } catch (parseError) {
      console.error("[Nano Banana API] JSON parse error:", parseError);
      const responseText = await response
        .text()
        .catch(() => "Unable to read response");
      console.error("[Nano Banana API] Response text:", responseText);
      return {
        taskId: "",
        success: false,
        error: "API yanıtı işlenemedi",
      };
    }
    console.log(
      "[Nano Banana API] Task creation response:",
      JSON.stringify(data, null, 2)
    );

    if ((data as Record<string, unknown>).code === 200) {
      const taskData = (data as Record<string, unknown>).data as Record<
        string,
        unknown
      >;
      const taskId = taskData?.taskId as string;
      if (taskId) {
        console.log("[Nano Banana API] Task created successfully:", taskId);
        return {
          taskId,
          success: true,
        };
      }
    }

    return {
      taskId: "",
      success: false,
      error:
        ((data as Record<string, unknown>).message as string) ||
        "Görsel üretimi başarısız oldu",
    };
  } catch (error) {
    console.error("[Nano Banana API] Error creating task:", error);
    return {
      taskId: "",
      success: false,
      error: "İstek başarısız oldu",
    };
  }
}

/**
 * Get the status of a generation task using GET /jobs/recordInfo
 */
export async function getTaskStatus(
  taskId: string
): Promise<TaskStatusResponse | null> {
  const apiKey = process.env.NANO_BANANA_API_KEY;
  if (!apiKey) {
    console.error("[Nano Banana API] API key not configured");
    return null;
  }

  try {
    const url = `${API_BASE_URL}/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`;
    console.log("[Nano Banana API] Fetching task status from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // Check if response is OK before parsing JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[Nano Banana API] HTTP error on status check:",
        response.status,
        errorText
      );
      return null;
    }

    let data: TaskStatusResponse;
    try {
      data = (await response.json()) as TaskStatusResponse;
    } catch (parseError) {
      console.error(
        "[Nano Banana API] JSON parse error on status check:",
        parseError
      );
      return null;
    }
    console.log("[Nano Banana API] Task status response code:", data.code);
    console.log("[Nano Banana API] Task state:", data.data?.state);

    return data;
  } catch (error) {
    console.error("[Nano Banana API] Error getting task status:", error);
    return null;
  }
}

/**
 * Poll for task completion and extract image URL with detailed error information
 */
export async function pollTaskCompletionWithError(
  taskId: string,
  maxAttempts: number = 600,
  delayMs: number = 2000
): Promise<{ imageUrl: string | null; error: string | null }> {
  let lastError: string | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const status = await getTaskStatus(taskId);

      if (!status) {
        lastError = "Görev durumu alınamadı";
        console.warn(
          `[Nano Banana API] Attempt ${attempt + 1}/${maxAttempts}: ${lastError}`
        );
      } else if (status.code === 200 && status.data) {
        const taskState = status.data.state;
        console.log(
          `[Nano Banana API] Task state (attempt ${attempt + 1}/${maxAttempts}): ${taskState}`
        );

        if (taskState === "success") {
          // Parse resultJson to get image URLs
          if (status.data.resultJson) {
            try {
              // resultJson bazen string bazen object olabiliyor
              let result: Record<string, unknown>;
              if (typeof status.data.resultJson === "string") {
                result = JSON.parse(status.data.resultJson);
              } else {
                result = status.data.resultJson as Record<string, unknown>;
              }

              // resultUrls veya images array'ini kontrol et
              const imageUrls = (result.resultUrls ||
                result.images ||
                result.output ||
                result.result) as string[];
              if (
                imageUrls &&
                Array.isArray(imageUrls) &&
                imageUrls.length > 0
              ) {
                const imageUrl = imageUrls[0];
                console.log(
                  "[Nano Banana API] Task completed successfully, image URL:",
                  imageUrl
                );
                return { imageUrl, error: null };
              }

              // Tek bir URL olarak dönebilir
              const singleUrl = (result.url ||
                result.imageUrl ||
                result.output_url) as string;
              if (singleUrl && typeof singleUrl === "string") {
                console.log(
                  "[Nano Banana API] Task completed successfully, single image URL:",
                  singleUrl
                );
                return { imageUrl: singleUrl, error: null };
              }

              console.warn(
                "[Nano Banana API] Task completed but no image URLs found in resultJson"
              );
              console.warn(
                "[Nano Banana API] resultJson parsed content:",
                JSON.stringify(result)
              );
              lastError = "Sonuç bulunamadı";
            } catch (parseError) {
              console.error(
                "[Nano Banana API] Failed to parse resultJson:",
                parseError
              );
              console.error(
                "[Nano Banana API] resultJson content:",
                status.data.resultJson
              );
              console.error(
                "[Nano Banana API] resultJson type:",
                typeof status.data.resultJson
              );
              lastError = "Sonuç işlenemedi";
            }
          } else {
            console.warn(
              "[Nano Banana API] Task completed but no resultJson found"
            );
            lastError = "Sonuç bulunamadı";
          }
          return { imageUrl: null, error: lastError };
        }

        if (taskState === "fail") {
          // Get detailed error message from API
          const rawError =
            status.data.failMsg || "Görsel üretimi başarısız oldu";

          // Türkçe'ye çevir
          const translatedError = translateApiError(rawError);
          lastError = `API_ERROR - ${translatedError}`;

          console.error(
            `[Nano Banana API] Task failed. Raw error: ${rawError}, Translated: ${translatedError}`
          );
          return { imageUrl: null, error: lastError };
        }

        if (
          taskState === "waiting" ||
          taskState === "queuing" ||
          taskState === "generating"
        ) {
          lastError = null;
          console.log(
            `[Nano Banana API] Task still processing... (${taskState})`
          );
        }
      } else {
        lastError = `API_ERROR - ${status?.message || "Bilinmeyen hata"}`;
        console.warn(`[Nano Banana API] API error: ${lastError}`);
      }
    } catch (error) {
      lastError = `NETWORK_ERROR - ${error instanceof Error ? error.message : "Bilinmeyen hata"}`;
      console.warn(`[Nano Banana API] Polling error: ${lastError}`);
    }

    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.error(
    `[Nano Banana API] Task polling timed out after ${maxAttempts} attempts`
  );
  // If we have a specific error, return it; otherwise return timeout
  return {
    imageUrl: null,
    error:
      lastError ||
      "TIMEOUT - Görsel üretimi zaman aşımına uğradı (maksimum bekleme süresi aşıldı)",
  };
}

/**
 * Poll for task completion and extract image URL
 */
export async function pollTaskCompletion(
  taskId: string,
  maxAttempts: number = 600,
  delayMs: number = 2000
): Promise<string | null> {
  const result = await pollTaskCompletionWithError(
    taskId,
    maxAttempts,
    delayMs
  );
  return result.imageUrl;
}
