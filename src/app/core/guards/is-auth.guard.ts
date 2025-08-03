import { CanActivateFn, Router } from '@angular/router';
import { AuthStatus } from '../models/auth/authStatus.enum';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';


export const isAuthGuard: CanActivateFn = (route,state) => {

  const authService = inject( AuthService );
  const router = inject( Router );
  const authStatus$ = toObservable(authService.authStatus);

  return authStatus$.pipe(
    filter( status => status !== AuthStatus.checking ),
    take(1), 
    map( status => {
      if ( status === AuthStatus.authenticated ) {
        return true;
      }

      router.navigateByUrl('/auth/login');
      return false;
    })
  );
};
