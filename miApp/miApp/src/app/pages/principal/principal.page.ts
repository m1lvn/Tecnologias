import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonProgressBar, IonButton,
  IonList, IonItem, IonLabel, IonBadge
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';

type Task  = { id: number; text: string; done: boolean; createdAt: string };
type Habit = { id: number; name: string; doneToday: boolean };
type Note  = { id: number; title: string; body: string; date: string };

// Evento que disparamos desde otras pantallas cuando guardan en localStorage
const APP_LS_EVENT = 'app-ls-updated';

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
export class PrincipalPage implements OnInit, OnDestroy {
  constructor(private nav: NavController) {}

  // Datos base
  tareas: Task[] = [];
  habitos: Habit[] = [];
  notas: Note[] = [];
  today = new Date();
  userName = '¡Hola!';

  // KPIs
  pendingTasks = 0;
  doneTasks = 0;
  totalTasks = 0;

  todayHabitsDone = 0;
  totalHabits = 0;

  tasksProgress = 0;   // 0..1
  habitsProgress = 0;  // 0..1
  notesProgress = 0;   // 0 o 1 (sólo para barra estética)

  // Listeners para sincronizarse con el resto
  private onLsUpdated  = () => this.loadAll();       // disparado por nuestras páginas
  private onStorageEvt = () => this.loadAll();       // si cambia localStorage en otra pestaña

  ngOnInit(): void {
    this.loadAll();
    window.addEventListener(APP_LS_EVENT, this.onLsUpdated);
    window.addEventListener('storage', this.onStorageEvt);
  }

  ngOnDestroy(): void {
    window.removeEventListener(APP_LS_EVENT, this.onLsUpdated);
    window.removeEventListener('storage', this.onStorageEvt);
  }

  ionViewWillEnter(): void { this.loadAll(); }

  // ---------- Carga y cálculo ----------
  private loadAll(): void {
    this.userName = this.getUserName();

    this.tareas  = this.getFromLS<Task[]>('tareas')  ?? [];
    this.habitos = this.getFromLS<Habit[]>('habitos') ?? [];
    this.notas   = this.getFromLS<Note[]>('notas')    ?? [];

    this.pendingTasks = this.tareas.filter(t => !t.done).length;
    this.doneTasks    = this.tareas.filter(t =>  t.done).length;
    this.totalTasks   = this.pendingTasks + this.doneTasks;

    this.totalHabits     = this.habitos.length;
    this.todayHabitsDone = this.habitos.filter(h => h.doneToday).length;

    this.tasksProgress  = this.totalTasks   > 0 ? this.doneTasks / this.totalTasks : 0;
    this.habitsProgress = this.totalHabits  > 0 ? this.todayHabitsDone / this.totalHabits : 0;
    this.notesProgress  = this.notas.length > 0 ? 1 : 0;
  }

  private getUserName(): string {
    const saved = localStorage.getItem('userName');
    return saved && saved.trim() ? `¡Hola, ${saved}!` : '¡Hola!';
  }

  private getFromLS<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  // Navegación
  go(url: string) { this.nav.navigateForward(url, { animated: true }); }

  // (Opcional) Datos demo. No afecta si no lo usas.
  seedDemoData(): void {
    const demoTasks: Task[] = [
      { id: Date.now(),     text: 'Estudiar Angular',        done: false, createdAt: new Date().toISOString() },
      { id: Date.now() + 1, text: 'Hacer 20 min de cardio',  done: true,  createdAt: new Date().toISOString() },
      { id: Date.now() + 2, text: 'Preparar presentación',   done: true,  createdAt: new Date().toISOString() },
    ];
    localStorage.setItem('tareas', JSON.stringify(demoTasks));
    window.dispatchEvent(new Event(APP_LS_EVENT));
  }
}
