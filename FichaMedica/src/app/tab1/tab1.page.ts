import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule], // ← NECESARIO p/ *ngFor y ion-*
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  @ViewChild('carousel', { static: true }) carouselRef!: ElementRef<HTMLDivElement>;

  activeIndex = 0;
  transform = 'translateX(0%)';
  private slidesCount = 2;

  // KPIs
  kpis = [
    { title: 'Pacientes nuevos (24h)', value: 32, sub: '+12% vs. ayer', color: 'kpi-green' },
    { title: 'Consultas de hoy', value: 38, sub: '12 pendientes', color: 'kpi-blue' },
    { title: 'Exámenes por informar', value: 15, sub: '5 críticos', color: 'kpi-amber' },
    { title: 'Alertas clínicas', value: 7, sub: '3 alergias severas', color: 'kpi-rose' },
  ];

  topAlergias = [
    { nombre: 'Penicilina', casos: 42 },
    { nombre: 'AINEs', casos: 26 },
    { nombre: 'Mariscos', casos: 19 },
  ];

  insumos = [
    { nombre: 'Guantes Nitrilo', cantidad: '1.2k' },
    { nombre: 'Gasas estériles', cantidad: '780' },
    { nombre: 'Suero fisiológico', cantidad: '640' },
  ];

  citas = [
    { hora: '09:00', paciente: 'Ana Gómez', medico: 'Dr. Pérez' },
    { hora: '10:15', paciente: 'Marco Díaz', medico: 'Dra. Silva' },
    { hora: '11:30', paciente: 'Laura Rojas', medico: 'Dr. Soto' },
  ];

  examenes = [
    { nombre: 'Espirometría', paciente: 'Ana Gómez' },
    { nombre: 'Rx Tórax', paciente: 'Marco Díaz' },
    { nombre: 'Hemograma', paciente: 'Laura Rojas' },
  ];

  next() { this.go((this.activeIndex + 1) % this.slidesCount); }
  prev() { this.go((this.activeIndex - 1 + this.slidesCount) % this.slidesCount); }
  go(i: number) {
    this.activeIndex = i;
    this.transform = `translateX(-${i * 100}%)`;
  }

  // Acciones (conéctalas a tus rutas/servicios)
  onBuscarMedico() {}
  onDisponibilidad() {}
  onAgregarPaciente() {}
  onAbrirUltimaFicha() {}
  onVerAlertas() {}
  onAgendar() {}
  onNuevaOrden() {}
}
