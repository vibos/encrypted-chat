import { ChangeDetectionStrategy, Component } from '@angular/core';
import {MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import {RouterLink} from "@angular/router";

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogsComponent {

}
