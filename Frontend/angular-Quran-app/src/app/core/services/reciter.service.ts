import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Reciter {
  _id: string;
  name: string;
  bio?: string;
  image: string;
  styles: string[];
  followers: number;
  surahs: string[];
  recitations: string[];
  isVerified: boolean;
}

export interface ReciterResponse {
  reciters: Reciter[];
  page: number;
  pages: number;
  totalReciters: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReciterService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/reciters`;

  getReciters(page: number = 1, limit: number = 20): Observable<ReciterResponse> {
    return this.http.get<ReciterResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getTopReciters(limit: number = 6): Observable<Reciter[]> {
    return this.http.get<Reciter[]>(`${this.apiUrl}/top?limit=${limit}`);
  }

  getReciterById(id: string): Observable<Reciter> {
    return this.http.get<Reciter>(`${this.apiUrl}/${id}`);
  }

  getReciterTopRecitations(id: string, limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/top-recitations?limit=${limit}`);
  }

  searchReciters(query: string, limit: number = 5): Observable<ReciterResponse> {
    return this.http.get<ReciterResponse>(`${this.apiUrl}?search=${encodeURIComponent(query)}&limit=${limit}&page=1`);
  }
}

