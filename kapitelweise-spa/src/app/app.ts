import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HomepageService } from './homepage.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly homepage = inject(HomepageService);

  constructor() {
    if (sessionStorage.getItem('token')) {
      void this.homepage.load();
    }
  }

  logout(): void {
    sessionStorage.removeItem('token');
    window.location.replace('/public/html/loginPage.html');
  }
}
