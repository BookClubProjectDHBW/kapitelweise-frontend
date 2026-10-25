import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HomepageService, Invitation } from '../homepage.service';

@Component({
  selector: 'app-invitations',
  templateUrl: './invitations.html',
})
export class InvitationsComponent {
  readonly homepage = inject(HomepageService);
  private readonly router = inject(Router);
  readonly busyId = signal<string | null>(null);
  readonly error = signal('');

  async respond(invitation: Invitation, status: 'ACCEPTED' | 'DECLINED'): Promise<void> {
    if (this.busyId()) {
      return;
    }

    this.error.set('');
    this.busyId.set(invitation.id);

    try {
      await this.homepage.respondToInvitation(invitation.id, status);
      if (status === 'ACCEPTED') {
        await this.router.navigateByUrl('/clubs');
      }
    } catch (error) {
      this.error.set(this.homepage.errorMessage(error));
    } finally {
      this.busyId.set(null);
    }
  }
}
