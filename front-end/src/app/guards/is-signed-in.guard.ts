import {ActivatedRouteSnapshot, CanActivateFn, Router} from "@angular/router";
import { inject } from '@angular/core';

import { AuthService } from '../auth.service';

export const isSignedIn: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  if (!inject(AuthService).isSignedIn) {
    inject(Router).navigate(['/', 'sign-in']);
  }

  return true;
};
