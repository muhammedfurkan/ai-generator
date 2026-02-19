/**
 * ElevenLabs API client
 * Supports:
 * - Text-to-Speech: POST /v1/text-to-speech/{voice_id}
 * - List voices:   GET  /v2/voices
 * - Voice cloning (IVC): POST /v1/voices/add
 */

import { ENV } from "./_core/env";

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io";

// ─── Model types ─────────────────────────────────────────────────────────────

export type ElevenLabsModel =
  | "eleven_multilingual_v2"
  | "eleven_turbo_v2_5"
  | "eleven_turbo_v2"
  | "eleven_flash_v2_5"
  | "eleven_flash_v2"
  | "eleven_monolingual_v1";

export const ELEVENLABS_MODELS: {
  id: ElevenLabsModel;
  name: string;
  description: string;
}[] = [
  {
    id: "eleven_multilingual_v2",
    name: "Multilingual v2",
    description: "Best quality, 29 languages",
  },
  {
    id: "eleven_turbo_v2_5",
    name: "Turbo v2.5",
    description: "Low latency, 32 languages",
  },
  {
    id: "eleven_turbo_v2",
    name: "Turbo v2",
    description: "Low latency, English",
  },
  {
    id: "eleven_flash_v2_5",
    name: "Flash v2.5",
    description: "Fastest, 32 languages",
  },
];

// ─── Default system voices ────────────────────────────────────────────────────

export const ELEVENLABS_DEFAULT_VOICES: {
  voice_id: string;
  name: string;
  gender: string;
  accent: string;
  description?: string;
}[] = [
  {
    voice_id: "JBFqnCBsd6RMkjVDRZzb",
    name: "George",
    gender: "male",
    accent: "British",
    description: "Warm, storytelling",
  },
  {
    voice_id: "CwhRBWXzGAHq8TQ4Fs17",
    name: "Roger",
    gender: "male",
    accent: "American",
    description: "Confident, knowledgeable",
  },
  {
    voice_id: "EXAVITQu4vr4xnSDxMaL",
    name: "Sarah",
    gender: "female",
    accent: "American",
    description: "Soft, conversational",
  },
  {
    voice_id: "FGY2WhTYpPnrIDTdsKH5",
    name: "Laura",
    gender: "female",
    accent: "American",
    description: "Upbeat, clear",
  },
  {
    voice_id: "TX3LPaxmHKxFdv7VOQHJ",
    name: "Liam",
    gender: "male",
    accent: "American",
    description: "Articulate, young adult",
  },
  {
    voice_id: "XB0fDUnXU5powFXDhCwa",
    name: "Charlotte",
    gender: "female",
    accent: "English-Swedish",
    description: "Seductive, confident",
  },
  {
    voice_id: "Xb7hH8MSUJpSbSDYk0k2",
    name: "Alice",
    gender: "female",
    accent: "British",
    description: "Confident, middle-aged",
  },
  {
    voice_id: "iP95p4xoKVk53GoZ742B",
    name: "Chris",
    gender: "male",
    accent: "American",
    description: "Casual conversational",
  },
  {
    voice_id: "nPczCjzI2devNBz1zQrb",
    name: "Brian",
    gender: "male",
    accent: "American",
    description: "Deep, calm",
  },
  {
    voice_id: "onwK4e9ZLuTAKqWW03F9",
    name: "Daniel",
    gender: "male",
    accent: "British",
    description: "Professional, news anchor",
  },
  {
    voice_id: "pFZP5JQG7iQjIQuC4Bku",
    name: "Lily",
    gender: "female",
    accent: "British",
    description: "Warm, conversational",
  },
  {
    voice_id: "pqHfZKP75CvOlQylNhV4",
    name: "Bill",
    gender: "male",
    accent: "American",
    description: "Strong, trustworthy",
  },
];

// ─── Request / response types ─────────────────────────────────────────────────

export interface ElevenLabsTTSRequest {
  text: string;
  model_id?: ElevenLabsModel;
  voice_settings?: {
    stability?: number; // 0–1
    similarity_boost?: number; // 0–1
    style?: number; // 0–1
    speed?: number; // 0.7–1.2
    use_speaker_boost?: boolean;
  };
  language_code?: string;
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  preview_url?: string;
  labels?: Record<string, string>;
}

export interface ElevenLabsVoicesResponse {
  voices: ElevenLabsVoice[];
  has_more: boolean;
  total_count: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getHeaders(contentType = "application/json") {
  return {
    "xi-api-key": ENV.elevenlabsApiKey,
    "Content-Type": contentType,
  };
}

// ─── Text-to-Speech ───────────────────────────────────────────────────────────

/**
 * Generate speech from text using ElevenLabs.
 * Returns the audio as a Buffer (mp3).
 */
export async function elevenlabsTextToSpeech(
  voiceId: string,
  req: ElevenLabsTTSRequest
): Promise<Buffer> {
  const body = {
    text: req.text,
    model_id: req.model_id ?? "eleven_multilingual_v2",
    voice_settings: req.voice_settings ?? {
      stability: 0.5,
      similarity_boost: 0.75,
    },
    ...(req.language_code ? { language_code: req.language_code } : {}),
  };

  const res = await fetch(
    `${ELEVENLABS_BASE_URL}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[ElevenLabs TTS] HTTP ${res.status}: ${text}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ─── List voices ──────────────────────────────────────────────────────────────

/**
 * List available voices for the authenticated user.
 */
export async function elevenlabsListVoices(
  page_size = 30
): Promise<ElevenLabsVoice[]> {
  const res = await fetch(
    `${ELEVENLABS_BASE_URL}/v2/voices?page_size=${page_size}&voice_type=default`,
    {
      method: "GET",
      headers: { "xi-api-key": ENV.elevenlabsApiKey },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[ElevenLabs Voices] HTTP ${res.status}: ${text}`);
  }

  const data = (await res.json()) as ElevenLabsVoicesResponse;
  return data.voices;
}

// ─── Instant Voice Cloning ────────────────────────────────────────────────────

/**
 * Clone a voice from audio file buffer(s).
 * Returns the new voice_id.
 */
export async function elevenlabsCloneVoice(
  name: string,
  audioBuffers: Buffer[],
  description?: string
): Promise<string> {
  const form = new FormData();
  form.append("name", name);
  if (description) form.append("description", description);

  for (let i = 0; i < audioBuffers.length; i++) {
    const blob = new Blob([new Uint8Array(audioBuffers[i])], {
      type: "audio/mpeg",
    });
    form.append("files", blob, `sample_${i + 1}.mp3`);
  }

  const res = await fetch(`${ELEVENLABS_BASE_URL}/v1/voices/add`, {
    method: "POST",
    headers: {
      "xi-api-key": ENV.elevenlabsApiKey,
    },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[ElevenLabs VoiceClone] HTTP ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { voice_id: string };
  return data.voice_id;
}
