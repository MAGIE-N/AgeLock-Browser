// Extend the Window interface to include the electron API
interface ElectronAPI {
  getStoredAge: () => Promise<{ ageRange: string }>;
  onBlockedContent: (callback: (data: any) => void) => void;
  removeBlockedContentListener: () => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
