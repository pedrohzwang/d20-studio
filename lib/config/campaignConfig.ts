const STORAGE_KEY = "d20studio_config";

export interface CampaignConfig {
  campaignFolderId: string;
  campaignFolderName: string;
}

export function getCampaignConfig(): CampaignConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.campaignFolderId === "string" &&
      typeof parsed?.campaignFolderName === "string" &&
      parsed.campaignFolderId.length > 0
    ) {
      return {
        campaignFolderId: parsed.campaignFolderId,
        campaignFolderName: parsed.campaignFolderName,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function setCampaignConfig(config: CampaignConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearCampaignConfig(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
