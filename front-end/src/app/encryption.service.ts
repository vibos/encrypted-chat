import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class EncryptionService {

  async generateRsaKeyPair(): Promise<{ publicKey: string, privateKey: string }> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: { name: 'SHA-256' },
      },
      true,
      ['encrypt', 'decrypt']
    );

    const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicKey: this.arrayBufferToBase64(publicKey),
      privateKey: this.arrayBufferToBase64(privateKey)
    };
  }

  async generateAESKey(): Promise<string> {
    // Generate an AES-128 key
    const key = await window.crypto.subtle.generateKey(
      {
        name: "AES-CBC", // Or "AES-GCM" for another mode
        length: 128, // AES-128 uses a 128-bit key
      },
      true, // Whether the key is extractable (can be exported)
      ["encrypt", "decrypt"] // Key usage
    );

    // Export the key to a usable format (e.g., raw)
    const rawKey = await window.crypto.subtle.exportKey("raw", key);

    // Convert to a hex string or base64 if needed
    const keyArray = new Uint8Array(rawKey);
    const hexKey = Array.from(keyArray)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    return hexKey;
  }

  async encryptWithRsaBase64Key(base64PublicKey: string, data: string): Promise<string> {
    // Convert the Base64 public key to an ArrayBuffer
    const publicKey = await this.importRsaPublicKeyFromBase64(base64PublicKey);

    // Encode the data to be encrypted
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    // Encrypt the data using the RSA public key
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      encodedData,
    );

    return this.arrayBufferToBase64(encryptedData);
  }

  async encryptWithHexAesKey(hexKey: string, data: string): Promise<{ encryptedData: string, iv: string }> {
    // Convert hex key to CryptoKey
    const aesKey = await this.importAesKeyFromHex(hexKey);

    // Encode the data to be encrypted
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    // Generate a random initialization vector (IV)
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV for AES-GCM

    // Encrypt the data using AES-GCM
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv, // The IV used for encryption
      },
      aesKey, // AES key imported from hex
      encodedData // Data to encrypt
    );

    // Convert the encrypted data and IV to hex strings
    const encryptedDataHex = this.arrayBufferToHex(encryptedData);
    const ivHex = this.arrayBufferToHex(iv.buffer);

    return {encryptedData: encryptedDataHex, iv: ivHex};
  }

  async decryptWithRsaBase64Key(base64PrivateKey: string, encryptedDataBase64: string): Promise<string> {
    // Convert the Base64 private key to a CryptoKey
    const privateKey = await this.importRsaPrivateKeyFromBase64(base64PrivateKey);

    // Convert the encrypted Base64 string back to an ArrayBuffer
    const encryptedData = this.base64ToArrayBuffer(encryptedDataBase64);

    // Decrypt the data using the RSA private key
    const decryptedData = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encryptedData // Encrypted data (as an ArrayBuffer)
    );

    // Convert the decrypted ArrayBuffer back to a string
    return new TextDecoder().decode(decryptedData);
  }

  async decryptWithAesHexKey(hexKey: string, encryptedDataHex: string, ivHex: string): Promise<string> {
    // Convert hex key to CryptoKey
    const aesKey = await this.importAesKeyFromHex(hexKey);

    // Convert the encrypted hex data and IV to ArrayBuffers
    const encryptedData = this.hexToArrayBuffer(encryptedDataHex);
    const iv = this.hexToArrayBuffer(ivHex);

    // Decrypt the data using AES-GCM
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv, // The IV used for decryption
      },
      aesKey, // AES key imported from hex
      encryptedData // Encrypted data (as an ArrayBuffer)
    );

    // Convert the decrypted ArrayBuffer back to a string
    return new TextDecoder().decode(decryptedData);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(binary);
  }

  // Helper function to convert ArrayBuffer to hex string
  private arrayBufferToHex(buffer: ArrayBuffer): string {
    const byteArray = new Uint8Array(buffer);
    return Array.from(byteArray).map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private async importRsaPrivateKeyFromBase64(base64Key: string): Promise<CryptoKey> {
    // Decode the Base64-encoded string into an ArrayBuffer
    const binaryDerString = atob(base64Key);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    // Import the RSA private key
    return window.crypto.subtle.importKey(
      "pkcs8", // Private key format
      binaryDer.buffer, // Key data
      {
        name: "RSA-OAEP",
        hash: {name: "SHA-256"}, // Hashing algorithm for RSA-OAEP
      },
      true, // Key is extractable
      ["decrypt"] // Key usage
    );
  }

  // Helper function to convert Base64 public key to CryptoKey
  private importRsaPublicKeyFromBase64(base64Key: string): Promise<CryptoKey> {
    // Decode the Base64-encoded string into an ArrayBuffer
    const binaryDerString = atob(base64Key);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    // Import the RSA public key
    return window.crypto.subtle.importKey(
      "spki", // Public key format
      binaryDer.buffer, // Key data
      {
        name: "RSA-OAEP",
        hash: {name: "SHA-256"}, // Hashing algorithm for RSA-OAEP
      },
      true, // Key is extractable
      ["encrypt"] // Key usage
    );
  }

  // Helper function to convert hex key to CryptoKey
  private async importAesKeyFromHex(hexKey: string): Promise<CryptoKey> {
    // Convert hex string to an ArrayBuffer
    const keyBytes = new Uint8Array(hexKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    // Import the ArrayBuffer as a CryptoKey
    return await window.crypto.subtle.importKey(
      "raw", // Raw format of the key
      keyBytes.buffer, // Key in ArrayBuffer format
      {
        name: "AES-GCM", // AES-GCM algorithm
      },
      true, // Whether the key is extractable (set to false if not needed)
      ["encrypt", "decrypt"] // Key usages
    );
  }

  // Helper function to convert a hex string to an ArrayBuffer
  private hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    return bytes.buffer;
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
