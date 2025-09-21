import { Component } from '@angular/core';
import {
  IonContent, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonIcon, IonLabel, IonList, IonItem, IonBadge
} from '@ionic/angular/standalone';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [
    IonContent, IonGrid, IonRow, IonCol,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonIcon, IonLabel, IonList, IonItem, IonBadge,
    NgFor, NgIf
  ],
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss']
})
export class Tab1Page {

  // Tarjetas superiores (stats)
  stats = [
    {
      title: 'Pacientes Activos',
      value: 42,
      sub: '28 hospitalizados, 14 ambulatorios',
      icon: 'people-outline'
    },
    {
      title: 'Consultas del Día',
      value: 18,
      sub: 'Cardiología: 6, Medicina: 8, Pediatría: 4',
      icon: 'calendar-outline'
    },
    {
      title: 'Boxes Disponibles',
      value: '3/8',
      sub: '5 boxes ocupados',
      icon: 'bed-outline'
    },
    {
      title: 'Alertas Activas',
      value: 7,
      sub: '2 críticas, 5 moderadas',
      icon: 'alert-circle-outline'
    },
  ];

  // Alertas clínicas
  alerts = [
    {
      name: 'María González',
      detail: 'Alergia severa a penicilina',
      time: '10:30 AM',
      level: 'Crítico'
    },
    {
      name: 'Juan Pérez',
      detail: 'Resultados de laboratorio críticos',
      time: '09:15 AM',
      level: 'Crítico'
    },
    {
      name: 'Ana López',
      detail: 'Signos vitales alterados',
      time: '11:45 AM',
      level: 'Moderado'
    },
  ];

  // Pacientes recientes
  recent = [
    {
      name: 'Carlos Ruiz',
      location: 'Hab. 203',
      ago: 'Hace 15 min',
      status: 'Estable'
    },
    {
      name: 'Elena Morales',
      location: 'Box 4',
      ago: 'Hace 30 min',
      status: 'En observación'
    },
    {
      name: 'Roberto Silva',
      location: 'Hab. 105',
      ago: 'Hace 5 min',
      status: 'Crítico'
    },
  ];
}
