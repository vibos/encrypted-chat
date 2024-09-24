import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private signedIn: boolean = false;

  get isSignedIn(): boolean {
    return this.signedIn;
  }

  signIn() {
    this.signedIn = true;
  }

}
