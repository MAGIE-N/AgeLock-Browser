// Mock TPM Service - Pure JavaScript implementation
class MockTPMService {
    constructor() {
        this.initialized = false;
        this.storage = new Map();
        this.deviceBinding = null;
    }

    async initialize() {
        this.initialized = true;
        return true;
    }

    async storeAge(ageRange) {
        if (!this.initialized) await this.initialize();
        this.storage.set('ageRange', ageRange);
        return true;
    }

    async getStoredAge() {
        if (!this.initialized) await this.initialize();
        return this.storage.get('ageRange') || null; // Return null if not set
    }
    
    async verifyAge(ageRange) {
        if (!this.initialized) await this.initialize();
        const storedAge = this.storage.get('ageRange');
        
        // If no age is stored, verification fails
        if (!storedAge) return false;
        
        // Check if the provided age range matches the stored one
        return storedAge === ageRange;
    }
    
    async wipeSession() {
        // Clear all stored data
        this.storage.clear();
        this.deviceBinding = null;
        console.log('TPM session wiped');
        return true;
    }

    // Simulate TPM binding by using Web Crypto API
    async bindToDevice(data) {
        if (!this.initialized) await this.initialize();
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode('mock-device-key'),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign', 'verify']
        );
        
        const signature = await crypto.subtle.sign(
            'HMAC',
            keyMaterial,
            encoder.encode(JSON.stringify(data))
        );
        
        return Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
}

// Export a singleton instance
export const mockTPMService = new MockTPMService();

export default {
    initialize: () => mockTPMService.initialize(),
    storeAge: (ageRange) => mockTPMService.storeAge(ageRange),
    getStoredAge: () => mockTPMService.getStoredAge(),
    verifyAge: (ageRange) => mockTPMService.verifyAge(ageRange),
    wipeSession: () => mockTPMService.wipeSession(),
    bindToDevice: (data) => mockTPMService.bindToDevice(data)
};
