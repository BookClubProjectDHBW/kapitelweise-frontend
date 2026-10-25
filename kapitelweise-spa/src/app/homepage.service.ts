import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface Club {
  id: string;
  name: string;
  description: string | null;
}

export interface Invitation {
  id: string;
  bookclub: Club;
}

interface Member {
  id: string;
  name: string;
  membership: Club[];
  invitationPending: Invitation[];
}

interface GraphqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

const HOMEPAGE_QUERY = `
  query {
    member {
      id
      name
      membership { id name description }
      invitationPending { id bookclub { id name description } }
    }
  }
`;

const CREATE_CLUB_MUTATION = `
  mutation CreateClub($input: BookClubInput!) {
    createNewBookClub(bookClubInput: $input) { id name description }
  }
`;

const RESPOND_INVITATION_MUTATION = `
  mutation Respond($input: InvitationInput!) {
    responseInvitation(invitationInput: $input) { id name description }
  }
`;

@Injectable({ providedIn: 'root' })
export class HomepageService {
  private readonly http = inject(HttpClient);
  private readonly graphqlUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:8383/graphql'
    : 'https://kapitelweise-graphql-f85172125d1d.herokuapp.com/graphql';

  readonly username = signal('');
  readonly clubs = signal<Club[]>([]);
  readonly invitations = signal<Invitation[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  private loaded = false;

  private async request<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const token = sessionStorage.getItem('token');

    if (!token) {
      window.location.replace('/public/html/loginPage.html');
      throw new Error('Bitte melde dich an.');
    }

    let response: GraphqlResponse<T>;

    try {
      response = await firstValueFrom(this.http.post<GraphqlResponse<T>>(
        this.graphqlUrl,
        { query, variables },
        { headers: { Authorization: `Bearer ${token}` } },
      ));
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          sessionStorage.removeItem('token');
          window.location.replace('/public/html/loginPage.html');
          throw new Error('Deine Anmeldung ist abgelaufen.');
        }
        const message = typeof error.error?.message === 'string'
          ? error.error.message
          : `HTTP-Fehler: ${error.status}`;
        throw new Error(message);
      }
      throw error;
    }

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }
    if (!response.data) {
      throw new Error('Das Backend hat keine Daten zurückgegeben.');
    }
    return response.data;
  }

  async load(): Promise<void> {
    if (this.loaded || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      const data = await this.request<{ member: Member | null }>(HOMEPAGE_QUERY);
      if (!data.member) {
        throw new Error('Mitgliedsdaten konnten nicht geladen werden.');
      }
      this.username.set(data.member.name);
      this.clubs.set(data.member.membership ?? []);
      this.invitations.set(data.member.invitationPending ?? []);
      this.loaded = true;
    } catch (error) {
      this.error.set(this.errorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async createClub(name: string, description: string): Promise<void> {
    const data = await this.request<{ createNewBookClub: Club }>(
      CREATE_CLUB_MUTATION, { input: { name, description } },
    );
    this.clubs.update(clubs => [...clubs, data.createNewBookClub]);
  }

  async respondToInvitation(invitationId: string, status: 'ACCEPTED' | 'DECLINED'): Promise<void> {
    const data = await this.request<{ responseInvitation: Club | null }>(
      RESPOND_INVITATION_MUTATION,
      { input: { invitationId: String(invitationId), status } },
    );

    this.invitations.update(invitations => invitations.filter(invitation => invitation.id !== invitationId));
    if (status === 'ACCEPTED' && data.responseInvitation) {
      const club = data.responseInvitation;
      this.clubs.update(clubs => clubs.some(existing => existing.id === club.id)
        ? clubs : [...clubs, club]);
    }
  }

  errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.';
  }
}
