import { ENV } from "../_core/env";

const KIE_AI_BASE_URL = "https://api.kie.ai";
const KIE_REQUEST_TIMEOUT_MS = 45_000;
const KIE_REQUEST_MAX_RETRIES = 2;

export function getApiMessage(
  response: { msg?: string; message?: string } | null | undefined
): string {
  return response?.msg || response?.message || "Kie API request failed";
}

export function isKieInProgressState(
  state: string | null | undefined
): boolean {
  if (!state) return false;
  const normalized = state.toLowerCase();
  return (
    normalized === "waiting" ||
    normalized === "queuing" ||
    normalized === "queueing" ||
    normalized === "generating" ||
    normalized === "processing" ||
    normalized === "running"
  );
}

function getApiKey(): string {
  const apiKey = ENV.kieAiApiKey;
  if (!apiKey) {
    throw new Error("KIE_AI_API_KEY is not configured");
  }
  return apiKey;
}

export async function makeKieRequest<T>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, unknown>
): Promise<T> {
  const url = `${KIE_AI_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method === "POST") {
    options.body = JSON.stringify(body);
  }

  console.log(
    `[KieAI] ${method} ${endpoint}`,
    body ? JSON.stringify(body).substring(0, 200) : ""
  );

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= KIE_REQUEST_MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      KIE_REQUEST_TIMEOUT_MS
    );

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      const rawText = await response.text();
      let parsed: T;

      try {
        parsed = JSON.parse(rawText) as T;
      } catch {
        throw new Error(
          `[KieAI] Invalid JSON response (${response.status}): ${rawText.slice(0, 240)}`
        );
      }

      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        const message = `[KieAI] HTTP ${response.status} for ${endpoint}`;
        if (retryable && attempt < KIE_REQUEST_MAX_RETRIES) {
          console.warn(
            `${message}, retrying (${attempt + 1}/${KIE_REQUEST_MAX_RETRIES})`
          );
          await new Promise(resolve =>
            setTimeout(resolve, 600 * (attempt + 1))
          );
          continue;
        }
        throw new Error(message);
      }

      console.log(
        `[KieAI] Response:`,
        JSON.stringify(parsed).substring(0, 500)
      );
      return parsed;
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error(`[KieAI] Unknown request error for ${endpoint}`);
      const retryable =
        err.name === "AbortError" ||
        /network|fetch|timeout|ECONN|ETIMEDOUT|ENOTFOUND/i.test(err.message);

      if (retryable && attempt < KIE_REQUEST_MAX_RETRIES) {
        console.warn(
          `[KieAI] Request failed (${err.message}), retrying (${attempt + 1}/${KIE_REQUEST_MAX_RETRIES})`
        );
        await new Promise(resolve => setTimeout(resolve, 600 * (attempt + 1)));
      } else {
        lastError = err;
        break;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError ?? new Error(`[KieAI] Request failed: ${method} ${endpoint}`);
}
