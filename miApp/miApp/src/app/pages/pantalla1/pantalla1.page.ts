import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonList, IonItem, IonLabel, IonCheckbox, IonButton
} from '@ionic/angular/standalone';

type Task = { id: number; text: string; done: boolean; createdAt: string };

@Component({
  selector: 'app-pantalla1',
  standalone: true,
  templateUrl: './pantalla1.page.html',
  styleUrls: ['./pantalla1.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonList, IonItem, IonLabel, IonCheckbox, IonButton
  ],
})
export class Pantalla1Page {
  tareas: Task[] = [];

  constructor() { this.loadTareas(); }

  toggleDone(task: Task) {
    task.done = !task.done;
    this.saveTareas();
  }

  clearAll() {
    if (confirm('¿Seguro que quieres borrar todas las tareas?')) {
      this.tareas = [];
      this.saveTareas();
    }
  }

  private loadTareas() {
    const raw = localStorage.getItem('tareas');
    this.tareas = raw ? JSON.parse(raw) : [];
  }

  private saveTareas() {
    localStorage.setItem('tareas', JSON.stringify(this.tareas));
  }
}
