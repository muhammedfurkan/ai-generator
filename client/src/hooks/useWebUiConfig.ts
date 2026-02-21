import { useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { parseWebUiConfig } from "@/lib/webUiConfig";
import { parseFeatureFlags } from "@/lib/featureFlags";

export function useWebUiConfig() {
  const settingsQuery = trpc.settings.getPublicSettings.useQuery(undefined, {
    staleTime: 30_000,
  });

  const settingsMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const setting of settingsQuery.data ?? []) {
      if (typeof setting.value === "string") {
        map.set(setting.key, setting.value);
      }
    }

    return map;
  }, [settingsQuery.data]);

  const getSetting = useCallback(
    (key: string, fallback = "") => settingsMap.get(key) ?? fallback,
    [settingsMap]
  );

  const getBooleanSetting = useCallback(
    (key: string, fallback = false) => {
      const value = settingsMap.get(key);
      if (value === undefined) return fallback;
      return ["true", "1", "yes", "on"].includes(value.toLowerCase());
    },
    [settingsMap]
  );

  const webUiConfig = useMemo(
    () => parseWebUiConfig(settingsMap.get("web_ui_config")),
    [settingsMap]
  );
  const featureFlags = useMemo(
    () => parseFeatureFlags(settingsMap),
    [settingsMap]
  );

  return {
    ...settingsQuery,
    settingsMap,
    getSetting,
    getBooleanSetting,
    webUiConfig,
    featureFlags,
  };
}
