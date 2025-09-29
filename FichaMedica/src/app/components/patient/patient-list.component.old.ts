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
// ✅ Iconos ahora registrados globalmente en app.component.ts
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { PatientService } from '../../services/patient.service';
import { Patient, PatientListResponse } from '../../models/patient.model';

import { PatientService } from '../../services/patient.service';
import { IPatient } from '../../models';

// Tipo para eventos de Ionic
interface IonicSelectChangeEvent {
  detail: {
    value: any;
  };
}

interface PatientListFilter {
  searchTerm: string;
  activo: boolean | 'all';
  sortBy: 'name' | 'fechaRegistro' | 'ultimaVisita';
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem,
    IonLabel, IonButton, IonIcon, IonSearchbar, IonFab, IonFabButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonBadge,
    IonAlert, IonToast, IonRefresher, IonRefresherContent,
    IonGrid, IonRow, IonCol, IonChip, IonAvatar, IonSkeletonText,
    IonSelect, IonSelectOption
  ]
})
export class PatientListComponent implements OnInit {
  // Reactive data streams
  patients$ = this.patientService.patients$;
  loading$ = this.patientService.loading$;
  error$ = this.patientService.error$;

  // Filter state
  private filterSubject = new BehaviorSubject<PatientListFilter>({
    searchTerm: '',
    activo: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  filter$ = this.filterSubject.asObservable();

  // Filtered and sorted patients
  filteredPatients$: Observable<IPatient[]>;

  // UI state
  isAlertOpen = false;
  isToastOpen = false;
  toastMessage = '';
  selectedPatientId = '';
  showFilters = false;

  // Alert buttons
  alertButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
      handler: () => { this.isAlertOpen = false; }
    },
    {
      text: 'Eliminar',
      role: 'destructive',
      handler: () => { this.handleDeleteConfirm(); }
    }
  ];

  // Statistics
  patientStats$ = this.patients$.pipe(
    map(patients => ({
      total: patients.length,
      active: patients.filter(p => p.activo === true).length,
      inactive: patients.filter(p => p.activo === false).length,
      withInsurance: patients.filter(p => p.insuranceInfo?.vigente === true).length
    }))
  );

  constructor(
    private patientService: PatientService,
    private formBuilder: FormBuilder
  ) {
    // ✅ Los iconos ya están registrados globalmente en app.component.ts
    // addIcons({
    //   personAddOutline, searchOutline, createOutline, trashOutline,
    //   callOutline, mailOutline, locationOutline, medicalOutline,
    //   refreshOutline, filterOutline
    // });

    // Setup filtered patients stream
    this.filteredPatients$ = combineLatest([
      this.patients$,
      this.filter$
    ]).pipe(
      map(([patients, filter]) => this.applyFilters(patients, filter))
    );
  }

  ngOnInit() {
    this.loadPatients();
  }

  // Data loading methods
  loadPatients() {
    try {
      this.patientService.getPatients().subscribe();
    } catch (error) {
      this.showToast('Error al cargar pacientes');
    }
  }

  async doRefresh(event: any) {
    try {
      this.patientService.getPatients().subscribe(() => {
        this.showToast('Lista actualizada');
        event.target.complete();
      });
    } catch (error) {
      this.showToast('Error al actualizar');
      event.target.complete();
    }
  }

  // Filter and search methods
  private applyFilters(patients: IPatient[], filter: PatientListFilter): IPatient[] {
    let filtered = [...patients];

    // Apply search filter
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.personalInfo.nombre.toLowerCase().includes(searchLower) ||
        patient.personalInfo.apellido.toLowerCase().includes(searchLower) ||
        patient.personalInfo.rut.includes(filter.searchTerm) ||
        (patient.personalInfo.email && patient.personalInfo.email.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (filter.activo !== 'all') {
      filtered = filtered.filter(patient => patient.activo === filter.activo);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filter.sortBy) {
        case 'name':
          const nameA = `${a.personalInfo.nombre} ${a.personalInfo.apellido}`;
          const nameB = `${b.personalInfo.nombre} ${b.personalInfo.apellido}`;
          comparison = nameA.localeCompare(nameB);
          break;
        case 'fechaRegistro':
          comparison = new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime();
          break;
        case 'ultimaVisita':
          const lastVisitA = a.ultimaVisita ? new Date(a.ultimaVisita).getTime() : 0;
          const lastVisitB = b.ultimaVisita ? new Date(b.ultimaVisita).getTime() : 0;
          comparison = lastVisitA - lastVisitB;
          break;
      }

      return filter.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }

  onSearchChange(event: any) {
    const searchTerm = event.target.value;
    this.updateFilter({ searchTerm });
  }

  onStatusFilterChange(event: IonicSelectChangeEvent) {
    const activo = event.detail.value;
    this.updateFilter({ activo });
  }

  onSortChange(event: IonicSelectChangeEvent) {
    const sortBy = event.detail.value;
    const currentFilter = this.filterSubject.value;
    const sortOrder = currentFilter.sortBy === sortBy && currentFilter.sortOrder === 'asc' 
      ? 'desc' : 'asc';
    this.updateFilter({ sortBy, sortOrder });
  }

  private updateFilter(changes: Partial<PatientListFilter>) {
    const currentFilter = this.filterSubject.value;
    this.filterSubject.next({ ...currentFilter, ...changes });
  }

  // Patient actions
  async deletePatient(patientId: string) {
    try {
      await this.patientService.deletePatient(patientId).toPromise();
      this.showToast('Paciente eliminado correctamente');
    } catch (error) {
      this.showToast('Error al eliminar paciente');
    }
  }

  confirmDelete(patientId: string) {
    this.selectedPatientId = patientId;
    this.isAlertOpen = true;
  }

  async handleDeleteConfirm() {
    if (this.selectedPatientId) {
      await this.deletePatient(this.selectedPatientId);
      this.selectedPatientId = '';
    }
    this.isAlertOpen = false;
  }

  // Utility methods
  getPatientFullName(patient: IPatient): string {
    return `${patient.personalInfo.nombre} ${patient.personalInfo.apellido}`;
  }

  getPatientAge(patient: IPatient): number {
    const today = new Date();
    const birthDate = new Date(patient.personalInfo.fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getStatusColor(activo: boolean): string {
    return activo ? 'success' : 'medium';
  }

  getStatusText(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatRut(rut: string): string {
    // Formatear RUT chileno: 12.345.678-9
    const clean = rut.replace(/[^0-9kK]/g, '');
    if (clean.length < 2) return rut;
    
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);
    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formatted}-${dv}`;
  }

  // UI helpers
  showToast(message: string) {
    this.toastMessage = message;
    this.isToastOpen = true;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  // Navigation helpers (to be implemented with router)
  navigateToPatientDetail(patientId: string) {
    // TODO: Implement navigation to patient detail
    console.log('Navigate to patient:', patientId);
  }

  navigateToEditPatient(patientId: string) {
    // TODO: Implement navigation to edit patient
    console.log('Edit patient:', patientId);
  }

  navigateToNewPatient() {
    // TODO: Implement navigation to new patient form
    console.log('Navigate to new patient form');
  }
}