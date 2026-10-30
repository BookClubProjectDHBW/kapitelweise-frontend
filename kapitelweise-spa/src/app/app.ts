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
    if (sessionStorage.getItem('token') || !navigator.onLine) {
      void this.homepage.load();
    }
  }

  async logout(): Promise<void> {
    sessionStorage.removeItem('token');
    await this.homepage.clearCache();
    window.location.replace('/public/html/loginPage.html');
  }
}
