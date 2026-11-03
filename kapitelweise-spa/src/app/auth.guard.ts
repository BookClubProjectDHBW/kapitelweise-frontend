import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  // Offline ist die Login-Seite nicht erreichbar, die Homepage zeigt dann den Offline-Cache.
  if (sessionStorage.getItem('token') || !navigator.onLine) {
    return true;
  }

  window.location.replace('/public/html/loginPage.html');
  return false;
};
