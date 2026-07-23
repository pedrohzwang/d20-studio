"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@heroui/react";
import { DriveFile } from "@/lib/storage/types";
import { CampaignConfig } from "@/lib/config/campaignConfig";

interface BreadcrumbEntry {
  id: string | undefined;
  name: string;
}

interface CampaignFolderModalProps {
  isOpen: boolean;
  onConfirm: (config: CampaignConfig) => void;
}

export default function CampaignFolderModal({
  isOpen,
  onConfirm,
}: CampaignFolderModalProps) {
  const [folders, setFolders] = useState<DriveFile[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbEntry[]>([
    { id: undefined, name: "My Drive" },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<DriveFile | null>(null);

  const currentFolderId = breadcrumb[breadcrumb.length - 1].id;

  const fetchFolders = useCallback(async (folderId?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ includeFolders: "true" });
      if (folderId) params.set("folderId", folderId);
      const res = await fetch(`/api/drive/files?${params}`);
      if (!res.ok) throw new Error("Failed to load folders");
      const data = await res.json();
      setFolders(data.folders ?? []);
    } catch {
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFolders(currentFolderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breadcrumb, isOpen]);

  const enterFolder = (folder: DriveFile) => {
    setSelectedFolder(null);
    setBreadcrumb((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const navigateTo = (index: number) => {
    setSelectedFolder(null);
    setBreadcrumb((prev) => prev.slice(0, index + 1));
  };

  const handleConfirm = () => {
    if (selectedFolder) {
      onConfirm({
        campaignFolderId: selectedFolder.id,
        campaignFolderName: selectedFolder.name,
      });
    }
  };

  // Allow selecting current folder (the one user navigated into)
  const handleSelectCurrentFolder = () => {
    const current = breadcrumb[breadcrumb.length - 1];
    if (current.id) {
      onConfirm({
        campaignFolderId: current.id,
        campaignFolderName: current.name,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      isDismissable={false}
      hideCloseButton
      size="lg"
      classNames={{
        backdrop: "bg-black/60 backdrop-blur-sm",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-lg font-bold">Configure Campaign Folder</h2>
          <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Select the Google Drive folder where your RPG campaigns are stored.
            Each subfolder inside it will be treated as a separate campaign.
          </p>
        </ModalHeader>

        <ModalBody>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 flex-wrap mb-3 px-1">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && (
                  <span className="text-gray-400 text-xs">/</span>
                )}
                <button
                  className={`text-sm truncate max-w-[120px] ${
                    i === breadcrumb.length - 1
                      ? "text-gray-700 dark:text-gray-300 font-medium"
                      : "text-purple-500 hover:underline"
                  }`}
                  onClick={() => navigateTo(i)}
                  title={crumb.name}
                >
                  {crumb.name}
                </button>
              </span>
            ))}
          </div>

          {/* Folder list */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="sm" />
              </div>
            ) : folders.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No subfolders found.
                {currentFolderId && (
                  <span className="block mt-1">
                    You can select the current folder using the button below.
                  </span>
                )}
              </div>
            ) : (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                    selectedFolder?.id === folder.id
                      ? "bg-purple-50 dark:bg-purple-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                  onClick={() => setSelectedFolder(folder)}
                  onDoubleClick={() => enterFolder(folder)}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                    {folder.name}
                  </span>
                  <button
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      enterFolder(folder);
                    }}
                    title="Open folder"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {selectedFolder && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
              Selected: <span className="font-medium text-purple-600">{selectedFolder.name}</span>
              {" — "}click &quot;Confirm&quot; to use this folder, or double-click to enter it.
            </p>
          )}
        </ModalBody>

        <ModalFooter>
          {currentFolderId && (
            <Button
              variant="light"
              onPress={handleSelectCurrentFolder}
              className="mr-auto"
            >
              Use current folder
            </Button>
          )}
          <Button
            color="primary"
            onPress={handleConfirm}
            isDisabled={!selectedFolder}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
