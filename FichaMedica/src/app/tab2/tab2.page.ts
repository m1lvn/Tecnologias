import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonSearchbar, IonList, IonItem, IonIcon, IonBadge, IonButton
} from '@ionic/angular/standalone';
import { NgFor, NgIf, NgClass } from '@angular/common';

type Paciente = {
  nombre: string;
  rut: string;
  edad: number;
  ubicacion: string;
  estado: 'Estable' | 'Activo' | 'Crítico';
  diagnostico: string;
  telefono: string;
  ultimaVisita: string; // YYYY-MM-DD
};

@Component({
  selector: 'app-tab2',
  standalone: true,
  imports: [
    IonContent, IonSearchbar, IonList, IonItem, IonIcon, IonBadge, IonButton,
    NgFor, NgIf, NgClass
  ],
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})
export class Tab2Page {

  constructor(private router: Router) {}

  // Navegación
  goBack()    { this.router.navigateByUrl('/tabs/tab1'); }
  verFicha(p: Paciente) { this.router.navigateByUrl('/tabs/tab3'); } // ajusta ruta

  // Acciones del header (demo)
  addPaciente() { /* abre modal/route de alta */ }
  exportar()    { /* export CSV/PDF */ }

  // Búsqueda
  query = '';
  onSearch(ev: any) { this.query = (ev?.detail?.value || '').toLowerCase().trim(); }

  // Datos demo
  pacientes: Paciente[] = [
    {
      nombre: 'María González Pérez',
      rut: '12.345.678-9',
      edad: 45,
      ubicacion: 'Hab. 203',
      estado: 'Estable',
      diagnostico: 'Hipertensión arterial',
      telefono: '+56 9 8765 4321',
      ultimaVisita: '2024-01-15'
    },
    {
      nombre: 'Juan Carlos Ruiz',
      rut: '11.222.333-4',
      edad: 62,
      ubicacion: 'Box 4',
      estado: 'Activo',
      diagnostico: 'Diabetes mellitus tipo 2',
      telefono: '+56 9 1234 5678',
      ultimaVisita: '2024-01-20'
    },
    {
      nombre: 'Ana López Silva',
      rut: '15.678.901-2',
      edad: 34,
      ubicacion: 'Hab. 105',
      estado: 'Crítico',
      diagnostico: 'Neumonía adquirida en comunidad',
      telefono: '+56 9 9876 5432',
      ultimaVisita: '2024-01-21'
    }
  ];

  get filtered(): Paciente[] {
    if (!this.query) return this.pacientes;
    return this.pacientes.filter(p =>
      `${p.nombre} ${p.rut} ${p.diagnostico} ${p.ubicacion} ${p.estado}`.toLowerCase().includes(this.query)
    );
  }

  get total(): number { return this.filtered.length; }

  // Avatar con iniciales
  initials(nombre: string): string {
    const parts = nombre.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last  = parts[parts.length - 1]?.[0] ?? '';
    return (first + last).toUpperCase();
  }

  estadoClass(estado: Paciente['estado']) {
    return {
      'badge-estable': estado === 'Estable',
      'badge-activo' : estado === 'Activo',
      'badge-critico': estado === 'Crítico',
    };
  }
}
