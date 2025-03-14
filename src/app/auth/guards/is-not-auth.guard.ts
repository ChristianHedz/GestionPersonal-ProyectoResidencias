import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { AuthStatus } from '../interfaces/authStatus.enum';

export const isNotAuthGuard: CanActivateFn = (route,state) => {

  const authService = inject( AuthService );
  const router = inject( Router );

  if(authService.authStatus() === AuthStatus.authenticated){
    router.navigateByUrl('/inicio');
    return false;
  }
  return true;
}
