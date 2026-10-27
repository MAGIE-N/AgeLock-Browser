#pragma once

#include <napi.h>
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <openssl/aes.h>
#include <string>
#include <vector>
#include <memory>

using namespace Napi;

class TpmManager : public Napi::ObjectWrap<TpmManager> {
public:
    static void Init(Napi::Env env, Napi::Object exports);
    TpmManager(const CallbackInfo& info);
    
    static Napi::Object CreateInstance(Napi::Env env);

    Napi::Value Initialize(const CallbackInfo& info);
    Napi::Value VerifyAge(const CallbackInfo& info);

private:
    bool initialized;
    std::vector<uint8_t> tpmKey;
    std::vector<uint8_t> sessionKey;
    ENGINE* tpmEngine;

    bool InitializeTpm();
    std::vector<uint8_t> GenerateTpmKey();
    std::vector<uint8_t> GenerateSessionKey();
    bool BindKeyToTpm(const std::vector<uint8_t>& key, const std::vector<uint8_t>& tpmKey);
    bool VerifyWithTpm(const std::string& data, const std::vector<uint8_t>& tpmKey);
    std::string EncryptData(const std::string& data);
    bool CreatePolicyDigest(const std::vector<uint8_t>& tpmKey, TPM2B_DIGEST& digest);
    bool CreateQuoteData(const TPM2B_DIGEST& digest, TPM2B_DATA& quoteData);
    bool StoreBinding(const std::vector<uint8_t>& key, const TPM2B_DATA& quoteData);
};
