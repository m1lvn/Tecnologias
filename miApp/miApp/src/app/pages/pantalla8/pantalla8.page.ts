import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, 
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, 
  IonItem, IonInput, IonButton, IonList, IonLabel, IonCheckbox, IonProgressBar, IonDatetime
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-pantalla8',
  templateUrl: './pantalla8.page.html',
  styleUrls: ['./pantalla8.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonItem, IonInput, IonButton, IonList, IonLabel, IonCheckbox, IonProgressBar, IonDatetime
  ]
})
export class Pantalla8Page {
  metas: any[] = [];
  newMeta: string = '';
  newMetaDeadline: string | null = null;
  newSubtask: { [key: number]: string } = {};

  addMeta() {
    this.metas.push({
      titulo: this.newMeta,
      deadline: this.newMetaDeadline,
      subtareas: []
    });
    this.newMeta = '';
    this.newMetaDeadline = null;
  }

  removeMeta(index: number) {
    this.metas.splice(index, 1);
  }

  addSubtask(meta: any, index: number) {
    meta.subtareas.push({ texto: this.newSubtask[index], done: false });
    this.newSubtask[index] = '';
  }

  removeSubtask(meta: any, subIndex: number) {
    meta.subtareas.splice(subIndex, 1);
  }

  updateProgress(meta: any) {
    // Se recalcula automáticamente con getProgress
  }

  getCompleted(meta: any): number {
    return meta.subtareas.filter((s: any) => s.done).length;
  }

  getProgress(meta: any): number {
    return meta.subtareas.length > 0 ? this.getCompleted(meta) / meta.subtareas.length : 0;
  }

  getDaysRemaining(deadline: string): number {
    const today = new Date();
    const target = new Date(deadline);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }
}
