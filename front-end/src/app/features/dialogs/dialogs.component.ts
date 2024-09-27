import { ChangeDetectionStrategy, Component } from '@angular/core';
import {MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from '@angular/router';

import { ChatService } from '../../chat.service';

@Component({
  selector: 'app-dialogs',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './dialogs.component.html',
  styleUrl: './dialogs.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DialogsComponent {

  public userName?: string;

  constructor(
    private chatService: ChatService,
    private router: Router,
  ) {
  }

  onStartChat(userName: string | undefined): void {
    if (!userName) {
      return;
    }

    this.chatService.startChat(userName).subscribe({
      next: () => {
        void this.router.navigate(['/', 'chat']);
      },
      error: (err) => {
        alert(err.error?.message);
      },
    });
  }

}
