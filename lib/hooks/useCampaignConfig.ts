"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CampaignConfig,
  getCampaignConfig,
  setCampaignConfig as persistConfig,
  clearCampaignConfig,
} from "@/lib/config/campaignConfig";

interface UseCampaignConfigReturn {
  config: CampaignConfig | null;
  needsConfig: boolean;
  isValidating: boolean;
  setConfig: (config: CampaignConfig) => void;
}

export function useCampaignConfig(): UseCampaignConfigReturn {
  const [config, setConfigState] = useState<CampaignConfig | null>(null);
  const [needsConfig, setNeedsConfig] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function validate() {
      const saved = getCampaignConfig();

      if (!saved) {
        if (!cancelled) {
          setNeedsConfig(true);
          setIsValidating(false);
        }
        return;
      }

      try {
        const params = new URLSearchParams({
          folderId: saved.campaignFolderId,
          includeFolders: "true",
        });
        const res = await fetch(`/api/drive/files?${params}`);
        if (!res.ok) throw new Error("Folder not accessible");

        if (!cancelled) {
          setConfigState(saved);
          setNeedsConfig(false);
        }
      } catch {
        clearCampaignConfig();
        if (!cancelled) {
          setNeedsConfig(true);
        }
      } finally {
        if (!cancelled) {
          setIsValidating(false);
        }
      }
    }

    validate();
    return () => {
      cancelled = true;
    };
  }, []);

  const setConfig = useCallback((newConfig: CampaignConfig) => {
    persistConfig(newConfig);
    setConfigState(newConfig);
    setNeedsConfig(false);
  }, []);

  return { config, needsConfig, isValidating, setConfig };
}
