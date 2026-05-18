import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css']
})
export class AudioPlayerComponent {
  audioService = inject(AudioService);

  onSeek(event: Event) {
    const input = event.target as HTMLInputElement;
    this.audioService.seek(parseFloat(input.value));
  }

  onVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.audioService.setVolume(parseFloat(input.value));
  }

  togglePlay() {
    this.audioService.togglePlay();
  }
}
