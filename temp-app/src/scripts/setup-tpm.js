const tpm = require('node-tpm2');
const crypto = require('crypto');

class TPMManager {
  constructor() {
    this.isInitialized = false;
    this.tpmHandle = null;
  }

  async initialize() {
    try {
      this.tpmHandle = await tpm.connect();
      if (!this.tpmHandle) {
        throw new Error('Failed to connect to TPM');
      }

      // Initialize PCR banks
      await this.tpmHandle.pcrExtend(0, crypto.randomBytes(32));
      this.isInitialized = true;
      console.log('TPM initialized successfully');
      return true;
    } catch (error) {
      console.error('TPM initialization error:', error);
      return false;
    }
  }

  async verifyAge(ageData) {
    if (!this.isInitialized) {
      throw new Error('TPM not initialized');
    }

    try {
      // Create a sealed object with age data
      const sealedData = await this.tpmHandle.seal({
        pcrs: [0],
        data: Buffer.from(JSON.stringify(ageData))
      });

      // Verify the sealed data
      const unsealedData = await this.tpmHandle.unseal(sealedData);
      const verified = JSON.parse(unsealedData.toString());

      // Verify timestamp is recent (within last 5 minutes)
      const isTimestampValid = (Date.now() - verified.timestamp) < 300000;

      return {
        success: isTimestampValid,
        data: verified
      };
    } catch (error) {
      console.error('Age verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async disconnect() {
    if (this.tpmHandle) {
      await this.tpmHandle.disconnect();
      this.isInitialized = false;
      console.log('TPM disconnected');
    }
  }
}

module.exports = new TPMManager(); 