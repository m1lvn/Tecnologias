import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonList, IonItem, IonLabel, IonToggle, IonButton,
  IonBadge, IonProgressBar, IonInput
} from '@ionic/angular/standalone';

type Habit = { id: number; name: string; doneToday: boolean };
type DayEntry = { date: string; completed: number; total: number };

@Component({
  selector: 'app-pantalla5',
  standalone: true,
  templateUrl: './pantalla5.page.html',
  styleUrls: ['./pantalla5.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonList, IonItem, IonLabel, IonToggle, IonButton,
    IonBadge, IonProgressBar, IonInput
  ],
})
export class Pantalla5Page implements OnInit {

  // Datos
  habitos: Habit[] = [];

  // UI / KPIs
  newHabit = '';
  doneCount = 0;
  total = 0;
  progress = 0;            // 0..1 para <ion-progress-bar>
  todayId = this.iso(new Date()); // YYYY-MM-DD

  ngOnInit() { this.load(); }
  ionViewWillEnter() { this.load(); }

  // --------- Carga / Guardado ----------
  private load() {
    this.habitos = this.getFromLS<Habit[]>('habitos') ?? [];
    this.refreshStats();
  }

  private save() {
    this.setToLS('habitos', this.habitos);
    this.refreshStats();
    this.updateHistorial(); // 🔗 sincroniza Pantalla 6 y Principal
  }

  private refreshStats() {
    this.total = this.habitos.length;
    this.doneCount = this.habitos.filter(h => h.doneToday).length;
    this.progress = this.total > 0 ? this.doneCount / this.total : 0;
  }

  // --------- Acciones ----------
  addHabit() {
    const name = this.newHabit.trim();
    if (!name) return;
    this.habitos.push({ id: Date.now(), name, doneToday: false });
    this.newHabit = '';
    this.save();
  }

  removeHabit(id: number) {
    this.habitos = this.habitos.filter(h => h.id !== id);
    this.save();
  }

  clearDay() {
    this.habitos.forEach(h => h.doneToday = false);
    this.save();
  }

  markAll() {
    this.habitos.forEach(h => h.doneToday = true);
    this.save();
  }

  toggleHabit(h: Habit, checked?: boolean) {
    if (typeof checked === 'boolean') h.doneToday = checked;
    else h.doneToday = !h.doneToday;
    this.save();
  }

  // --------- Historial semanal (compartido con Pantalla 6 y Principal) ----------
  private updateHistorial() {
    const today = this.todayId;
    const completed = this.doneCount;
    const total = this.total;

    let hist = this.getFromLS<DayEntry[]>('habitos_historial') ?? [];
    // Mantén últimos 7 días
    hist = hist
      .filter(d => !!d?.date)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-6); // conservar 6 previos; hoy lo agregamos

    // Reemplazar entrada de hoy
    hist = hist.filter(d => d.date !== today);
    hist.push({ date: today, completed, total });
    hist.sort((a, b) => a.date.localeCompare(b.date));

    this.setToLS('habitos_historial', hist);
  }

  // --------- Helpers LS ----------
  private iso(d: Date): string { return d.toISOString().slice(0, 10); }
  private getFromLS<T>(key: string): T | null {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : null; }
    catch { return null; }
  }
  private setToLS<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
