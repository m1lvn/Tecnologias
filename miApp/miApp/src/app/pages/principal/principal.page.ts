import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonProgressBar, IonButton,
  IonList, IonItem, IonLabel, IonBadge
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

type Task  = { id: number; text: string; done: boolean; createdAt: string };
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
  constructor(private nav: NavController, private router: Router) {}

  // UI
  today = new Date();
  userName = '¡Hola!';

  // Datos
  tareas: Task[] = [];
  habitos: Habit[] = [];
  notas: Note[] = [];

  // KPIs
  pendingTasks = 0;
  doneTasks = 0;
  totalHabits = 0;
  todayHabitsDone = 0;

  // Progreso (0..1)
  tasksProgress = 0;
  habitsProgress = 0;

  ngOnInit(): void {
    this.loadAll();

    // ⚡ Recalcula cada vez que regreses a /principal
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        if (e.urlAfterRedirects?.includes('/principal')) {
          this.loadAll();
        }
      });
  }

  ionViewWillEnter(): void {
    // También por si llegas por back/navController
    this.loadAll();
  }

  // ------- Carga y KPIs -------
  private loadAll(): void {
    this.userName = this.getUserName();
    this.tareas  = this.getFromLS<Task[]>('tareas')  ?? [];
    this.habitos = this.getFromLS<Habit[]>('habitos') ?? [];
    this.notas   = this.getFromLS<Note[]>('notas')   ?? [];

    this.pendingTasks = this.tareas.filter(t => !t.done).length;
    this.doneTasks    = this.tareas.filter(t =>  t.done).length;

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

  // ------- Demo -------
  seedDemoData(): void {
    const now = new Date().toISOString();
    const demoTasks: Task[] = [
      { id: 1, text: 'Estudiar Angular',       done: false, createdAt: now },
      { id: 2, text: 'Hacer 20 min de cardio', done: true,  createdAt: now },
      { id: 3, text: 'Preparar presentación',  done: false, createdAt: now },
      { id: 4, text: 'Leer 10 páginas',        done: true,  createdAt: now },
    ];
    const demoHabits: Habit[] = [
      { id: 1, name: 'Beber 2L de agua',  doneToday: true  },
      { id: 2, name: 'Caminar 20 minutos',doneToday: false },
      { id: 3, name: 'Meditar 5 min',     doneToday: false },
      { id: 4, name: 'Dormir 7+ horas',   doneToday: true  },
      { id: 5, name: 'Estiramientos',     doneToday: false },
    ];
    const demoNotes: Note[] = [
      { id: 1, title: 'Ideas para la app', body: 'Sidebar + 12 páginas + stats', date: now },
      { id: 2, title: 'Reunión martes',    body: 'Llevar demo actualizado',       date: now },
    ];
    this.setToLS('tareas', demoTasks);
    this.setToLS('habitos', demoHabits);
    this.setToLS('notas', demoNotes);
    if (!localStorage.getItem('userName')) localStorage.setItem('userName', 'Nacha');

    this.loadAll();
  }

  // ------- Navigation -------
  go(url: string) {
    this.nav.navigateForward(url, { animated: true });
  }
}
