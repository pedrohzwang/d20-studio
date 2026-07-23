"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect } from "react";
import Header from "@/components/layout/Header";
import CampaignFolderModal from "@/components/config/CampaignFolderModal";
import { useCampaignConfig } from "@/lib/hooks/useCampaignConfig";
import { CampaignConfig } from "@/lib/config/campaignConfig";

interface CampaignConfigContextValue {
  config: CampaignConfig | null;
  isValidating: boolean;
}

const CampaignConfigContext = createContext<CampaignConfigContextValue>({
  config: null,
  isValidating: true,
});

export function useDashboardCampaignConfig() {
  return useContext(CampaignConfigContext);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { config, needsConfig, isValidating, setConfig } = useCampaignConfig();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || (status === "authenticated" && isValidating)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <CampaignConfigContext.Provider value={{ config, isValidating }}>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <CampaignFolderModal isOpen={needsConfig} onConfirm={setConfig} />
      </div>
    </CampaignConfigContext.Provider>
  );
}
