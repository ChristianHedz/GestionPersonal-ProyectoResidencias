
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const isAdminGuard: CanActivateFn = (route,state) => {

  const authService = inject( AuthService );
  const router = inject( Router );
  
  if(authService.isAdmin()) return true;

  router.navigateByUrl('admin/info');
  return false;

};
