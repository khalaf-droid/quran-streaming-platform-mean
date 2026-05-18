import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface AudioTrack {
  _id: string;
  title: string;
  audioUrl: string;
  coverImage?: string;
  reciter?: {
    name: string;
  };
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio?: HTMLAudioElement;
  private platformId = inject(PLATFORM_ID);

  // Signals for reactive state
  public currentTrack = signal<AudioTrack | null>(null);
  public isPlaying = signal<boolean>(false);
  public currentTime = signal<number>(0);
  public duration = signal<number>(0);
  public volume = signal<number>(1);

  // Computed signals for formatting
  public formattedCurrentTime = computed(() => this.formatTime(this.currentTime()));
  public formattedDuration = computed(() => this.formatTime(this.duration()));
  public progressPercent = computed(() => {
    if (this.duration() === 0) return 0;
    return (this.currentTime() / this.duration()) * 100;
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.audio = new Audio();
      this.setupAudioListeners();
    }
  }

  private setupAudioListeners() {
    if (!this.audio) return;
    
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime.set(this.audio!.currentTime);
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.duration.set(this.audio!.duration);
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying.set(true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying.set(false);
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio element error:', e);
      this.isPlaying.set(false);
      this.duration.set(0);
      this.currentTime.set(0);
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying.set(false);
      this.currentTime.set(0);
      // Auto-play next track could go here
    });
  }

  public play(track: AudioTrack) {
    if (!this.audio) return;

    // If it's the same track, just resume
    if (this.currentTrack() && this.currentTrack()!._id === track._id) {
      if (!this.isPlaying()) {
        this.audio.play();
      }
      return;
    }

    // New track
    this.currentTrack.set(track);
    
    // Convert relative URL to full URL if needed (our backend serves at http://localhost:5000)
    let url = track.audioUrl;
    if (url.startsWith('/')) {
      url = `http://localhost:5000${url}`;
    }
    
    // Encode the URI to handle Arabic characters and spaces
    this.audio.src = encodeURI(url);
    this.audio.load();
    this.audio.play().catch(e => console.error('Audio play error:', e));
  }

  public pause() {
    if (!this.audio) return;
    this.audio.pause();
  }

  public togglePlay() {
    if (!this.audio || !this.currentTrack()) return;
    
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.audio.play();
    }
  }

  public seek(seconds: number) {
    if (!this.audio) return;
    if (seconds >= 0 && seconds <= this.duration()) {
      this.audio.currentTime = seconds;
      this.currentTime.set(seconds);
    }
  }

  public setVolume(level: number) {
    if (!this.audio) return;
    const safeVolume = Math.max(0, Math.min(1, level));
    this.audio.volume = safeVolume;
    this.volume.set(safeVolume);
  }

  private formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
