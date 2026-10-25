import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  if (sessionStorage.getItem('token')) {
    return true;
  }

  window.location.replace('/public/html/loginPage.html');
  return false;
};
