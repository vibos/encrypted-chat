import { Routes } from '@angular/router';

import { DialogsComponent } from './features/dialogs/dialogs.component';
import { SignInComponent } from './features/sign-in/sign-in.component';
import { ChatComponent } from './features/chat/chat.component';
import {isSignedIn} from "./guards/is-signed-in.guard";
import {isNotSignedIn} from "./guards/is-not-signed-in.guard";

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dialogs',
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [isNotSignedIn],
  },
  {
    path: 'dialogs',
    component: DialogsComponent,
    canActivate: [isSignedIn],
  },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [isSignedIn],
  },
];
