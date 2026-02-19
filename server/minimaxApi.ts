/**
 * MiniMax API client
 * Supports:
 * - Text-to-Speech (T2A v2): https://api.minimax.io/v1/t2a_v2
 * - Music Generation: https://api.minimax.io/v1/music_generation
 * - Voice management: list / clone
 */

import { ENV } from "./_core/env";

const MINIMAX_BASE_URL = "https://api.minimax.io";

// ─── Model types ─────────────────────────────────────────────────────────────

export type MinimaxTTSModel =
  | "speech-2.8-hd"
  | "speech-2.8-turbo"
  | "speech-2.6-hd"
  | "speech-2.6-turbo"
  | "speech-02-hd"
  | "speech-02-turbo"
  | "speech-01-hd"
  | "speech-01-turbo";

export type MinimaxMusicModel = "music-2.5";

export type MinimaxEmotion =
  | "happy"
  | "sad"
  | "angry"
  | "fearful"
  | "disgusted"
  | "surprised"
  | "calm"
  | "fluent"
  | "whisper";

export type MinimaxLanguageBoost =
  | "auto"
  | "Chinese"
  | "English"
  | "Turkish"
  | "German"
  | "French"
  | "Spanish"
  | "Portuguese"
  | "Japanese"
  | "Korean"
  | "Arabic"
  | "Russian"
  | "Italian"
  | "Dutch"
  | null;

// ─── System voices ────────────────────────────────────────────────────────────

export const MINIMAX_SYSTEM_VOICES: {
  id: string;
  name: string;
  lang: string;
  gender: string;
}[] = [
  // English
  {
    id: "English_expressive_narrator",
    name: "Expressive Narrator",
    lang: "English",
    gender: "neutral",
  },
  {
    id: "English_Graceful_Lady",
    name: "Graceful Lady",
    lang: "English",
    gender: "female",
  },
  {
    id: "English_Insightful_Speaker",
    name: "Insightful Speaker",
    lang: "English",
    gender: "male",
  },
  {
    id: "English_radiant_girl",
    name: "Radiant Girl",
    lang: "English",
    gender: "female",
  },
  {
    id: "English_Persuasive_Man",
    name: "Persuasive Man",
    lang: "English",
    gender: "male",
  },
  {
    id: "English_Lucky_Robot",
    name: "Lucky Robot",
    lang: "English",
    gender: "neutral",
  },
  // Chinese
  {
    id: "Chinese (Mandarin)_Lyrical_Voice",
    name: "Lyrical Voice (CN)",
    lang: "Chinese",
    gender: "female",
  },
  {
    id: "Chinese (Mandarin)_HK_Flight_Attendant",
    name: "HK Flight Attendant",
    lang: "Chinese",
    gender: "female",
  },
  // Japanese
  {
    id: "Japanese_Whisper_Belle",
    name: "Whisper Belle (JA)",
    lang: "Japanese",
    gender: "female",
  },
];

// ─── Request / response types ─────────────────────────────────────────────────

export interface MinimaxTTSRequest {
  model: MinimaxTTSModel;
  text: string;
  stream?: boolean;
  voice_setting: {
    voice_id: string;
    speed?: number; // 0.5 – 2.0
    vol?: number; // 0 – 10
    pitch?: number; // -12 – 12
    emotion?: MinimaxEmotion;
  };
  audio_setting?: {
    sample_rate?: number;
    bitrate?: number;
    format?: "mp3" | "pcm" | "flac" | "wav";
    channel?: 1 | 2;
  };
  language_boost?: MinimaxLanguageBoost;
  output_format?: "url" | "hex";
}

export interface MinimaxTTSResponse {
  data: {
    audio: string; // hex-encoded or url
    status: 1 | 2;
  } | null;
  extra_info?: {
    audio_length: number;
    audio_sample_rate: number;
    audio_size: number;
    bitrate: number;
    audio_format: string;
    audio_channel: number;
    usage_characters: number;
    word_count: number;
  };
  trace_id: string;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

export interface MinimaxMusicRequest {
  model: MinimaxMusicModel;
  lyrics: string;
  prompt?: string;
  stream?: boolean;
  output_format?: "url" | "hex";
  audio_setting?: {
    sample_rate?: number;
    bitrate?: number;
    format?: "mp3" | "wav" | "pcm";
  };
}

export interface MinimaxMusicResponse {
  data: {
    audio: string;
    status: 1 | 2;
  } | null;
  extra_info?: {
    music_duration: number;
    music_sample_rate: number;
    music_channel: number;
    bitrate: number;
    music_size: number;
  };
  trace_id: string;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

// ─── Voice management ─────────────────────────────────────────────────────────

export interface MinimaxVoiceCloneRequest {
  /** Base64-encoded audio samples (max 5, each 10s–300s) */
  file: string;
  /** Unique identifier for this voice */
  voice_id: string;
}

export interface MinimaxVoiceCloneResponse {
  voice_id: string;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ENV.minimaxApiKey}`,
  };
}

function throwIfApiError(
  status_code: number,
  status_msg: string,
  context: string
) {
  if (status_code !== 0) {
    throw new Error(`[Minimax ${context}] Error ${status_code}: ${status_msg}`);
  }
}

// ─── Text-to-Speech ───────────────────────────────────────────────────────────

/**
 * Generate speech from text using Minimax T2A v2.
 * Returns a URL to the audio file (output_format: "url") so it can be stored.
 */
export async function minimaxTextToSpeech(
  req: MinimaxTTSRequest
): Promise<{ audioUrl: string; durationMs: number; usageCharacters: number }> {
  const body: MinimaxTTSRequest = {
    ...req,
    output_format: "url",
    stream: false,
    audio_setting: {
      format: "mp3",
      sample_rate: 32000,
      bitrate: 128000,
      channel: 1,
      ...(req.audio_setting ?? {}),
    },
  };

  const res = await fetch(`${MINIMAX_BASE_URL}/v1/t2a_v2`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[Minimax TTS] HTTP ${res.status}: ${text}`);
  }

  const data = (await res.json()) as MinimaxTTSResponse;
  throwIfApiError(data.base_resp.status_code, data.base_resp.status_msg, "TTS");

  if (!data.data?.audio) {
    throw new Error("[Minimax TTS] No audio returned");
  }

  return {
    audioUrl: data.data.audio,
    durationMs: data.extra_info?.audio_length ?? 0,
    usageCharacters: data.extra_info?.usage_characters ?? 0,
  };
}

// ─── Music Generation ─────────────────────────────────────────────────────────

/**
 * Generate a music track from lyrics + optional style prompt.
 * Returns a URL to the audio file.
 */
export async function minimaxGenerateMusic(
  req: MinimaxMusicRequest
): Promise<{ audioUrl: string; durationMs: number }> {
  const body: MinimaxMusicRequest = {
    ...req,
    output_format: "url",
    stream: false,
    audio_setting: {
      format: "mp3",
      sample_rate: 44100,
      bitrate: 256000,
      ...(req.audio_setting ?? {}),
    },
  };

  const res = await fetch(`${MINIMAX_BASE_URL}/v1/music_generation`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[Minimax Music] HTTP ${res.status}: ${text}`);
  }

  const data = (await res.json()) as MinimaxMusicResponse;
  throwIfApiError(
    data.base_resp.status_code,
    data.base_resp.status_msg,
    "Music"
  );

  if (!data.data?.audio) {
    throw new Error("[Minimax Music] No audio returned");
  }

  return {
    audioUrl: data.data.audio,
    durationMs: data.extra_info?.music_duration ?? 0,
  };
}

// ─── Voice cloning ────────────────────────────────────────────────────────────

/**
 * Clone a voice from a base64-encoded audio sample.
 * Returns the voice_id that can be used in TTS requests.
 */
export async function minimaxCloneVoice(
  voiceId: string,
  base64Audio: string
): Promise<string> {
  const body = {
    file: base64Audio,
    voice_id: voiceId,
  };

  const res = await fetch(`${MINIMAX_BASE_URL}/v1/voice_clone`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[Minimax VoiceClone] HTTP ${res.status}: ${text}`);
  }

  const data = (await res.json()) as MinimaxVoiceCloneResponse;
  throwIfApiError(
    data.base_resp.status_code,
    data.base_resp.status_msg,
    "VoiceClone"
  );

  return data.voice_id;
}
