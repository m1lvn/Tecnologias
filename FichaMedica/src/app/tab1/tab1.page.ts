import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {

  // Stats data matching the original design
  stats = [
    {
      title: 'Pacientes Activos',
      value: '42',
      subtitle: '28 hospitalizados, 14 ambulatorios',
      icon: 'people-outline',
      colorClass: 'green'
    },
    {
      title: 'Consultas del Día',
      value: '18',
      subtitle: 'Cardiología: 6, Medicina: 8, Pediatría: 4',
      icon: 'calendar-outline',
      colorClass: 'blue'
    },
    {
      title: 'Boxes Disponibles',
      value: '3/8',
      subtitle: '5 boxes ocupados',
      icon: 'bed-outline',
      colorClass: 'orange'
    },
    {
      title: 'Alertas Activas',
      value: '7',
      subtitle: '2 críticos, 5 moderados',
      icon: 'warning-outline',
      colorClass: 'red'
    }
  ];

  // Critical alerts data
  criticalAlerts = [
    {
      patient: 'María González',
      alert: 'Alergia severa a penicilina',
      type: 'critical',
      time: '10:30 AM',
      chipColor: 'danger'
    },
    {
      patient: 'Juan Pérez',
      alert: 'Resultados de laboratorio críticos',
      type: 'critical',
      time: '09:15 AM',
      chipColor: 'danger'
    },
    {
      patient: 'Ana López',
      alert: 'Signos vitales alterados',
      type: 'warning',
      time: '11:45 AM',
      chipColor: 'warning'
    }
  ];

  // Recent patients data
  recentPatients = [
    {
      name: 'Carlos Ruiz',
      room: 'Hab. 203',
      condition: 'Estable',
      lastUpdate: 'Hace 15 min',
      chipColor: 'primary'
    },
    {
      name: 'Elena Morales',
      room: 'Box 4',
      condition: 'En observación',
      lastUpdate: 'Hace 30 min',
      chipColor: 'success'
    },
    {
      name: 'Roberto Silva',
      room: 'Hab. 105',
      condition: 'Crítico',
      lastUpdate: 'Hace 5 min',
      chipColor: 'danger'
    }
  ];

  // Quick actions data
  quickActions = [
    {
      icon: 'add-outline',
      label: 'Nuevo Paciente',
      action: 'onAgregarPaciente',
      isPrimary: true
    },
    {
      icon: 'document-text-outline',
      label: 'Fichas Recientes',
      action: 'onAbrirUltimaFicha',
      isPrimary: false
    },
    {
      icon: 'heart-outline',
      label: 'Signos Vitales',
      action: 'onSignosVitales',
      isPrimary: false
    },
    {
      icon: 'flask-outline',
      label: 'Exámenes',
      action: 'onExamenes',
      isPrimary: false
    }
  ];

  constructor() {}

  // Action methods
  onAgregarPaciente() {
    console.log('Navegando a nuevo paciente...');
    // TODO: Implementar navegación a formulario de nuevo paciente
  }

  onAbrirUltimaFicha() {
    console.log('Abriendo fichas recientes...');
    // TODO: Implementar navegación a lista de fichas recientes
  }

  onSignosVitales() {
    console.log('Navegando a signos vitales...');
    // TODO: Implementar navegación a signos vitales
  }

  onExamenes() {
    console.log('Navegando a exámenes...');
    // TODO: Implementar navegación a exámenes
  }

  // Navigation methods for dashboard tabs
  onTabClick(tabName: string) {
    console.log(`Navegando a ${tabName}...`);
    // TODO: Implementar navegación entre tabs
  }

  // Utility method to get alert type display name
  getAlertTypeDisplay(type: string): string {
    return type === 'critical' ? 'Crítico' : 'Moderado';
  }

  // Method to handle alert item click
  onAlertClick(alert: any) {
    console.log('Alert clicked:', alert);
    // TODO: Implementar navegación a detalle de alerta
  }

  // Method to handle patient item click
  onPatientClick(patient: any) {
    console.log('Patient clicked:', patient);
    // TODO: Implementar navegación a ficha del paciente
  }
}
