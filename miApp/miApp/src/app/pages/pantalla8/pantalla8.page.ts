import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonItem, IonInput, IonButton, IonList, IonLabel, IonCheckbox,
  IonProgressBar, IonDatetime, IonDatetimeButton, IonModal, IonNote
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
    IonItem, IonInput, IonButton, IonList, IonLabel, IonCheckbox,
    IonProgressBar, IonDatetime, IonDatetimeButton, IonModal, IonNote
  ]
})
export class Pantalla8Page {
  newMetaTitle = '';
  newMetaDeadline: string | null = null;

  metas: any[] = [];

  addMeta() {
    if (!this.newMetaTitle.trim()) return;
    this.metas.push({
      titulo: this.newMetaTitle,
      fechaLimite: this.newMetaDeadline,
      subtareas: [],
      nuevaSubtarea: ''
    });
    this.newMetaTitle = '';
    this.newMetaDeadline = null;
  }

  removeMeta(index: number) {
    this.metas.splice(index, 1);
  }

  addSubtarea(meta: any) {
    if (!meta.nuevaSubtarea?.trim()) return;
    meta.subtareas.push({ titulo: meta.nuevaSubtarea, completada: false });
    meta.nuevaSubtarea = '';
  }

  contarSubtareasCompletadas(meta: any): number {
    return meta.subtareas.filter((s: any) => s.completada).length;
  }

  calcularProgreso(meta: any): number {
    if (!meta.subtareas.length) return 0;
    return this.contarSubtareasCompletadas(meta) / meta.subtareas.length;
  }

  calcularDiasRestantes(fecha: string): string {
    const hoy = new Date();
    const limite = new Date(fecha);
    const diff = limite.getTime() - hoy.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return dias > 0 ? `${dias} días restantes` : 'Vencida';
  }

  onDeadlineChange(ev: CustomEvent) {
    this.newMetaDeadline = (ev as any).detail?.value ?? null;
  }

  clearDeadline() {
    this.newMetaDeadline = null;
  }
}
