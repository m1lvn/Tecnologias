import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, 
  IonLabel, IonButton, IonIcon, IonSearchbar, IonFab, IonFabButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonBadge,
  IonAlert, IonToast, IonRefresher, IonRefresherContent,
  IonGrid, IonRow, IonCol, IonChip, IonAvatar, IonSkeletonText,
  IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { PatientService } from '../../services/patient.service';
import { Patient, PatientListResponse } from '../../models/patient.model';

// Interfaces para eventos de componentes Ionic
interface IonicSelectChangeEvent {
  detail: {
    value: any;
  };
}

// Interfaces para filtros y tipos de datos
interface PatientListFilter {
  status?: string;
  insurance?: string;
  bloodType?: string;
  search?: string;
}

interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  withInsurance: number;
}

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Ionic Components
    IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem,
    IonLabel, IonButton, IonIcon, IonSearchbar, IonFab, IonFabButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonBadge,
    IonAlert, IonToast, IonRefresher, IonRefresherContent,
    IonGrid, IonRow, IonCol, IonChip, IonAvatar, IonSkeletonText,
    IonSelect, IonSelectOption
  ],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
  // 🔥 ESTADO REACTIVO
  private allPatientsSubject = new BehaviorSubject<Patient[]>([]);
  private filterSubject = new BehaviorSubject<PatientListFilter>({});
  
  // Observables públicos
  public filteredPatients$: Observable<Patient[]>;
  public patientStats$: Observable<PatientStats>;
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public error$ = new BehaviorSubject<string | null>(null);

  // UI State
  searchTerm = '';
  selectedFilter = 'all';
  
  constructor(
    private patientService: PatientService,
    private formBuilder: FormBuilder
  ) {
    // ✅ Los iconos ya están registrados globalmente en app.component.ts

    // Setup filtered patients stream
    this.filteredPatients$ = combineLatest([
      this.allPatientsSubject.asObservable(),
      this.filterSubject.asObservable()
    ]).pipe(
      map(([patients, filter]) => this.applyFilters(patients, filter))
    );

    // Setup stats stream
    this.patientStats$ = this.allPatientsSubject.asObservable().pipe(
      map(patients => ({
        total: patients.length,
        active: patients.filter(p => p.estado === 'activo').length,
        inactive: patients.filter(p => p.estado === 'inactivo').length,
        withInsurance: patients.filter(p => p.eps && p.eps.trim() !== '').length
      }))
    );
  }

  ngOnInit() {
    this.loadPatients();
    
    // Suscribirse a los observables del servicio
    this.patientService.loading$.subscribe(loading => this.isLoading$.next(loading));
    this.patientService.error$.subscribe(error => this.error$.next(error));
  }

  /**
   * 📋 CARGAR PACIENTES
   */
  loadPatients() {
    this.patientService.getPatients(1, 50).subscribe({
      next: (response: PatientListResponse) => {
        if (response.patients && response.patients.length > 0) {
          this.allPatientsSubject.next(response.patients);
          this.error$.next(null);
        } else {
          // No hay datos - mostrar placeholder
          this.allPatientsSubject.next([]);
          this.error$.next('No se han encontrado pacientes. ¿Has configurado la base de datos?');
        }
      },
      error: (error) => {
        console.error('Error cargando pacientes:', error);
        this.allPatientsSubject.next([]);
        this.error$.next('Error al conectar con el servidor. Verifica que el backend esté corriendo.');
      }
    });
  }

  /**
   * 🔍 BÚSQUEDA Y FILTROS
   */
  onSearchChange(event: any) {
    const searchTerm = event.detail.value || '';
    this.searchTerm = searchTerm;
    this.updateFilter({ search: searchTerm });
  }

  onFilterChange(event: any) {
    this.selectedFilter = event.detail.value;
    this.updateFilter({ status: event.detail.value });
  }

  updateFilter(updates: Partial<PatientListFilter>) {
    const currentFilter = this.filterSubject.value;
    this.filterSubject.next({ ...currentFilter, ...updates });
  }

  private applyFilters(patients: Patient[], filter: PatientListFilter): Patient[] {
    if (!patients) return [];

    return patients.filter(patient => {
      // Filtro de búsqueda por texto
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const fullName = `${patient.nombres} ${patient.apellidos}`.toLowerCase();
        const documento = patient.documento?.toLowerCase() || '';
        const email = patient.email?.toLowerCase() || '';
        
        if (!fullName.includes(searchLower) && 
            !documento.includes(searchLower) && 
            !email.includes(searchLower)) {
          return false;
        }
      }

      // Filtro por estado
      if (filter.status && filter.status !== 'all') {
        if (filter.status === 'active' && patient.estado !== 'activo') return false;
        if (filter.status === 'inactive' && patient.estado !== 'inactivo') return false;
      }

      // Filtro por seguro
      if (filter.insurance && filter.insurance !== 'all') {
        if (filter.insurance === 'with' && (!patient.eps || patient.eps.trim() === '')) return false;
        if (filter.insurance === 'without' && patient.eps && patient.eps.trim() !== '') return false;
      }

      // Filtro por tipo de sangre
      if (filter.bloodType && filter.bloodType !== 'all') {
        if (patient.grupoSanguineo !== filter.bloodType) return false;
      }

      return true;
    });
  }

  /**
   * 🔄 REFRESH
   */
  onRefresh(event: any) {
    this.loadPatients();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  /**
   * ➕ CREAR PACIENTE
   */
  createPatient() {
    // TODO: Implementar navegación a formulario de creación
    console.log('Navegar a crear paciente');
  }

  /**
   * ✏️ EDITAR PACIENTE
   */
  editPatient(patient: Patient) {
    // TODO: Implementar navegación a formulario de edición
    console.log('Editar paciente:', patient.id);
  }

  /**
   * 🗑️ ELIMINAR PACIENTE
   */
  async deletePatient(patient: Patient) {
    // TODO: Implementar confirmación y eliminación
    console.log('Eliminar paciente:', patient.id);
  }

  /**
   * 📞 LLAMAR PACIENTE
   */
  callPatient(phoneNumber: string) {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  }

  /**
   * ✉️ EMAIL PACIENTE
   */
  emailPatient(email: string) {
    if (email) {
      window.open(`mailto:${email}`, '_self');
    }
  }

  /**
   * 🎯 OBTENER INITIALES
   */
  getInitials(nombres: string, apellidos: string): string {
    const firstInitial = nombres ? nombres.charAt(0).toUpperCase() : '';
    const lastInitial = apellidos ? apellidos.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  /**
   * 🏷️ OBTENER COLOR DE ESTADO
   */
  getStatusColor(estado: string): string {
    switch (estado) {
      case 'activo': return 'success';
      case 'inactivo': return 'warning';
      default: return 'medium';
    }
  }

  /**
   * 🩸 OBTENER COLOR DE TIPO DE SANGRE
   */
  getBloodTypeColor(bloodType: string): string {
    if (!bloodType) return 'medium';
    
    if (bloodType.includes('O')) return 'danger';
    if (bloodType.includes('A')) return 'primary';
    if (bloodType.includes('B')) return 'secondary';
    if (bloodType.includes('AB')) return 'tertiary';
    
    return 'medium';
  }

  /**
   * 📅 FORMATEAR FECHA
   */
  formatDate(date: Date | string): string {
    if (!date) return 'No disponible';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * 🧮 CALCULAR EDAD
   */
  calculateAge(birthDate: Date | string): number {
    if (!birthDate) return 0;
    
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * ❌ LIMPIAR ERROR
   */
  clearError() {
    this.error$.next(null);
    this.patientService.clearError();
  }

  /**
   * 🔄 LIMPIAR FILTROS
   */
  clearFilters() {
    this.searchTerm = '';
    this.selectedFilter = 'all';
    this.updateFilter({ search: '', status: 'all' });
  }
}