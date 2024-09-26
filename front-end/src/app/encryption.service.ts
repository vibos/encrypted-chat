import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EncryptionService {

  async generateRSAKeyPair(): Promise<{ publicKey: string, privateKey: string }> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: { name: 'SHA-256' }
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

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(binary);
  }

}
