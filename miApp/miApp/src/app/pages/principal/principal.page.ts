import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonProgressBar, IonButton,
  IonList, IonItem, IonLabel, IonBadge
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';

type Task = { id: number; text: string; done: boolean; createdAt: string };
type Habit = { id: number; name: string; doneToday: boolean };
type Note  = { id: number; title: string; body: string; date: string };

@Component({
  selector: 'app-principal',
  standalone: true,
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonProgressBar, IonButton,
    IonList, IonItem, IonLabel, IonBadge
  ],
})
export class PrincipalPage implements OnInit {
  constructor(private nav: NavController) {}

  // Fecha de hoy
  today = new Date();

  // Datos
  tareas: Task[] = [];
  habitos: Habit[] = [];
  notas: Note[] = [];

  // KPIs
  userName = '¡Hola!';
  pendingTasks = 0;
  doneTasks = 0;
  todayHabitsDone = 0;
  totalHabits = 0;

  // Progresos
  tasksProgress = 0;
  habitsProgress = 0;

  ngOnInit(): void { this.loadAll(); }
  ionViewWillEnter(): void { this.loadAll(); }

  // ---- Navegación (soluciona el error de go()) ----
  go(url: string) {
    this.nav.navigateForward(url, { animated: true });
  }

  // ---- Carga + KPIs ----
  loadAll(): void {
    this.userName = this.getUserName();
    this.tareas  = this.getFromLS<Task[]>('tareas') ?? [];
    this.habitos = this.getFromLS<Habit[]>('habitos') ?? [];
    this.notas   = this.getFromLS<Note[]>('notas') ?? [];

    this.pendingTasks = this.tareas.filter(t => !t.done).length;
    this.doneTasks    = this.tareas.filter(t => t.done).length;

    this.totalHabits     = this.habitos.length;
    this.todayHabitsDone = this.habitos.filter(h => h.doneToday).length;

    const totalTasks = this.pendingTasks + this.doneTasks;
    this.tasksProgress  = totalTasks > 0 ? this.doneTasks / totalTasks : 0;
    this.habitsProgress = this.totalHabits > 0 ? this.todayHabitsDone / this.totalHabits : 0;
  }

  private getUserName(): string {
    const saved = localStorage.getItem('userName');
    return saved && saved.trim() ? `¡Hola, ${saved}!` : '¡Hola!';
  }
  private getFromLS<T>(key: string): T | null {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : null; }
    catch { return null; }
  }
  private setToLS<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ---- Datos demo ----
  seedDemoData(): void {
    const demoTasks: Task[] = [
      { id: 1, text: 'Estudiar Angular',        done: false, createdAt: new Date().toISOString() },
      { id: 2, text: 'Hacer 20 min de cardio',  done: true,  createdAt: new Date().toISOString() },
      { id: 3, text: 'Preparar presentación',   done: false, createdAt: new Date().toISOString() },
    ];
    const demoHabits: Habit[] = [
      { id: 1, name: 'Beber 2L de agua',  doneToday: true  },
      { id: 2, name: 'Caminar 20 minutos',doneToday: false },
      { id: 3, name: 'Leer 10 páginas',   doneToday: true  },
      { id: 4, name: 'Dormir 7+ horas',   doneToday: false },
      { id: 5, name: 'Meditar 5 min',     doneToday: false },
    ];
    const demoNotes: Note[] = [
      { id: 1, title: 'Ideas para la app', body: 'Sidebar + 12 páginas + stats', date: new Date().toISOString() },
      { id: 2, title: 'Reunión martes',    body: 'Llevar demo actualizado',       date: new Date().toISOString() },
    ];
    this.setToLS('tareas', demoTasks);
    this.setToLS('habitos', demoHabits);
    this.setToLS('notas', demoNotes);
    if (!localStorage.getItem('userName')) {
      localStorage.setItem('userName', 'Nacha');
    }
    this.loadAll();
  }
}
