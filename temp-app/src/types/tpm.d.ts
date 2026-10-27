declare namespace TPM {
    interface AgeVerificationData {
        age: string;
        timestamp: string;
    }

    interface TPMManager {
        Initialize(): Promise<boolean>;
        VerifyAge(data: AgeVerificationData): Promise<boolean>;
        EncryptData(content: string): Promise<string>;
        GetStoredAge(): Promise<{ ageRange: string } | null>;
    }
}

declare global {
    interface Window {
        tpm: TPM.TPMManager;
    }
}
