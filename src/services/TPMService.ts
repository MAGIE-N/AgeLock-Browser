/**
 * TPM Security Service for AgeLock
 * 
 * This service handles secure age verification using TPM 2.0/Secure Enclave
 * It ensures that age selection cannot be tampered with and provides
 * cryptographic verification of age settings.
 */

// Import required modules for TPM integration
const { ipcRenderer } = window.require('electron');

export interface TPMVerificationResult {
  success: boolean;
  ageRange?: string;
  error?: string;
}

class TPMService {
  private static instance: TPMService;
  private initialized: boolean = false;
  private deviceBinding: string | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): TPMService {
    if (!TPMService.instance) {
      TPMService.instance = new TPMService();
    }
    return TPMService.instance;
  }

  /**
   * Initialize the TPM security module
   * This creates a secure binding with the device's TPM
   */
  public async initialize(): Promise<boolean> {
    try {
      console.log('Initializing TPM Security module...');
      // Call the native TPM initialization function via IPC
      const result = await ipcRenderer.invoke('tpm:initialize');
      
      if (result && result.success) {
        this.initialized = true;
        this.deviceBinding = result.deviceBinding;
        console.log('TPM Security module initialized successfully');
        return true;
      } else {
        console.error('TPM initialization failed:', result?.error || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Error initializing TPM:', error);
      return false;
    }
  }

  /**
   * Store age range securely in TPM
   * @param ageRange The age range to store
   */
  public async storeAge(ageRange: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log(`Storing age range in TPM: ${ageRange}`);
      // Call the native TPM store function via IPC
      const result = await ipcRenderer.invoke('tpm:store-age', {
        ageRange,
        deviceBinding: this.deviceBinding
      });
      
      return result && result.success;
    } catch (error) {
      console.error('Error storing age in TPM:', error);
      return false;
    }
  }

  /**
   * Retrieve age range securely from TPM
   */
  public async getStoredAge(): Promise<{ ageRange: string | null }> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log('Retrieving age range from TPM...');
      // Call the native TPM retrieve function via IPC
      const result = await ipcRenderer.invoke('tpm:get-age', {
        deviceBinding: this.deviceBinding
      });
      
      if (result && result.success) {
        return { ageRange: result.ageRange };
      } else {
        console.warn('No age range found in TPM');
        return { ageRange: null };
      }
    } catch (error) {
      console.error('Error retrieving age from TPM:', error);
      return { ageRange: null };
    }
  }

  /**
   * Verify that the age range has not been tampered with
   * @param ageRange The age range to verify
   */
  public async verifyAge(ageRange: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log(`Verifying age range with TPM: ${ageRange}`);
      // Call the native TPM verify function via IPC
      const result = await ipcRenderer.invoke('tpm:verify-age', {
        ageRange,
        deviceBinding: this.deviceBinding
      });
      
      return result && result.success;
    } catch (error) {
      console.error('Error verifying age with TPM:', error);
      return false;
    }
  }

  /**
   * Reset the TPM secure storage
   * This will wipe all stored age data
   */
  public async resetSecureStorage(): Promise<boolean> {
    try {
      console.log('Resetting TPM secure storage...');
      // Call the native TPM reset function via IPC
      const result = await ipcRenderer.invoke('tpm:reset');
      
      return result && result.success;
    } catch (error) {
      console.error('Error resetting TPM secure storage:', error);
      return false;
    }
  }
}

export default TPMService.getInstance();
