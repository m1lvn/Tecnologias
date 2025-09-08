import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonTextarea, IonButton, IonList, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-pantalla10',
  templateUrl: './pantalla10.page.html',
  styleUrls: ['./pantalla10.page.scss'],
  imports: [
    CommonModule, FormsModule, DatePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonTextarea, IonButton, IonList, IonItem, IonLabel
  ],
})
export class Pantalla10Page {
  mood: '😀' | '🙂' | '😐' | '😕' | '😢' = '🙂';
  text = '';
  entries: { date: string; mood: string; text: string }[] = [];

  constructor() { this.load(); }

  private load() {
    try {
      const raw = localStorage.getItem('diario_entries');
      this.entries = raw ? JSON.parse(raw) : [];
    } catch {
      this.entries = [];
    }
  }
  private save() {
    localStorage.setItem('diario_entries', JSON.stringify(this.entries));
  }

  add() {
    const t = this.text.trim();
    if (!t) return;
    const today = new Date().toISOString();
    this.entries.unshift({ date: today, mood: this.mood, text: t });
    this.text = '';
    this.save();
  }
}
