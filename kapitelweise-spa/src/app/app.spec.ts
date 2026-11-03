import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { HomepageService } from './homepage.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the brand name', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('Kapitelweise');
  });

  it('should disable logout while offline', async () => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(HomepageService).online.set(false);
    await fixture.whenStable();
    const logout = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('#logoutButton');
    expect(logout?.disabled).toBe(true);
    expect(logout?.title).toBe('Offline nicht verfügbar');
  });
});
