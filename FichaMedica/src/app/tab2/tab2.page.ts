import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonCard, IonCardContent, IonButton, IonIcon, IonBadge, IonItem, IonLabel, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Paciente {
  nombre: string;
  rut: string;
  edad: number;
  diagnosticoPrincipal: string;
  estado: 'Estable' | 'Activo' | 'Crítico';
  habitacion: string;
  telefono: string;
  ultimaVisita: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, 
    IonCard, IonCardContent, IonButton, IonIcon, IonBadge, 
    IonItem, IonLabel, IonGrid, IonRow, IonCol,
    CommonModule, FormsModule
  ]
})
export class Tab2Page {
  searchText: string = '';
  
  pacientes: Paciente[] = [
    {
      nombre: 'María González Pérez',
      rut: '12.345.678-9',
      edad: 45,
      diagnosticoPrincipal: 'Hipertensión arterial',
      estado: 'Estable',
      habitacion: 'Hab. 203',
      telefono: '+56 9 8765 4321',
      ultimaVisita: '2024-01-15'
    },
    {
      nombre: 'Juan Carlos Ruiz',
      rut: '11.222.333-4',
      edad: 62,
      diagnosticoPrincipal: 'Diabetes mellitus tipo 2',
      estado: 'Activo',
      habitacion: 'Box 4',
      telefono: '+56 9 1234 5678',
      ultimaVisita: '2024-01-20'
    },
    {
      nombre: 'Ana López Silva',
      rut: '15.678.901-2',
      edad: 34,
      diagnosticoPrincipal: 'Neumonía adquirida en comunidad',
      estado: 'Crítico',
      habitacion: 'Hab. 105',
      telefono: '+56 9 9876 5432',
      ultimaVisita: '2024-01-21'
    }
  ];

  get pacientesFiltrados() {
    if (!this.searchText) {
      return this.pacientes;
    }
    
    const search = this.searchText.toLowerCase();
    return this.pacientes.filter(paciente => 
      paciente.nombre.toLowerCase().includes(search) ||
      paciente.rut.includes(search) ||
      paciente.diagnosticoPrincipal.toLowerCase().includes(search)
    );
  }

  getEstadoColor(estado: string): string {
    switch(estado) {
      case 'Estable': return 'success';
      case 'Activo': return 'warning';
      case 'Crítico': return 'danger';
      default: return 'medium';
    }
  }

  verFicha(paciente: Paciente) {
    console.log('Ver ficha de:', paciente.nombre);
    // Aquí implementarías la navegación a la ficha individual
  }

  constructor() {}
}
