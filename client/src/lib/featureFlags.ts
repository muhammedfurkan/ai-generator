export const FEATURE_FLAG_DEFAULTS = {
  maintenance_mode_enabled: false,
  registration_enabled: true,
  referral_system_enabled: true,
  referral_show_on_dashboard: true,
  image_generation_enabled: true,
  video_generation_enabled: true,
  ai_influencer_enabled: true,
  upscale_enabled: true,
  audio_generation_enabled: true,
  music_generation_enabled: true,
  gallery_enabled: true,
  blog_enabled: true,
  community_enabled: true,
  email_notifications_enabled: true,
  push_notifications_enabled: false,
  packages_bonus_message: true,
  packages_validity_message: true,
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAG_DEFAULTS;
export type FeatureFlags = Record<FeatureFlagKey, boolean>;

const TRUE_VALUES = new Set(["true", "1", "yes", "on"]);
const FALSE_VALUES = new Set(["false", "0", "no", "off"]);

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;

  const normalized = value.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;

  return fallback;
};

export const parseFeatureFlags = (
  settingsMap: Map<string, string>
): FeatureFlags => {
  const next = {} as FeatureFlags;

  (Object.keys(FEATURE_FLAG_DEFAULTS) as FeatureFlagKey[]).forEach(key => {
    next[key] = parseBoolean(settingsMap.get(key), FEATURE_FLAG_DEFAULTS[key]);
  });

  return next;
};
