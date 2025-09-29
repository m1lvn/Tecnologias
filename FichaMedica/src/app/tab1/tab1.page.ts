import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonIcon, IonAvatar
} from '@ionic/angular/standalone';
import { NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [
    IonContent, IonGrid, IonRow, IonCol,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonIcon, IonAvatar,
    NgFor,
    NgClass
  ],
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss']
})
export class Tab1Page {

  constructor(private router: Router) {}

  stats = [
    { title: 'Pacientes Activos', value: 42, sub: '28 hospitalizados, 14 ambulatorios', icon: 'people-outline' },
    { title: 'Consultas del Día', value: 18, sub: 'Cardiología: 6, Medicina: 8, Pediatría: 4', icon: 'calendar-outline' },
    { title: 'Boxes Disponibles', value: '3/8', sub: '5 boxes ocupados', icon: 'bed-outline' },
    { title: 'Alertas Activas', value: 7, sub: '2 críticas, 5 moderadas', icon: 'alert-circle-outline' },
  ];

  goToPatients() {
    this.router.navigateByUrl('/tabs/tab2');
  }

  // Ejemplo de pacientes y exámenes
  pacientes = [
    {
      nombre: 'Juan Pérez',
      examenes: [
        { nombre: 'Hemograma', estado: 'normal' },
        { nombre: 'Colesterol', estado: 'pendiente' }
      ]
    },
    {
      nombre: 'María López',
      examenes: [
        { nombre: 'Glucosa', estado: 'alterado' },
        { nombre: 'Orina', estado: 'normal' }
      ]
    },
    {
      nombre: 'Pedro González',
      examenes: [
        { nombre: 'TSH', estado: 'pendiente' }
      ]
    }
  ];

  getAlertasExamenes() {
    const alertas: { paciente: string, examen: string, tipo: string }[] = [];
    for (const p of this.pacientes) {
      for (const e of p.examenes) {
        if (e.estado === 'alterado') {
          alertas.push({ paciente: p.nombre, examen: e.nombre, tipo: 'alterado' });
        }
        if (e.estado === 'pendiente') {
          alertas.push({ paciente: p.nombre, examen: e.nombre, tipo: 'pendiente' });
        }
      }
    }
    return alertas;
  }
}
