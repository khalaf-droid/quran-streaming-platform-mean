import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Recitation {
  _id: string;
  title: string;
  reciter: any;
  surah?: any;
  duration: number;
  audioUrl: string;
  coverImage: string;
  style?: string;
  tafsir?: string;
  plays: number;
  likes: number;
  featuredReciters: any[];
  formattedDuration?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecitationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/recitations`;

  getTopRecitations(limit: number = 6): Observable<Recitation[]> {
    return this.http.get<Recitation[]>(`${this.apiUrl}/top?limit=${limit}`);
  }

  getNewReleases(limit: number = 8): Observable<Recitation[]> {
    return this.http.get<Recitation[]>(`${this.apiUrl}/new-releases?limit=${limit}`);
  }
}
