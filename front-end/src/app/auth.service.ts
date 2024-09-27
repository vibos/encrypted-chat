import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

import { ApiService } from './api.service';
import { EncryptionService } from './encryption.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private signedIn: boolean = false;
  public token: string | undefined;
  public profile$ = new BehaviorSubject<Record<string, string> | null>(null);

  constructor(
    private apiService: ApiService,
    private encryptionService: EncryptionService,
    private storageService: StorageService,
  ) {
    const token = this.storageService.getItem('token');
    const privateKey = this.storageService.getItem('privateKey');

    if (!token || !privateKey) {
      return;
    }

    const decodedToken = jwtDecode(token);

    if (!decodedToken.exp || new Date(decodedToken.exp * 1000).getTime() < Date.now()) {
      return;
    }

    this.signInSuccess(token);
  }

  get isSignedIn(): boolean {
    return this.signedIn;
  }

  async signIn(userName: string, password: string): Promise<string> {
    let publicKey: string | undefined;
    let privateKey: string | undefined;

    if (!this.storageService.getItem('privateKey')) {
      const keyPair = await this.encryptionService.generateRsaKeyPair();
      publicKey = keyPair.publicKey;
      privateKey = keyPair.privateKey;
    }

    return firstValueFrom(this.apiService.signIn(userName, password, publicKey).pipe(
      tap((token) => {
        // Store privateKey if it was generated
        if (privateKey) {
          this.storageService.setItem('privateKey', privateKey);
        }

        this.storageService.setItem('token', token);
        this.signInSuccess(token);
      }),
    ));
  }

  private signInSuccess(token: string): void {
    const decodedToken = jwtDecode(token);
    this.token = token;
    this.signedIn = true;
    this.profile$.next(decodedToken as Record<string, string>);
  }

}
