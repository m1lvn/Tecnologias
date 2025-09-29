import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  // Base / listas
  IonContent, IonList, IonItem,
  // Inputs
  IonSearchbar, IonInput, IonTextarea, IonSelect, IonSelectOption,
  // UI
  IonIcon, IonBadge, IonButton, IonAvatar, IonLabel,
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonSpinner, IonToast
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { PatientService } from '../services/patient.service';
import { Patient, CreatePatientRequest } from '../models/patient.model';
import { Subscription } from 'rxjs';
export interface PatientListResponse {
  patients: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

type Estado = 'activo' | 'inactivo';

export type Paciente = {
  id?: string;
  nombres: string;
  apellidos: string;
  documento: string;
  tipoDocumento: string;
  rut?: string; // Para compatibilidad con el template
  edad?: number;
  ubicacion?: string;
  estado: Estado;
  diagnostico?: string;
  telefono: string;
  email: string;
  ultimaVisita?: string;
  fechaNacimiento?: Date;
  genero?: string;
  direccion?: string;
  ocupacion?: string;
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
    IonSpinner, IonToast,
    // Angular
    FormsModule, NgFor, NgClass, NgIf
  ],
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})
export class Tab2Page implements OnInit, OnDestroy {
  // Estados del componente
  pacientes: Paciente[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Búsqueda y paginación
  query = '';
  currentPage = 1;
  totalPages = 1;
  totalPatients = 0;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private patientService: PatientService
  ) {}

  ngOnInit() {
    this.loadPatients();
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Configurar suscripciones reactivas
   */
  private setupSubscriptions() {
    this.subscriptions.push(
      this.patientService.loading$.subscribe(loading => {
        this.isLoading = loading;
      }),
      
      this.patientService.error$.subscribe(error => {
        this.error = error;
      })
    );
  }

  /**
   * Cargar pacientes desde el backend
   */
  loadPatients(page: number = 1, search?: string) {
    this.currentPage = page;
    
    this.subscriptions.push(
      this.patientService.getPatients(page, 20, search).subscribe({
        next: (response) => {
          // Transformar datos del backend al formato esperado por la UI
          this.pacientes = response.patients.map(this.transformPatient);
          this.totalPages = response.pagination.totalPages;
          this.totalPatients = response.pagination.total;
          this.error = null;
        },
        error: (error) => {
          console.error('Error loading patients:', error);
          this.error = 'Error al cargar los pacientes';
        }
      })
    );
  }

  /**
   * Transformar Patient del backend al formato Paciente de la UI
   */
  private transformPatient = (patient: Patient): Paciente => {
    return {
      id: patient.id,
      nombres: patient.nombres,
      apellidos: patient.apellidos,
      documento: patient.documento,
      tipoDocumento: patient.tipoDocumento,
      rut: patient.documento, // Para compatibilidad con template
      edad: this.calculateAge(patient.fechaNacimiento),
      ubicacion: 'Sin asignar', // Campo no disponible en backend
      estado: patient.estado,
      diagnostico: patient.antecedentes?.[0] || 'Sin diagnóstico',
      telefono: patient.telefono,
      email: patient.email,
      ultimaVisita: this.formatDate(patient.fechaActualizacion),
      fechaNacimiento: patient.fechaNacimiento,
      genero: patient.genero,
      direccion: patient.direccion,
      ocupacion: patient.ocupacion
    };
  };

  /**
   * Calcular edad a partir de fecha de nacimiento
   */
  private calculateAge(fechaNacimiento?: Date): number {
    if (!fechaNacimiento) return 0;
    const birth = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Formatear fecha para visualización
   */
  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-CL');
  }

  // ---------- Navegación ----------
  goBack() { 
    this.router.navigateByUrl('/tabs/tab1'); 
  }
  
  verFicha(paciente: Paciente) { 
    this.router.navigate(['/tabs/tab3'], { 
      queryParams: { patientId: paciente.id } 
    }); 
  }

  // ---------- Búsqueda ----------
  onSearch(ev: any) { 
    this.query = (ev?.detail?.value || '').toLowerCase().trim();
    this.loadPatients(1, this.query || undefined);
  }

  get filtered(): Paciente[] {
    // La filtración ahora se hace en el backend
    return this.pacientes;
  }

  get total(): number { 
    return this.totalPatients; 
  }

  // ---------- Utilidades UI ----------
  initials(nombre: string): string {
    const parts = nombre.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last  = parts[parts.length - 1]?.[0] ?? '';
    return (first + last).toUpperCase();
  }

  estadoClass(estado: Estado) {
    return {
      'badge-estable': estado === 'activo',
      'badge-activo' : estado === 'activo',
      'badge-critico': estado === 'inactivo',
    };
  }

  // ============== CREAR PACIENTE (Modal) ==============
  isCreateOpen = false;
  newPaciente: Paciente = this.blankPaciente();

  openCreate() {
    this.newPaciente = this.blankPaciente();
    this.isCreateOpen = true;
  }
  
  closeCreate() { 
    this.isCreateOpen = false; 
  }

  saveCreate() {
    const p = this.newPaciente;
    if (!p.nombres?.trim() || !p.documento?.trim()) {
      this.error = 'Nombre y documento son obligatorios';
      return;
    }

    // Preparar datos para el backend
    const createRequest: CreatePatientRequest = {
      nombres: p.nombres,
      apellidos: p.apellidos || '',
      documento: p.documento,
      tipoDocumento: (p.tipoDocumento as 'CC' | 'TI' | 'CE' | 'PP' | 'RC') || 'CC',
      telefono: p.telefono || '',
      email: p.email || '',
      fechaNacimiento: p.fechaNacimiento || new Date(),
      genero: (p.genero as 'M' | 'F' | 'Otro') || 'Otro',
      estadoCivil: 'soltero',
      ocupacion: p.ocupacion || '',
      direccion: p.direccion || '',
      contactoEmergencia: {
        nombre: 'No especificado',
        telefono: '',
        relacion: 'No especificado'
      },
      alergias: [],
      medicamentos: [],
      antecedentes: [],
      grupoSanguineo: 'O+',
      eps: 'Particular'
    };

    this.subscriptions.push(
      this.patientService.createPatient(createRequest).subscribe({
        next: (newPatient) => {
          if (newPatient) {
            // Agregar al inicio de la lista local
            const transformedPatient = this.transformPatient(newPatient);
            this.pacientes = [transformedPatient, ...this.pacientes];
            
            // Cerrar modal y limpiar búsqueda
            this.closeCreate();
            this.query = '';
            this.error = null;
          }
        },
        error: (error) => {
          console.error('Error creating patient:', error);
          this.error = 'Error al crear el paciente';
        }
      })
    );
  }

  private today(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  private blankPaciente(): Paciente {
    return {
      nombres: '',
      apellidos: '',
      documento: '',
      tipoDocumento: 'CC',
      rut: '',
      edad: 0,
      ubicacion: '',
      estado: 'activo',
      diagnostico: '',
      telefono: '',
      email: '',
      ultimaVisita: '',
      genero: 'Otro',
      direccion: '',
      ocupacion: ''
    };
  }

  // ============== EXPORTAR (CSV) ==============
  exportar() {
    const header = ['Nombre','Apellidos','Documento','Teléfono','Email','Estado','Diagnóstico','Última visita'];
    const rows = this.filtered.map(p => [
      p.nombres, p.apellidos, p.documento, p.telefono, p.email, p.estado, p.diagnostico, p.ultimaVisita
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

  // ============== PAGINACIÓN ==============
  previousPage() {
    if (this.currentPage > 1) {
      this.loadPatients(this.currentPage - 1, this.query || undefined);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.loadPatients(this.currentPage + 1, this.query || undefined);
    }
  }

  // ============== REFRESCAR ==============
  refreshPatients() {
    this.loadPatients(this.currentPage, this.query || undefined);
  }

  // ============== ELIMINAR ERROR ==============
  clearError() {
    this.error = null;
  }
}