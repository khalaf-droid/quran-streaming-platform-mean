import { Injectable, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  profilePicture?: string;
  token: string;
  favoriteRecitations?: any[];
  favoriteSurahs?: any[];
  followedReciters?: any[];
  followedCollections?: any[];
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  profilePicture?: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/users`;
  private isBrowser: boolean;

  currentUser = signal<User | null>(null);
  isLoggedIn = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.isAdmin === true);

  favoriteRecitationIds = computed(() => {
    const user = this.currentUser();
    if (!user || !user.favoriteRecitations) return [];
    return user.favoriteRecitations.map(r => typeof r === 'string' ? r : r._id);
  });

  followedReciterIds = computed(() => {
    const user = this.currentUser();
    if (!user || !user.followedReciters) return [];
    return user.followedReciters.map(r => typeof r === 'string' ? r : r._id);
  });

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    if (this.isBrowser) {
      const stored = localStorage.getItem('quranapp_user');
      if (stored) {
        try {
          this.currentUser.set(JSON.parse(stored));
          // Re-fetch profile to get fresh arrays of favorites/follows
          this.refreshProfile();
        } catch {
          localStorage.removeItem('quranapp_user');
        }
      }
    }
  }

  refreshProfile(): void {
    const token = this.getToken();
    if (!token) return;
    this.getProfile().subscribe({
      next: (profile) => {
        // profile contains the populated arrays
        this.updateCurrentUserPartial(profile);
      },
      error: () => {
        // If profile fetch fails (e.g. token expired), we might want to log them out
        // For now, just silently fail or log
        console.warn('Failed to refresh profile, token might be invalid.');
      }
    });
  }

  private updateCurrentUserPartial(partialData: Partial<User>) {
    const current = this.currentUser();
    if (current) {
      const updated = { ...current, ...partialData };
      this.currentUser.set(updated);
      this.saveUserToStorage(updated);
    }
  }

  private saveUserToStorage(user: User): void {
    if (this.isBrowser) {
      localStorage.setItem('quranapp_user', JSON.stringify(user));
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        const user: User = { ...res };
        this.currentUser.set(user);
        this.saveUserToStorage(user);
        this.refreshProfile(); // Get full profile with favorites
      })
    );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password }).pipe(
      tap(res => {
        const user: User = { ...res };
        this.currentUser.set(user);
        this.saveUserToStorage(user);
      })
    );
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }

  toggleFavoriteRecitation(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/favorite-recitation/${id}`, {}).pipe(
      tap((res: any) => {
        if (res.favoriteRecitations) {
          this.updateCurrentUserPartial({ favoriteRecitations: res.favoriteRecitations });
        }
      })
    );
  }

  toggleFollowReciter(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/follow-reciter/${id}`, {}).pipe(
      tap((res: any) => {
        if (res.followedReciters) {
          this.updateCurrentUserPartial({ followedReciters: res.followedReciters });
        }
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    if (this.isBrowser) {
      localStorage.removeItem('quranapp_user');
    }
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.currentUser()?.token || null;
  }
}
