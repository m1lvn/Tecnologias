import { Component } from '@angular/core';
import { Router } from '@angular/router';

/* ✅ IMPORTANTE: habilita *ngFor y *ngIf */
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonList, IonItem,
  IonLabel, IonAvatar, IonBadge, IonButtons, IonMenuButton
} from '@ionic/angular/standalone';

type Paciente = { id: number; nombre: string; rut: string; edad: number; alerta?: string; };

@Component({
  selector: 'app-pacientes',
  standalone: true,
  /* 👇 agrega NgFor y NgIf en imports */
  imports: [
    FormsModule, NgFor, NgIf,
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonList, IonItem,
    IonLabel, IonAvatar, IonBadge, IonButtons, IonMenuButton
  ],
  templateUrl: './pacientes.page.html',
  styleUrls: ['./pacientes.page.scss']
})
export class PacientesPage {
  constructor(private router: Router) {}

  query = '';
  pacientes: Paciente[] = [
    { id: 1, nombre: 'María López', rut: '12.345.678-9', edad: 42, alerta: 'Alergia a penicilina' },
    { id: 2, nombre: 'Pedro González', rut: '9.876.543-2', edad: 66 },
    { id: 3, nombre: 'Ana Silva', rut: '18.234.567-1', edad: 29, alerta: 'HTA' },
  ];

  get filtrados() {
    const q = this.query.toLowerCase();
    return this.pacientes.filter(p => p.nombre.toLowerCase().includes(q) || p.rut.includes(this.query));
  }

  abrirFicha(p: Paciente) {
    this.router.navigate(['/paciente', p.id]);
  }
}
