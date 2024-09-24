import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import {AuthService} from "../../auth.service";

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatFormField, MatInput, MatLabel, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {

  constructor(private authService: AuthService) {
  }

  onSignIn(): void {
    this.authService.signIn();
  }

}
