import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  // Base / listas
  IonContent, IonList, IonItem,
  // Inputs
  IonSearchbar, IonInput, IonTextarea, IonSelect, IonSelectOption,
  // UI
  IonIcon, IonBadge, IonButton, IonAvatar, IonLabel,
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { NgFor, NgClass } from '@angular/common';

type Estado = 'Estable' | 'Activo' | 'Crítico';

export type Paciente = {
  nombre: string;
  rut: string;
  edad: number;
  ubicacion: string;
  estado: Estado;
  diagnostico: string;
  telefono: string;
  ultimaVisita: string; // YYYY-MM-DD
};

@Component({
  selector: 'app-tab2',
  standalone: true,
  imports: [
    // Ionic usados en el HTML
    IonContent, IonList, IonItem,
    IonSearchbar, IonInput, IonTextarea, IonSelect, IonSelectOption,
    IonIcon, IonBadge, IonButton, IonAvatar, IonLabel,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons,
    // Angular
    FormsModule, NgFor, NgClass
  ],
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})
export class Tab2Page {

  constructor(private router: Router) {}

  // ---------- Navegación ----------
  goBack() { this.router.navigateByUrl('/tabs/tab1'); }
  verFicha(_p: Paciente) { this.router.navigateByUrl('/tabs/tab3'); }

  // ---------- Búsqueda ----------
  query = '';
  onSearch(ev: any) { this.query = (ev?.detail?.value || '').toLowerCase().trim(); }

  // ---------- Datos demo ----------
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
      `${p.nombre} ${p.rut} ${p.diagnostico} ${p.ubicacion} ${p.estado}`
        .toLowerCase()
        .includes(this.query)
    );
  }

  get total(): number { return this.filtered.length; }

  // ---------- Utilidades UI ----------
  initials(nombre: string): string {
    const parts = nombre.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last  = parts[parts.length - 1]?.[0] ?? '';
    return (first + last).toUpperCase();
  }

  estadoClass(estado: Estado) {
    return {
      'badge-estable': estado === 'Estable',
      'badge-activo' : estado === 'Activo',
      'badge-critico': estado === 'Crítico',
    };
  }

  // ============== CREAR PACIENTE (Modal) ==============
  isCreateOpen = false;
  newPaciente: Paciente = this.blankPaciente();

  openCreate() {
    this.newPaciente = this.blankPaciente();
    this.isCreateOpen = true;
  }
  closeCreate() { this.isCreateOpen = false; }

  saveCreate() {
    const p = this.newPaciente;
    if (!p.nombre?.trim() || !p.rut?.trim() || !p.diagnostico?.trim()) return;

    if (!p.ultimaVisita) p.ultimaVisita = this.today();
    if (!p.estado) p.estado = 'Estable';

    // Inserta al INICIO del listado
    this.pacientes = [{ ...p }, ...this.pacientes];

    // Cierra modal y limpia búsqueda para ver el nuevo arriba
    this.closeCreate();
    this.query = '';
  }

  private today(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  private blankPaciente(): Paciente {
    return {
      nombre: '',
      rut: '',
      edad: 0,
      ubicacion: '',
      estado: 'Estable',
      diagnostico: '',
      telefono: '',
      ultimaVisita: ''
    };
  }

  // ============== EXPORTAR (CSV) ==============
  exportar() {
    const header = ['Nombre','RUT','Edad','Ubicación','Estado','Diagnóstico','Teléfono','Última visita'];
    const rows = this.filtered.map(p => [
      p.nombre, p.rut, p.edad, p.ubicacion, p.estado, p.diagnostico, p.telefono, p.ultimaVisita
    ]);

    const toCsv = (r: any[]) => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
    const csv = [toCsv(header), ...rows.map(toCsv)].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pacientes_${this.today()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
