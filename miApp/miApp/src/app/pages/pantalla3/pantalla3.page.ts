import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonList, IonItem, IonLabel, IonButton, IonBadge, IonAlert
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
    IonContent, IonList, IonItem, IonLabel, IonButton, IonBadge, IonAlert
  ],
})
export class Pantalla3Page implements OnInit {
  tareas: Task[] = [];
  completadas: Task[] = [];

  // estado del Alert
  confirmOpen = false;

  ngOnInit(): void { this.load(); }
  ionViewWillEnter(): void { this.load(); }

  private getTasks(): Task[] {
    try {
      const raw = localStorage.getItem('tareas');
      return raw ? (JSON.parse(raw) as Task[]) : [];
    } catch {
      return [];
    }
  }
  private saveTasks(tasks: Task[]) {
    localStorage.setItem('tareas', JSON.stringify(tasks));
  }

  load(): void {
    this.tareas = this.getTasks();
    this.completadas = this.tareas.filter(t => t.done);
  }

  marcarPendiente(t: Task): void {
    const idx = this.tareas.findIndex(x => x.id === t.id);
    if (idx >= 0) {
      this.tareas[idx].done = false;
      this.saveTasks(this.tareas);
      this.load();
    }
  }

  // abrir alert
  openConfirmDeleteAll(): void { this.confirmOpen = true; }

  // manejar decisión
  onConfirmDeleteAllDismiss(ev: CustomEvent) {
    const role = (ev as any).detail?.role;
    this.confirmOpen = false;
    if (role === 'confirm') {
      this.tareas = this.tareas.filter(t => !t.done);
      this.saveTasks(this.tareas);
      this.load();
    }
  }
}
