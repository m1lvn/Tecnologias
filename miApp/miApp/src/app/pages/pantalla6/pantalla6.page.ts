import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonProgressBar, IonButton, IonBadge
} from '@ionic/angular/standalone';

type Habit = { id: number; name: string; doneToday: boolean };
type DayEntry = { date: string; completed: number; total: number };

@Component({
  selector: 'app-pantalla6',
  standalone: true,
  templateUrl: './pantalla6.page.html',
  styleUrls: ['./pantalla6.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonLabel, IonProgressBar, IonButton, IonBadge
  ],
})
export class Pantalla6Page implements OnInit {

  week: DayEntry[] = [];           // últimos 7 días (hoy incluido)
  weeklyProgress = 0;              // 0..1
  weeklyPercent = '0%';            // texto
  totalHabits = 0;                 // por info

  ngOnInit(): void {
    this.ensureWeek();
    this.loadWeek();
  }
  ionViewWillEnter(): void {
    this.ensureWeek();
    this.loadWeek();
  }

  // ---- Cargar/Sincronizar ----
  private ensureWeek() {
    // crea una semana vacía si no existe historial
    const hist = this.getHistory();
    if (!hist || !Array.isArray(hist)) {
      const today = new Date();
      const newWeek: DayEntry[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        newWeek.push({ date: this.iso(d), completed: 0, total: 0 });
      }
      this.saveHistory(newWeek);
    }
  }

  private loadWeek() {
    const hist = this.getHistory() ?? [];
    // Nos quedamos con los últimos 7 días (por si hay más)
    this.week = hist.slice(-7);
    // total de hábitos (tomado de LS)
    const habitos = this.getFromLS<Habit[]>('habitos') ?? [];
    this.totalHabits = habitos.length;

    // cálculo del progreso semanal
    const sumCompleted = this.week.reduce((a, d) => a + d.completed, 0);
    const sumTotal     = this.week.reduce((a, d) => a + (d.total || this.totalHabits), 0);
    this.weeklyProgress = sumTotal > 0 ? sumCompleted / sumTotal : 0;
    this.weeklyPercent  = `${Math.round(this.weeklyProgress * 100)}%`;
  }

  // ---- Acciones ----
  registrarHoy() {
    // lee hábitos de la pantalla 5 (key 'habitos'), cuenta doneToday y crea/actualiza el día de hoy
    const habitos = this.getFromLS<Habit[]>('habitos') ?? [];
    const completed = habitos.filter(h => h.doneToday).length;
    const total = habitos.length;
    const today = this.iso(new Date());

    let hist = this.getHistory() ?? [];
    // asegura que hist tenga solo días recientes
    hist = hist.slice(-6); // dejaremos 6 y añadimos hoy
    // elimina hoy si ya estaba y vuelve a meterlo (update)
    hist = hist.filter(d => d.date !== today);
    hist.push({ date: today, completed, total });

    // mantiene orden por fecha
    hist.sort((a, b) => a.date.localeCompare(b.date));

    this.saveHistory(hist);
    this.loadWeek();
  }

  cargarDemoSemana() {
    const habitos = this.getFromLS<Habit[]>('habitos') ?? [
      { id: 1, name: 'Beber 2L de agua',  doneToday: true },
      { id: 2, name: 'Caminar 20 min',    doneToday: false },
      { id: 3, name: 'Leer 10 páginas',   doneToday: true },
      { id: 4, name: 'Meditar 5 min',     doneToday: false },
      { id: 5, name: 'Dormir 7+ horas',   doneToday: false },
    ];
    const total = habitos.length || 5;

    const today = new Date();
    const rand = (min: number, max: number) =>
      Math.max(0, Math.min(total, Math.floor(Math.random() * (max - min + 1)) + min));

    const demo: DayEntry[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      // simulamos una tendencia leve al alza
      const base = 1 + (6 - i) * 0.5;
      demo.push({
        date: this.iso(d),
        completed: rand(base as number, Math.min(total, base + 2)),
        total
      });
    }
    this.saveHistory(demo);
    this.loadWeek();
  }

  // ---- Helpers ----
  private iso(d: Date): string {
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }
  private getHistory(): DayEntry[] | null {
    return this.getFromLS<DayEntry[]>('habitos_historial');
  }
  private saveHistory(data: DayEntry[]) {
    localStorage.setItem('habitos_historial', JSON.stringify(data));
  }
  private getFromLS<T>(key: string): T | null {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : null; }
    catch { return null; }
  }
}
