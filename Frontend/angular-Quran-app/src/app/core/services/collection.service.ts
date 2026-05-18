import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Collection {
  _id: string;
  name: string;
  description: string;
  creator: any;
  coverImage?: string;
  recitations: any[];
  collaborators: any[];
  isPublic: boolean;
  followers: number;
  createdAt: string;
}

export interface CollectionResponse {
  collections: Collection[];
  page: number;
  pages: number;
  totalCollections: number;
}

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/collections`;

  getCollections(page: number = 1, limit: number = 20): Observable<CollectionResponse> {
    return this.http.get<CollectionResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getFeaturedCollections(limit: number = 6): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.apiUrl}/featured?limit=${limit}`);
  }

  getCollectionById(id: string): Observable<Collection> {
    return this.http.get<Collection>(`${this.apiUrl}/${id}`);
  }

  getUserCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.apiUrl}/user/me`);
  }

  createCollection(data: FormData): Observable<Collection> {
    return this.http.post<Collection>(this.apiUrl, data);
  }
}
