import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Surah {
  _id: string;
  title: string;
  titleArabic: string;
  surahNumber: number;
  revelationType: string;
  numberOfAyahs: number;
  juz: number;
  coverImage?: string;
  tafsirText?: string;
  description?: string;
}

export interface SurahResponse {
  surahs: Surah[];
  page: number;
  pages: number;
  totalSurahs: number;
}

@Injectable({
  providedIn: 'root'
})
export class SurahService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/surahs`;

  getSurahs(page: number = 1, limit: number = 114, search?: string, revelationType?: string): Observable<SurahResponse> {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (revelationType) url += `&revelationType=${revelationType}`;
    return this.http.get<SurahResponse>(url);
  }

  searchSurahs(query: string, limit: number = 5): Observable<SurahResponse> {
    return this.http.get<SurahResponse>(`${this.apiUrl}?search=${encodeURIComponent(query)}&limit=${limit}&page=1`);
  }

  getSurahById(id: string): Observable<Surah> {
    return this.http.get<Surah>(`${this.apiUrl}/${id}`);
  }
}
