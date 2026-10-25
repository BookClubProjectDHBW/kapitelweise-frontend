import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { ClubsComponent } from './clubs/clubs';
import { InvitationsComponent } from './invitations/invitations';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'clubs' },
  { path: 'clubs', component: ClubsComponent, canActivate: [authGuard] },
  { path: 'einladungen', component: InvitationsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'clubs' },
];
