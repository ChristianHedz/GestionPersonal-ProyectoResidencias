import { CanActivateFn, Router } from '@angular/router';
import { AuthStatus } from '../interfaces/authStatus.enum';
import { AuthService } from '../service/auth.service';
import { inject } from '@angular/core';


export const isAuthGuard: CanActivateFn = (route,state) => {

  const authService = inject( AuthService );
  const router = inject( Router );

  if(authService.authStatus() === AuthStatus.authenticated){
    return true;
  }

  router.navigateByUrl('/login');
  return false;
};
