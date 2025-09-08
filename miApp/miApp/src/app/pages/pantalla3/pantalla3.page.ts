import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonList, IonItem, IonLabel, IonButton
} from '@ionic/angular/standalone';

type Task = { id: number; text: string; done: boolean; createdAt: string };

@Component({
  selector: 'app-pantalla3',
  standalone: true,
  templateUrl: './pantalla3.page.html',
  styleUrls: ['./pantalla3.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonList, IonItem, IonLabel, IonButton
  ],
})
export class Pantalla3Page implements OnInit {

  /** Todas las tareas del LS */
  private all: Task[] = [];
  /** Solo las completadas (lo que mostramos) */
  completedTasks: Task[] = [];

  ngOnInit(): void { this.load(); }
  ionViewWillEnter(): void { this.load(); }

  // ---------- Cargar / Guardar ----------
  private load(): void {
    try {
      const raw = localStorage.getItem('tareas');
      this.all = raw ? JSON.parse(raw) as Task[] : [];
    } catch {
      this.all = [];
    }
    this.completedTasks = this.all.filter(t => t.done);
  }

  private save(): void {
    localStorage.setItem('tareas', JSON.stringify(this.all));
    this.completedTasks = this.all.filter(t => t.done);
  }

  // ---------- Acciones ----------
  /** Pasa la tarea a pendiente */
  markPending(task: Task): void {
    const idx = this.all.findIndex(t => t.id === task.id);
    if (idx > -1) {
      this.all[idx].done = false;
      this.save();
    }
  }

  /** Borra TODAS las completadas */
  deleteCompleted(): void {
    const ok = confirm('¿Seguro que quieres borrar todas las tareas completadas?');
    if (!ok) return;
    this.all = this.all.filter(t => !t.done);
    this.save();
  }
}
