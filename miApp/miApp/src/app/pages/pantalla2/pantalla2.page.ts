import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonItem, IonLabel, IonInput, IonButton, IonToast
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

type Task = { id: number; text: string; done: boolean; createdAt: string };

@Component({
  selector: 'app-pantalla2',
  standalone: true,
  templateUrl: './pantalla2.page.html',
  styleUrls: ['./pantalla2.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonItem, IonLabel, IonInput, IonButton, IonToast
  ],
})
export class Pantalla2Page {
  text = '';
  showToast = false;

  constructor(private router: Router) {}

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

  addTask() {
    const clean = this.text.trim();
    if (!clean) return;

    const tasks = this.getTasks();
    const newTask: Task = {
      id: Date.now(),
      text: clean,
      done: false,
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);

    this.text = '';
    this.showToast = true; 
  }

  goToList() {
    this.router.navigateByUrl('/pantalla1');
  }
}
