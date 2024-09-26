import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from "@angular/common";
import { MatToolbarModule } from '@angular/material/toolbar';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(
    public authService: AuthService,
  ) {
  }
}
