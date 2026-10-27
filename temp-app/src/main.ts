import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { TpmManager } from './cpp/tpm/tpm_manager';
import ContentFilterService from './services/ContentFilterService';

interface AgeVerificationData {
  age: string;
  timestamp: string;
}

interface FilterContentData {
  url: string;
  content: string | HTMLImageElement | HTMLCanvasElement;
}

interface BlockedContentData {
  url: string;
  reason: string;
  explanation?: {
    prediction: {
      score: number;
      probability: number;
    };
    shapValues: number[];
  };
}

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(async () => {
  try {
    const tpmManager = new TpmManager();
    await tpmManager.Initialize();
    createWindow();
  } catch (error) {
    console.error('Error initializing TPM:', error);
    app.quit();
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle age verification
ipcMain.handle('verify-age', async (event, data: AgeVerificationData) => {
  try {
    const tpmManager = new TpmManager();
    return await tpmManager.verifyAge(data);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle content filtering
ipcMain.handle('filter-content', async (event, data: FilterContentData) => {
  try {
    return await ContentFilterService.filterContent(data.url, data.content);
  } catch (error) {
    return { blocked: false, reason: error.message };
  }
});

// Handle blocked content notifications
ipcMain.on('blocked-content', (event, data: BlockedContentData) => {
  mainWindow?.webContents.send('blocked-content', data);
});

// Content filtering service
async function filterContent(encryptedContent: string): Promise<any> {
    // TODO: Implement actual filtering service
    // This would typically involve:
    // 1. Decrypting content with TPM-bound key
    // 2. Sending to NLP service for text filtering
    // 3. Sending to NSFW.js for image filtering
    // 4. Returning blocking decision with SHAP explanations
    return {
        blocked: false,
        reason: '',
        explanation: null
    };
}
