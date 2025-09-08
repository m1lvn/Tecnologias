import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonItem, IonInput, IonButton, IonList, IonLabel, IonCheckbox, IonProgressBar,
  IonDatetime, IonDatetimeButton, IonModal, IonNote
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-pantalla8',
  templateUrl: './pantalla8.page.html',
  styleUrls: ['./pantalla8.page.scss'],
  standalone: true,
  imports: [
    // Angular
    CommonModule,
    FormsModule,      // 👈 IMPRESCINDIBLE para [(ngModel)]
    DatePipe,

    // Ionic que usas en el HTML
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonItem, IonInput, IonButton, IonList, IonLabel, IonCheckbox, IonProgressBar,
    IonDatetime, IonDatetimeButton, IonModal, IonNote
  ],
})
export class Pantalla8Page {
  newMetaTitle = '';
  newMetaDeadline: string | null = null;

  metas: Array<{
    titulo: string;
    fechaLimite: string | null;
    subtareas: Array<{ titulo: string; completada: boolean }>;
    nuevaSubtarea?: string;
  }> = [];

  addMeta() {
    if (!this.newMetaTitle.trim()) return;
    this.metas.push({
      titulo: this.newMetaTitle.trim(),
      fechaLimite: this.newMetaDeadline,
      subtareas: [],
      nuevaSubtarea: ''
    });
    this.newMetaTitle = '';
    this.newMetaDeadline = null;
  }

  clearDeadline() { this.newMetaDeadline = null; }
  onDeadlineChange(ev: any) { this.newMetaDeadline = ev.detail?.value ?? null; }

  calcularDiasRestantes(fecha: string) {
    const hoy = new Date().getTime();
    const limite = new Date(fecha).getTime();
    const diff = Math.ceil((limite - hoy) / (1000*60*60*24));
    return diff > 0 ? `${diff} días restantes` : 'Vencido';
  }
  contarSubtareasCompletadas(m: any) { return m.subtareas.filter((s: any) => s.completada).length; }
  calcularProgreso(m: any) { return m.subtareas.length ? this.contarSubtareasCompletadas(m) / m.subtareas.length : 0; }
  addSubtarea(m: any) { const t = m.nuevaSubtarea?.trim(); if (t) { m.subtareas.push({titulo:t, completada:false}); m.nuevaSubtarea=''; } }
  removeMeta(i: number) { this.metas.splice(i, 1); }
}
