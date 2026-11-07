import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HomepageService } from '../homepage.service';

@Component({
  selector: 'app-clubs',
  imports: [FormsModule],
  templateUrl: './clubs.html',
})
export class ClubsComponent {
  readonly homepage = inject(HomepageService);
  readonly formOpen = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  clubName = '';
  clubDescription = '';

  imageFor(id: string): string {
    const numericId = Number(id);
    const index = Number.isInteger(numericId)
      ? ((numericId % 10) + 10) % 10
      : [...String(id)].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 10;
    return `images/club${index + 1}.webp`;
  }

  openForm(): void {
    this.error.set('');
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.clubName = '';
    this.clubDescription = '';
    this.error.set('');
  }

  async create(): Promise<void> {
    const name = this.clubName.trim();
    const description = this.clubDescription.trim();
    if (this.busy()) {
      return;
    }
    if (!name) {
      this.error.set('Ohne Namen gibts keinen Club!');
      return;
    }
    if (name.length > 25 || description.length > 250) {
      this.error.set('Eingabe zu lang!');
      return;
    }

    this.busy.set(true);
    this.error.set('');
    try {
      await this.homepage.createClub(name, description);
      this.closeForm();
    } catch (error) {
      this.error.set(this.homepage.errorMessage(error));
    } finally {
      this.busy.set(false);
    }
  }
}
