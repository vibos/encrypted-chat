import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ChatService } from '../../chat.service';

interface LocalMessage {
  text: string;
  type: 'sent' | 'received';
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    MatButton,
    MatCardModule,
    MatFormField,
    MatInput,
    MatLabel,
    TextFieldModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ChatComponent implements OnInit {
  public activeChat: string | undefined;
  public message: string | undefined;
  public messages: LocalMessage[] = [];

  constructor(
    private chatService: ChatService,
    private router: Router,
  ) {
    this.activeChat = this.chatService.activeChat;
  }

  ngOnInit() {
    if (!this.activeChat) {
      void this.router.navigate(['/', 'dialogs']);
    }

    this.chatService.messages$.pipe(
    ).subscribe((message) => {
      if (message.data['sender'] === this.activeChat || message.data['recipient'] === this.activeChat) {
        this.messages.push({
          type: message.type,
          text: message.data['content'] as string,
        });
      }
    });
  }

  onSendMessage(message: string | undefined): void {
    if (!this.activeChat || !message) {
      return;
    }

    void this.chatService.sendMessage(this.activeChat, message);

    this.message = '';
  }

  trackMessagesFn(index: number, message: LocalMessage): string {
    return `${index}`;
  }

}
