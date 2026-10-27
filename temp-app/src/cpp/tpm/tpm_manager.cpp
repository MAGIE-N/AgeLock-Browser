#include <tpm_manager.h>
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <openssl/aes.h>
#include <string>
#include <vector>
#include <napi.h>

using namespace Napi;

TpmManager::TpmManager() {
    initialized = false;
    tpmKey = nullptr;
    sessionKey = nullptr;
}

bool TpmManager::Initialize() {
    try {
        // Initialize TPM2-OpenSSL context
        if (!InitializeTpm()) {
            return false;
        }

        // Generate TPM key
        tpmKey = GenerateTpmKey();
        if (!tpmKey) {
            return false;
        }

        // Generate session key
        sessionKey = GenerateSessionKey();
        if (!sessionKey) {
            return false;
        }

        // Bind session key to TPM
        if (!BindKeyToTpm(sessionKey, tpmKey)) {
            return false;
        }

        initialized = true;
        return true;
    } catch (const std::exception& e) {
        std::cerr << "TPM initialization error: " << e.what() << std::endl;
        return false;
    }
}

bool TpmManager::VerifyAge(const std::string& ageData) {
    if (!initialized) {
        throw std::runtime_error("TPM not initialized");
    }

    try {
        // Encrypt age data
        std::string encryptedData = EncryptData(ageData);
        
        // Verify with TPM
        return VerifyWithTpm(encryptedData, tpmKey);
    } catch (const std::exception& e) {
        std::cerr << "Age verification error: " << e.what() << std::endl;
        return false;
    }
}

std::string TpmManager::EncryptData(const std::string& data) {
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    if (!ctx) {
        throw std::runtime_error("Failed to create cipher context");
    }

    if (EVP_EncryptInit_ex(ctx, EVP_aes_256_gcm(), nullptr, sessionKey, nullptr) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        throw std::runtime_error("Failed to initialize encryption");
    }

    std::vector<uint8_t> iv(EVP_CIPHER_iv_length(EVP_aes_256_gcm()));
    if (RAND_bytes(iv.data(), iv.size()) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        throw std::runtime_error("Failed to generate IV");
    }

    if (EVP_EncryptInit_ex(ctx, nullptr, nullptr, nullptr, iv.data()) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        throw std::runtime_error("Failed to set IV");
    }

    std::vector<uint8_t> ciphertext(data.size() + EVP_MAX_BLOCK_LENGTH);
    int len;
    
    if (EVP_EncryptUpdate(ctx, ciphertext.data(), &len, 
        reinterpret_cast<const uint8_t*>(data.data()), data.size()) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        throw std::runtime_error("Encryption failed");
    }

    int ciphertextLen = len;
    if (EVP_EncryptFinal_ex(ctx, ciphertext.data() + len, &len) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        throw std::runtime_error("Final encryption failed");
    }

    ciphertextLen += len;
    ciphertext.resize(ciphertextLen);

    // Get authentication tag
    std::vector<uint8_t> tag(EVP_GCM_TLS_TAG_LEN);
    EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_GET_TAG, EVP_GCM_TLS_TAG_LEN, tag.data());

    EVP_CIPHER_CTX_free(ctx);

    // Combine IV, ciphertext, and tag
    std::string result;
    result.append(reinterpret_cast<const char*>(iv.data()), iv.size());
    result.append(reinterpret_cast<const char*>(ciphertext.data()), ciphertext.size());
    result.append(reinterpret_cast<const char*>(tag.data()), tag.size());

    return result;
}

bool TpmManager::InitializeTpm() {
    // Initialize TPM2-OpenSSL engine
    ENGINE* tpm_engine = ENGINE_by_id("tpm2tss");
    if (!tpm_engine) {
        return false;
    }

    if (!ENGINE_init(tpm_engine)) {
        ENGINE_free(tpm_engine);
        return false;
    }

    // Store engine for later use
    tpmEngine = tpm_engine;
    return true;
}

std::vector<uint8_t> TpmManager::GenerateTpmKey() {
    EVP_PKEY_CTX* ctx = EVP_PKEY_CTX_new_id(EVP_PKEY_RSA, tpmEngine);
    if (!ctx) {
        return std::vector<uint8_t>();
    }

    if (EVP_PKEY_keygen_init(ctx) <= 0) {
        EVP_PKEY_CTX_free(ctx);
        return std::vector<uint8_t>();
    }

    if (EVP_PKEY_CTX_set_rsa_keygen_bits(ctx, 2048) <= 0) {
        EVP_PKEY_CTX_free(ctx);
        return std::vector<uint8_t>();
    }

    EVP_PKEY* key = nullptr;
    if (EVP_PKEY_keygen(ctx, &key) <= 0) {
        EVP_PKEY_CTX_free(ctx);
        return std::vector<uint8_t>();
    }

    EVP_PKEY_CTX_free(ctx);
    
    // Convert to raw bytes
    std::vector<uint8_t> keyBytes;
    size_t keyLen;
    if (EVP_PKEY_get_raw_public_key(key, nullptr, &keyLen) <= 0) {
        EVP_PKEY_free(key);
        return std::vector<uint8_t>();
    }

    keyBytes.resize(keyLen);
    if (EVP_PKEY_get_raw_public_key(key, keyBytes.data(), &keyLen) <= 0) {
        EVP_PKEY_free(key);
        return std::vector<uint8_t>();
    }

    EVP_PKEY_free(key);
    return keyBytes;
}

std::vector<uint8_t> TpmManager::GenerateSessionKey() {
    std::vector<uint8_t> key(32); // 256-bit AES key
    if (RAND_bytes(key.data(), key.size()) != 1) {
        return std::vector<uint8_t>();
    }
    return key;
}

bool TpmManager::BindKeyToTpm(const std::vector<uint8_t>& key, const std::vector<uint8_t>& tpmKey) {
    // Create TPM policy
    TPM2B_DIGEST policyDigest = {0};
    if (!CreatePolicyDigest(tpmKey, policyDigest)) {
        return false;
    }

    // Bind key using TPM2_Quote
    TPM2B_DATA quoteData = {0};
    if (!CreateQuoteData(policyDigest, quoteData)) {
        return false;
    }

    // Store binding in TPM
    return StoreBinding(key, quoteData);
}

bool TpmManager::VerifyWithTpm(const std::string& data, const std::vector<uint8_t>& tpmKey) {
    // Verify using TPM2_VerifyQuote
    // This would involve:
    // 1. Extracting IV, ciphertext, and tag from data
    // 2. Decrypting using TPM-bound key
    // 3. Verifying the authentication tag
    // Implementation would use TPM2_Quote and TPM2_VerifyQuote
    return true; // Placeholder
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("initialize", Napi::Function::New(env, TpmManager::Initialize));
    exports.Set("verifyAge", Napi::Function::New(env, TpmManager::VerifyAge));
    return exports;
}

NODE_API_MODULE(tpm_manager, Init)
