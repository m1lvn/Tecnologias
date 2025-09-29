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
  // Campos obligatorios para el backend
  telefono: string;
  email: string;
  direccion: string;
  fechaNacimiento: Date | string;
  genero: string;
  estadoCivil: string;
  ocupacion: string;
  // Campos opcionales para compatibilidad
  rut?: string;
  edad?: number;
  ubicacion?: string;
  estado: Estado;
  diagnostico?: string;
  ultimaVisita?: string;
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
      telefono: patient.telefono,
      email: patient.email,
      direccion: patient.direccion,
      fechaNacimiento: patient.fechaNacimiento,
      genero: patient.genero,
      estadoCivil: patient.estadoCivil,
      ocupacion: patient.ocupacion,
      // Campos calculados/opcionales
      rut: patient.documento, // Para compatibilidad con template
      edad: this.calculateAge(patient.fechaNacimiento),
      ubicacion: 'Sin asignar', // Campo no disponible en backend
      estado: patient.estado,
      diagnostico: patient.antecedentes?.[0] || 'Sin diagnóstico',
      ultimaVisita: this.formatDate(patient.fechaActualizacion)
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
    console.log('openCreate() llamado');
    this.newPaciente = this.blankPaciente();
    this.error = null; // Limpiar errores previos
    this.isCreateOpen = true;
    console.log('Modal abierto, newPaciente inicializado:', this.newPaciente);
  }
  
  closeCreate() { 
    console.log('closeCreate() llamado');
    this.isCreateOpen = false; 
    this.error = null;
  }

  // Método de prueba simple
  testButton() {
    console.log('¡Botón funciona!');
    alert('¡El botón responde correctamente!');
  }

  saveCreate() {
    console.log('saveCreate() llamado');
    console.log('Datos del formulario:', this.newPaciente);
    
    const p = this.newPaciente;
    
    // Validaciones completas
    if (!p.nombres?.trim()) {
      this.error = 'El campo nombres es obligatorio';
      return;
    }
    if (!p.apellidos?.trim()) {
      this.error = 'El campo apellidos es obligatorio';
      return;
    }
    if (!p.documento?.trim()) {
      this.error = 'El campo documento es obligatorio';
      return;
    }
    if (!p.telefono?.trim()) {
      this.error = 'El campo teléfono es obligatorio';
      return;
    }
    if (!p.email?.trim()) {
      this.error = 'El campo email es obligatorio';
      return;
    }
    if (!p.direccion?.trim()) {
      this.error = 'El campo dirección es obligatorio';
      return;
    }
    if (!p.ocupacion?.trim()) {
      this.error = 'El campo ocupación es obligatorio';
      return;
    }
    if (!p.fechaNacimiento) {
      this.error = 'El campo fecha de nacimiento es obligatorio';
      return;
    }

    // Limpiar error previo
    this.error = null;
    
    console.log('Validaciones pasadas, preparando request...');

    // Preparar datos para el backend
    const createRequest: CreatePatientRequest = {
      nombres: p.nombres.trim(),
      apellidos: p.apellidos.trim(),
      documento: p.documento.trim(),
      tipoDocumento: (p.tipoDocumento as 'CC' | 'TI' | 'CE' | 'PP' | 'RC') || 'CC',
      telefono: p.telefono.trim(),
      email: p.email.trim(),
      direccion: p.direccion.trim(),
      ocupacion: p.ocupacion.trim(),
      fechaNacimiento: new Date(p.fechaNacimiento),
      genero: (p.genero as 'M' | 'F' | 'Otro') || 'Otro',
      estadoCivil: (p.estadoCivil as 'soltero' | 'casado' | 'divorciado' | 'viudo' | 'union_libre') || 'soltero',
      contactoEmergencia: {
        nombre: 'Contacto por definir',
        telefono: p.telefono.trim(),
        relacion: 'Por definir'
      },
      alergias: [],
      medicamentos: [],
      antecedentes: p.diagnostico ? [p.diagnostico] : [],
      grupoSanguineo: 'O+',
      eps: 'Particular'
    };

    console.log('Request preparado:', createRequest);
    console.log('Enviando al backend...');

    this.subscriptions.push(
      this.patientService.createPatient(createRequest).subscribe({
        next: (newPatient) => {
          console.log('Respuesta del backend exitosa:', newPatient);
          if (newPatient) {
            // Recargar la lista completa para asegurar que se muestre el nuevo paciente
            this.loadPatients(1);
            
            // Cerrar modal y limpiar error
            this.closeCreate();
            this.error = null;
            
            console.log('Paciente creado exitosamente y modal cerrado');
          } else {
            console.log('newPatient es null');
            this.error = 'Error: No se pudo crear el paciente';
          }
        },
        error: (error) => {
          console.error('Error al crear paciente:', error);
          console.error('Error details:', error.error);
          
          // Mostrar detalles específicos del error
          if (error.error?.details) {
            const errorMessages = error.error.details.map((detail: any) => detail.msg || detail.message).join(', ');
            this.error = `Errores de validación: ${errorMessages}`;
          } else {
            this.error = error?.error?.message || error?.message || 'Error al crear el paciente';
          }
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
      telefono: '',
      email: '',
      direccion: '',
      fechaNacimiento: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
      genero: 'Otro',
      estadoCivil: 'soltero',
      ocupacion: '',
      // Campos opcionales
      rut: '',
      edad: 0,
      ubicacion: '',
      estado: 'activo',
      diagnostico: '',
      ultimaVisita: ''
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