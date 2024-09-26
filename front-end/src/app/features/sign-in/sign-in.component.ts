import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatFormField, MatInput, MatLabel, RouterLink, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {

  public readonly form: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.form = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  async onSignIn(): Promise<void> {
    if (!this.form.valid) {
      return;
    }

    try {
      await this.authService.signIn(this.form.value.userName, this.form.value.password);
      this.router.navigate(['/', 'dialogs']);
    } catch (err: any) {
      alert(err.error.message);
    }
  }

}
