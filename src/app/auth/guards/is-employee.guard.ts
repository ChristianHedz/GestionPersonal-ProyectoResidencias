import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthStatus } from '../interfaces/authStatus.enum';
import { filter, map, take } from 'rxjs';

export const isEmployeeGuard: CanActivateFn = (route,state) => {

  const authService = inject( AuthService );
  const router = inject( Router );
  const authStatus$ = toObservable(authService.authStatus);

  return authStatus$.pipe(
    filter( status => status !== AuthStatus.checking ),
    take(1),
    map( status => {
      if ( status === AuthStatus.authenticated && authService.isEmployee() ) {
        return true;
      }
      router.navigateByUrl('/login');
      return false;
    })
  );

};
