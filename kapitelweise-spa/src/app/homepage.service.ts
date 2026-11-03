import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IndexedDBService } from './indexDBService';

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

const CACHE_KEY_MEMBER = 'cached_member_homepage';

class ConnectionError extends Error {}

@Injectable({ providedIn: 'root' })
export class HomepageService {
  private readonly http = inject(HttpClient);
  private readonly idbService = inject(IndexedDBService);

  private readonly graphqlUrl =
    window.location.hostname === 'localhost'
      ? 'http://localhost:8383/graphql'
      : 'https://kapitelweise-graphql-f85172125d1d.herokuapp.com/graphql';

  readonly username = signal('');
  readonly clubs = signal<Club[]>([]);
  readonly invitations = signal<Invitation[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  private loaded = false;
  private member: Member | null = null;

  private async request<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const token = sessionStorage.getItem('token');

    if (!token) {
      // Offline kann die Login-Seite nicht geladen werden, daher stattdessen auf den Cache zurückfallen.
      if (!navigator.onLine) {
        throw new ConnectionError('Du bist offline.');
      }
      window.location.replace('/public/html/loginPage.html');
      throw new Error('Bitte melde dich an.');
    }

    let response: GraphqlResponse<T>;

    try {
      response = await firstValueFrom(
        this.http.post<GraphqlResponse<T>>(
          this.graphqlUrl,
          { query, variables },
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0 || error.status === 504 || !navigator.onLine) {
          throw new ConnectionError('Keine Verbindung zum Server.');
        }
        if (error.status === 401) {
          sessionStorage.removeItem('token');
          window.location.replace('/public/html/loginPage.html');
          throw new Error('Deine Anmeldung ist abgelaufen.');
        }
        const message =
          typeof error.error?.message === 'string'
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
      this.applyMemberData(data.member);
      this.loaded = true;
      await this.persistCache();
    } catch (error) {
      const offline = !navigator.onLine;
      const cached = error instanceof ConnectionError || offline ? await this.readCache() : null;
      if (cached) {
        this.applyMemberData(cached);
        this.loaded = true;
        this.error.set(
          offline
            ? 'Offline-Modus: Daten aus lokalem Zwischenspeicher geladen.'
            : 'Server nicht erreichbar: Daten aus lokalem Zwischenspeicher geladen.',
        );
        if (offline) {
          window.addEventListener('online', () => this.reload(), { once: true });
        }
      } else {
        this.error.set(this.errorMessage(error));
      }
    } finally {
      this.loading.set(false);
    }
  }

  private reload(): void {
    this.loaded = false;
    void this.load();
  }

  async clearCache(): Promise<void> {
    try {
      await this.idbService.deleteData(CACHE_KEY_MEMBER);
    } catch (error) {
      console.error('Offline-Cache konnte nicht gelöscht werden:', error);
    }
  }

  private async readCache(): Promise<Member | null> {
    try {
      return await this.idbService.getCache<Member>(CACHE_KEY_MEMBER);
    } catch (error) {
      console.error('Offline-Cache konnte nicht gelesen werden:', error);
      return null;
    }
  }

  private async persistCache(): Promise<void> {
    if (!this.member) {
      return;
    }
    const member: Member = {
      ...this.member,
      membership: this.clubs(),
      invitationPending: this.invitations(),
    };
    try {
      await this.idbService.setCache(CACHE_KEY_MEMBER, member);
    } catch (error) {
      console.error('Offline-Cache konnte nicht gespeichert werden:', error);
    }
  }

  private applyMemberData(member: Member): void {
    this.member = member;
    this.username.set(member.name);
    this.clubs.set(member.membership ?? []);
    this.invitations.set(member.invitationPending ?? []);
  }

  async createClub(name: string, description: string): Promise<void> {
    const data = await this.request<{ createNewBookClub: Club }>(CREATE_CLUB_MUTATION, {
      input: { name, description },
    });
    this.clubs.update((clubs) => [...clubs, data.createNewBookClub]);
    await this.persistCache();
  }

  async respondToInvitation(invitationId: string, status: 'ACCEPTED' | 'DECLINED'): Promise<void> {
    const data = await this.request<{ responseInvitation: Club | null }>(
      RESPOND_INVITATION_MUTATION,
      { input: { invitationId: String(invitationId), status } },
    );

    this.invitations.update((invitations) =>
      invitations.filter((invitation) => invitation.id !== invitationId),
    );
    if (status === 'ACCEPTED' && data.responseInvitation) {
      const club = data.responseInvitation;
      this.clubs.update((clubs) =>
        clubs.some((existing) => existing.id === club.id) ? clubs : [...clubs, club],
      );
    }
    await this.persistCache();
  }

  errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.';
  }
}
