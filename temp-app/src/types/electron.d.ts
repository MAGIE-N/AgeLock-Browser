declare namespace Electron {
    interface BrowserWindow {
        loadURL(url: string): Promise<void>;
        webContents: {
            send(channel: string, ...args: any[]): void;
        };
    }

    interface IpcMainEvent {
        reply(channel: string, ...args: any[]): void;
    }

    interface IpcRenderer {
        on(channel: string, listener: (...args: any[]) => void): void;
        once(channel: string, listener: (...args: any[]) => void): void;
        removeListener(channel: string, listener: (...args: any[]) => void): void;
    }
}

declare global {
    interface Window {
        electron: {
            onBlockedContent: (callback: (data: any) => void) => void;
            removeBlockedContentListener: () => void;
            verifyAge: (data: any) => Promise<any>;
            getStoredAge: () => Promise<any>;
        };
    }
}
