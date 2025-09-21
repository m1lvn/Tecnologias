import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Patient {
  id: string;
  name: string;
  rut: string;
  age: number;
  room: string;
  status: string;
  statusColor: string;
  diagnosis: string;
  phone: string;
  lastVisit: string;
}

@Component({
  selector: 'app-tab2',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  searchTerm: string = '';
  
  // Datos de pacientes basados en la imagen
  patients: Patient[] = [
    {
      id: '1',
      name: 'María González Pérez',
      rut: '12.345.678-9',
      age: 45,
      room: 'Hab. 203',
      status: 'Estable',
      statusColor: 'success',
      diagnosis: 'Hipertensión arterial',
      phone: '+56 9 8765 4321',
      lastVisit: '2024-01-15'
    },
    {
      id: '2',
      name: 'Juan Carlos Ruiz',
      rut: '11.222.333-4',
      age: 62,
      room: 'Box 4',
      status: 'Activo',
      statusColor: 'primary',
      diagnosis: 'Diabetes mellitus tipo 2',
      phone: '+56 9 1234 5678',
      lastVisit: '2024-01-20'
    },
    {
      id: '3',
      name: 'Ana López Silva',
      rut: '15.678.901-2',
      age: 34,
      room: 'Hab. 105',
      status: 'Crítico',
      statusColor: 'danger',
      diagnosis: 'Neumonía adquirida en comunidad',
      phone: '+56 9 9876 5432',
      lastVisit: '2024-01-18'
    },
    {
      id: '4',
      name: 'Carlos Martínez',
      rut: '18.456.789-0',
      age: 28,
      room: 'Box 2',
      status: 'En observación',
      statusColor: 'warning',
      diagnosis: 'Fractura de radio distal',
      phone: '+56 9 5555 4444',
      lastVisit: '2024-01-22'
    },
    {
      id: '5',
      name: 'Elena Rodriguez',
      rut: '14.789.123-6',
      age: 56,
      room: 'Hab. 301',
      status: 'Estable',
      statusColor: 'success',
      diagnosis: 'Post operatorio apendicectomía',
      phone: '+56 9 3333 2222',
      lastVisit: '2024-01-19'
    },
    {
      id: '6',
      name: 'Roberto Silva',
      rut: '16.543.210-8',
      age: 71,
      room: 'UCI 1',
      status: 'Crítico',
      statusColor: 'danger',
      diagnosis: 'Infarto agudo al miocardio',
      phone: '+56 9 1111 0000',
      lastVisit: '2024-01-21'
    }
  ];

  filteredPatients: Patient[] = [];

  constructor() {
    this.filteredPatients = [...this.patients];
  }

  // Funcionalidad de búsqueda
  onSearchChange(event: any) {
    const searchTerm = event.detail.value.toLowerCase();
    this.searchTerm = searchTerm;
    
    if (!searchTerm.trim()) {
      this.filteredPatients = [...this.patients];
      return;
    }

    this.filteredPatients = this.patients.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm) ||
      patient.rut.toLowerCase().includes(searchTerm) ||
      patient.diagnosis.toLowerCase().includes(searchTerm) ||
      patient.room.toLowerCase().includes(searchTerm)
    );
  }

  // Navegación a ficha del paciente
  onViewPatient(patient: Patient) {
    console.log('Viendo ficha del paciente:', patient);
    // TODO: Implementar navegación a Tab3 con datos del paciente
    // this.router.navigate(['/tabs/tab3'], { queryParams: { patientId: patient.id } });
  }

  // Navegación entre tabs
  onTabClick(tabName: string) {
    console.log(`Navegando a ${tabName}...`);
    // TODO: Implementar navegación entre tabs
  }

  // Métodos auxiliares
  getStatusIcon(status: string): string {
    switch (status) {
      case 'Crítico': return 'warning';
      case 'Estable': return 'checkmark-circle';
      case 'Activo': return 'pulse';
      case 'En observación': return 'eye';
      default: return 'help-circle';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL');
  }

  // Método para trackBy en *ngFor (optimización)
  trackByPatient(index: number, patient: Patient): string {
    return patient.id;
  }
}
