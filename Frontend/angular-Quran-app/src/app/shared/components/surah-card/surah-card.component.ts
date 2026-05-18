import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Surah } from '../../../core/services/surah.service';

// Distinct dark gradient palettes cycling by surah number
const CARD_PALETTES = [
  'linear-gradient(145deg, #0a2e1e 0%, #1a5c3a 100%)',   // Deep Emerald
  'linear-gradient(145deg, #0c1a3a 0%, #1a3070 100%)',   // Ocean Midnight Blue
  'linear-gradient(145deg, #2a0a0a 0%, #5c1a1a 100%)',   // Deep Crimson Wine
  'linear-gradient(145deg, #1a0a2e 0%, #3a1a5c 100%)',   // Dark Amethyst
  'linear-gradient(145deg, #0a1a2e 0%, #1a3a4a 100%)',   // Midnight Slate
  'linear-gradient(145deg, #1a1a0a 0%, #3a3a1a 100%)',   // Dark Olive
];

@Component({
  selector: 'app-surah-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="surah-card" *ngIf="surah" [routerLink]="['/surahs', surah._id]" [style.background]="getCardGradient()">
      <!-- Surah Number Badge -->
      <div class="surah-num-badge">{{ surah.surahNumber }}</div>

      <!-- Subtle glow overlay -->
      <div class="card-glow"></div>

      <!-- Arabic Name (big, centered) -->
      <div class="surah-arabic-display">{{ surah.titleArabic }}</div>

      <!-- Divider -->
      <div class="card-divider"></div>

      <!-- Metadata -->
      <div class="surah-card-meta">
        <div class="surah-english-name">{{ surah.title }}</div>
        <div class="surah-card-pills">
          <span class="pill pill-type" [class.pill-meccan]="surah.revelationType === 'Meccan'" [class.pill-medinan]="surah.revelationType !== 'Meccan'">
            {{ surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية' }}
          </span>
          <span class="pill pill-ayah">{{ surah.numberOfAyahs }} آية</span>
          <span class="pill pill-juz" *ngIf="surah.juz">جزء {{ surah.juz }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .surah-card {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      border: 1px solid rgba(255,255,255,0.07);
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 16px 16px;
      min-height: 180px;
    }

    .surah-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.3);
      border-color: rgba(212,175,55,0.3);
    }

    .card-glow {
      position: absolute;
      top: -30%;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 120px;
      background: radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%);
      pointer-events: none;
    }

    .surah-num-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #d4af37, #a07820);
      color: #0a1a0e;
      font-size: 0.75rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(212,175,55,0.4);
      z-index: 2;
    }

    .surah-arabic-display {
      font-family: 'Scheherazade New', 'Amiri', 'Traditional Arabic', serif;
      font-size: 2.2rem;
      font-weight: 700;
      color: rgba(255,255,255,0.95);
      text-align: center;
      line-height: 1.3;
      margin: 12px 0 10px;
      text-shadow: 0 2px 16px rgba(212,175,55,0.25), 0 0 40px rgba(255,255,255,0.1);
      z-index: 2;
      position: relative;
    }

    .card-divider {
      width: 40px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent);
      margin: 0 0 10px;
    }

    .surah-card-meta {
      text-align: center;
      z-index: 2;
      width: 100%;
    }

    .surah-english-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: rgba(255,255,255,0.65);
      letter-spacing: 0.04em;
      margin-bottom: 8px;
    }

    .surah-card-pills {
      display: flex;
      gap: 6px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .pill {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.68rem;
      font-weight: 600;
    }

    .pill-meccan {
      background: rgba(212,175,55,0.18);
      color: #d4af37;
      border: 1px solid rgba(212,175,55,0.3);
    }

    .pill-medinan {
      background: rgba(100,180,100,0.15);
      color: #7ec87e;
      border: 1px solid rgba(100,180,100,0.25);
    }

    .pill-ayah {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.6);
      border: 1px solid rgba(255,255,255,0.1);
    }

    .pill-juz {
      background: rgba(100,150,255,0.12);
      color: #8ab4ff;
      border: 1px solid rgba(100,150,255,0.2);
    }
  `]
})
export class SurahCardComponent {
  @Input() surah!: Surah;

  getCardGradient(): string {
    if (!this.surah) return CARD_PALETTES[0];
    return CARD_PALETTES[(this.surah.surahNumber - 1) % CARD_PALETTES.length];
  }
}
