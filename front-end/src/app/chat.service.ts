import { Injectable } from '@angular/core';
import { EMPTY, map, Observable, of, ReplaySubject, startWith, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ApiService } from './api.service';
import { EncryptionService } from './encryption.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { Message } from './features/chat/message.interface';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket!: WebSocket;
  private aesKeys = new Map<string, string>; // userName: AES key
  private rsaKeys = new Map<string, string>; // userName: RSA public key
  public activeChat: string | undefined;
  public status: string = 'Offline';
  public messages$ = new ReplaySubject<Message>();

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private encryptionService: EncryptionService,
    private storageService: StorageService,
    private matSnackBar: MatSnackBar,
    private router: Router,
  ) {
  }

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    this.socket = new WebSocket('ws://localhost:8080');

    this.socket.onopen = () => {
      this.socket.send(JSON.stringify({
        type: 'connect',
        token: this.authService.token,
      }));

      this.status = 'Online';
    };

    this.socket.onmessage = async (message) => {
      const parsedMessage = JSON.parse(message.data);

      if (parsedMessage.type === 'message') {
        if (parsedMessage.aes) {
          const aes = await this.encryptionService.decryptWithRsaBase64Key(this.storageService.getItem('privateKey') as string, parsedMessage.aes);
          this.aesKeys.set(parsedMessage.sender, aes);
        }

        this.messages$.next({
          type: 'received',
          data: {
            ...parsedMessage,
            content: await this.encryptionService.decryptWithAesHexKey(this.aesKeys.get(parsedMessage.sender) as string, parsedMessage.content, parsedMessage.iv),
          }
        });

        if (parsedMessage.sender !== this.activeChat) {
          const shackRef = this.matSnackBar.open(`Нове повідомлення від ${parsedMessage.sender}`, 'Перейти');

          shackRef.onAction().subscribe(() => {
            this.startChat(parsedMessage.sender).subscribe(() => {
              this.router.navigate(['/', 'chat']);
            });
          });
        }
      }
    };

    this.socket.onclose = () => {
      console.log('Disconnected from chat');
      this.status = 'Offline';
    }
  }

  startChat(userName: string): Observable<void> {
    const token = this.authService.token as string;

    if (this.aesKeys.get(userName)) {
      this.activeChat = userName;

      return of(EMPTY).pipe(
        startWith(null),
        map(() => { }),
      );
    }

    // Get RSA key for userName
    return this.apiService.startChat(userName, token).pipe(
      tap(async (rsaPublicKey) => {
        this.activeChat = userName;

        // Generate AES Key
        const aesKey = await this.encryptionService.generateAESKey();

        // store AES key for the chat
        this.aesKeys.set(userName, aesKey);
        this.rsaKeys.set(userName, rsaPublicKey);
      }),
      map(() => { }),
    );
  }

  async sendMessage(recipient: string, content: string) {
    const token = this.authService.token;
    const aes: string = this.aesKeys.get(recipient) as string;
    const rsaPublicKey: string = this.rsaKeys.get(recipient) as string;
    let encryptedAes: string | undefined;

    if (!aes) {
      throw new Error(`No AES key`);
    }

    if (rsaPublicKey) {
      encryptedAes = await this.encryptionService.encryptWithRsaBase64Key(rsaPublicKey, aes);
    }

    const { encryptedData, iv } = await this.encryptionService.encryptWithHexAesKey(aes, content);

    const message = JSON.stringify({
      type: 'message',
      token,
      recipient,
      content: encryptedData,
      iv,
      aes: encryptedAes,
    });

    this.messages$.next({
      type: 'sent',
      data: {
        recipient,
        content,
      }
    });

    this.socket.send(message);
  }
}
