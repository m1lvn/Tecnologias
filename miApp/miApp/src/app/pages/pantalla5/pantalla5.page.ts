import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonList, IonItem, IonLabel, IonToggle, IonInput,
  IonButton, IonBadge, IonProgressBar
} from '@ionic/angular/standalone';

type Habit = { id: number; name: string; done: boolean };

export const LS_HABITS_LIST = 'habits:list:v1';
export const LS_HABITS_DONE_PREFIX = 'habits:done:'; // + YYYY-MM-DD

@Component({
  selector: 'app-pantalla5',
  standalone: true,
  templateUrl: './pantalla5.page.html',
  styleUrls: ['./pantalla5.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonList, IonItem, IonLabel, IonToggle, IonInput,
    IonButton, IonBadge, IonProgressBar
  ],
})
export class Pantalla5Page implements OnInit {

  habits: Habit[] = [];
  newHabit = '';
  todayId = this.dateId(new Date());

  get total() { return this.habits.length; }
  get doneCount() { return this.habits.filter(h => h.done).length; }
  get progress() { return this.total ? this.doneCount / this.total : 0; }

  ngOnInit(): void {
    this.loadList();
    this.loadTodayStatus();
  }

  ionViewWillEnter(): void {
    const now = this.dateId(new Date());
    if (now !== this.todayId) {
      this.todayId = now;
      this.loadTodayStatus();
    }
  }

  // ---------- Persistencia ----------
  private dateId(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private saveList() {
    const plain = this.habits.map(h => ({ id: h.id, name: h.name }));
    localStorage.setItem(LS_HABITS_LIST, JSON.stringify(plain));
    this.emitChanged();
  }

  private loadList() {
    const raw = localStorage.getItem(LS_HABITS_LIST);
    if (raw) {
      const arr = JSON.parse(raw) as Array<{ id: number; name: string }>;
      this.habits = arr.map(x => ({ id: x.id, name: x.name, done: false }));
    } else {
      // Lista por defecto
      this.habits = [
        { id: 1, name: 'Beber agua (8 vasos)', done: false },
        { id: 2, name: 'Caminar 20 min', done: false },
        { id: 3, name: 'Leer 10 min', done: false },
        { id: 4, name: 'Estiramientos', done: false },
      ];
      this.saveList();
    }
  }

  private saveTodayStatus() {
    const key = LS_HABITS_DONE_PREFIX + this.todayId;
    const doneIds = this.habits.filter(h => h.done).map(h => h.id);
    localStorage.setItem(key, JSON.stringify(doneIds));
    this.emitChanged();
  }

  private loadTodayStatus() {
    const key = LS_HABITS_DONE_PREFIX + this.todayId;
    const raw = localStorage.getItem(key);
    const doneIds: number[] = raw ? JSON.parse(raw) : [];
    this.habits = this.habits.map(h => ({ ...h, done: doneIds.includes(h.id) }));
  }

  // ---------- Acciones ----------
  toggleHabit(h: Habit, value: boolean) {
    h.done = value;
    this.saveTodayStatus();
  }

  addHabit() {
    const name = (this.newHabit || '').trim();
    if (!name) return;
    const id = this.habits.length ? Math.max(...this.habits.map(h => h.id)) + 1 : 1;
    this.habits.push({ id, name, done: false });
    this.newHabit = '';
    this.saveList();
    this.saveTodayStatus();
  }

  clearDay() {
    this.habits.forEach(h => (h.done = false));
    this.saveTodayStatus();
  }

  markAll() {
    this.habits.forEach(h => (h.done = true));
    this.saveTodayStatus();
  }

  removeHabit(id: number) {
    this.habits = this.habits.filter(h => h.id !== id);
    this.saveList();
    this.saveTodayStatus();
  }

  // Notifica a la pantalla principal que algo cambió (para refrescar resumen)
  private emitChanged() {
    window.dispatchEvent(new CustomEvent('habits:changed'));
  }
}
