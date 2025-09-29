import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonBadge, IonButton, 
  IonIcon, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonModal, 
  IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime,
  IonSpinner, IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, create, ban, calendar, time, medical, person, warning, checkmarkCircle } from 'ionicons/icons';
import { Subscription } from 'rxjs';

// Servicios
import { MedicationService, Medication, CreateMedicationRequest } from '../services/medication.service';
import { PatientService } from '../services/patient.service';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonBadge, IonButton, 
    IonIcon, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonModal, 
    IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime,
    IonSpinner, IonToast,
    CommonModule, FormsModule
  ]
})
export class Tab4Page implements OnInit, OnDestroy {
  
  // Estados del componente
  medicamentosActuales: Medication[] = [];
  isLoading = false;
  error: string | null = null;
  patientId: string | null = null;
  
  // Modal para crear medicamento
  isCreateModalOpen = false;
  newMedication: Partial<CreateMedicationRequest> = this.blankMedication();
  
  // Propiedades para compatibilidad con HTML
  nuevoMedicamento: Partial<CreateMedicationRequest> = this.blankMedication();
  
  // Modal para indicaciones
  isModalIndicacionOpen = false;
  nuevaIndicacion = {
    titulo: '',
    tipo: '',
    descripcion: '',
    estado: '',
    fecha: new Date()
  };

  // Propiedades adicionales para el HTML
  alertasInteracciones: any[] = [];
  indicacionesMedicas: any[] = [];
  historialMedicacion: Medication[] = [];
  isModalOpen = false;
  
  // Paginación
  currentPage = 1;
  totalPages = 1;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private medicationService: MedicationService,
    private patientService: PatientService
  ) {
    addIcons({ add, create, ban, calendar, time, medical, person, warning, checkmarkCircle });
  }

  ngOnInit() {
    // Obtener el ID del paciente desde los query params
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        this.patientId = params['patientId'];
        if (this.patientId) {
          this.loadMedications(this.patientId);
        } else {
          this.error = 'No se especificó el ID del paciente';
        }
      })
    );

    this.setupSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSubscriptions() {
    this.subscriptions.push(
      this.medicationService.loading$.subscribe(loading => {
        this.isLoading = loading;
      }),
      this.medicationService.error$.subscribe(error => {
        this.error = error;
      })
    );
  }

  /**
   * Cargar medicamentos del paciente
   */
  loadMedications(patientId: string, page: number = 1) {
    this.currentPage = page;
    
    this.subscriptions.push(
      this.medicationService.getPatientMedications(patientId, page, 20).subscribe({
        next: (response) => {
          this.medicamentosActuales = response.medicamentos;
          this.historialMedicacion = response.medicamentos; // Sincronizar
          this.totalPages = response.pagination.totalPages;
          this.error = null;
        },
        error: (error) => {
          console.error('Error loading medications:', error);
          this.error = 'Error al cargar los medicamentos';
        }
      })
    );
  }

  // ============== NAVEGACIÓN ==============
  goBack() {
    this.router.navigateByUrl('/tabs/tab3');
  }

  verFicha() {
    if (this.patientId) {
      this.router.navigate(['/tabs/tab3'], { 
        queryParams: { patientId: this.patientId } 
      });
    }
  }

  // ============== CREAR MEDICAMENTO ==============
  openCreateModal() {
    this.newMedication = this.blankMedication();
    this.nuevoMedicamento = this.blankMedication();
    this.isCreateModalOpen = true;
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
  }

  // Métodos para compatibilidad con HTML
  abrirModalNuevoMedicamento() {
    this.openCreateModal();
  }

  agregarMedicamento() {
    this.saveMedication();
  }

  abrirModalNuevaIndicacion() {
    this.nuevaIndicacion = {
      titulo: '',
      tipo: '',
      descripcion: '',
      estado: '',
      fecha: new Date()
    };
    this.isModalIndicacionOpen = true;
  }

  cerrarModalIndicacion() {
    this.isModalIndicacionOpen = false;
  }

  agregarIndicacion() {
    // Lógica para agregar indicación
    console.log('Agregando indicación:', this.nuevaIndicacion);
    this.cerrarModalIndicacion();
  }

  // Métodos adicionales para compatibilidad con HTML
  getTipoIndicacionColor(tipo: string): string {
    switch(tipo) {
      case 'critica': return 'danger';
      case 'importante': return 'warning';
      case 'informativa': return 'primary';
      default: return 'medium';
    }
  }

  completarIndicacion(indicacion: any) {
    console.log('Completar indicación:', indicacion);
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.isCreateModalOpen = false;
  }

  volverAFicha() {
    this.goBack();
  }

  getEstadoColor(estado: string): string {
    return this.estadoColor(estado);
  }

  modificarMedicamento(medicamento: Medication) {
    console.log('Modificar medicamento:', medicamento);
    // Implementar lógica de modificación
  }

  saveMedication() {
    if (!this.patientId || !this.nuevoMedicamento.nombre?.trim()) {
      this.error = 'Nombre del medicamento es obligatorio';
      return;
    }

    const medicationData: CreateMedicationRequest = {
      nombre: this.nuevoMedicamento.nombre,
      principioActivo: this.nuevoMedicamento.principioActivo || '',
      dosis: this.nuevoMedicamento.dosis || '',
      frecuencia: this.nuevoMedicamento.frecuencia || '',
      via: this.nuevoMedicamento.via || 'oral',
      duracion: this.nuevoMedicamento.duracion || '',
      indicaciones: this.nuevoMedicamento.indicaciones || '',
      contraindicaciones: this.nuevoMedicamento.contraindicaciones || [],
      efectosSecundarios: this.nuevoMedicamento.efectosSecundarios || [],
      medicoPrescriptor: this.nuevoMedicamento.medicoPrescriptor || 'Dr. No especificado',
      fechaInicio: this.nuevoMedicamento.fechaInicio || new Date(),
      fechaFin: this.nuevoMedicamento.fechaFin,
      observaciones: this.nuevoMedicamento.observaciones
    };

    this.subscriptions.push(
      this.medicationService.createMedication(this.patientId, medicationData).subscribe({
        next: (newMedication) => {
          if (newMedication) {
            this.medicamentosActuales = [newMedication, ...this.medicamentosActuales];
            this.closeCreateModal();
            this.error = null;
          }
        },
        error: (error) => {
          console.error('Error creating medication:', error);
          this.error = 'Error al crear el medicamento';
        }
      })
    );
  }

  // ============== GESTIÓN DE MEDICAMENTOS ==============
  suspenderMedicamento(medication: Medication) {
    this.subscriptions.push(
      this.medicationService.changeMedicationStatus(medication.id, 'suspendido').subscribe({
        next: (updatedMedication) => {
          if (updatedMedication) {
            const index = this.medicamentosActuales.findIndex(m => m.id === medication.id);
            if (index >= 0) {
              this.medicamentosActuales[index] = updatedMedication;
            }
          }
        },
        error: (error) => {
          console.error('Error suspending medication:', error);
          this.error = 'Error al suspender el medicamento';
        }
      })
    );
  }

  reactivarMedicamento(medication: Medication) {
    this.subscriptions.push(
      this.medicationService.changeMedicationStatus(medication.id, 'activo').subscribe({
        next: (updatedMedication) => {
          if (updatedMedication) {
            const index = this.medicamentosActuales.findIndex(m => m.id === medication.id);
            if (index >= 0) {
              this.medicamentosActuales[index] = updatedMedication;
            }
          }
        },
        error: (error) => {
          console.error('Error reactivating medication:', error);
          this.error = 'Error al reactivar el medicamento';
        }
      })
    );
  }

  completarMedicamento(medication: Medication) {
    this.subscriptions.push(
      this.medicationService.changeMedicationStatus(medication.id, 'completado').subscribe({
        next: (updatedMedication) => {
          if (updatedMedication) {
            const index = this.medicamentosActuales.findIndex(m => m.id === medication.id);
            if (index >= 0) {
              this.medicamentosActuales[index] = updatedMedication;
            }
          }
        },
        error: (error) => {
          console.error('Error completing medication:', error);
          this.error = 'Error al completar el medicamento';
        }
      })
    );
  }

  eliminarMedicamento(medication: Medication) {
    if (confirm('¿Está seguro de que desea eliminar este medicamento?')) {
      this.subscriptions.push(
        this.medicationService.deleteMedication(medication.id).subscribe({
          next: (success) => {
            if (success) {
              this.medicamentosActuales = this.medicamentosActuales.filter(m => m.id !== medication.id);
            }
          },
          error: (error) => {
            console.error('Error deleting medication:', error);
            this.error = 'Error al eliminar el medicamento';
          }
        })
      );
    }
  }

  // ============== PAGINACIÓN ==============
  previousPage() {
    if (this.currentPage > 1 && this.patientId) {
      this.loadMedications(this.patientId, this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages && this.patientId) {
      this.loadMedications(this.patientId, this.currentPage + 1);
    }
  }

  // ============== UTILIDADES UI ==============
  estadoClass(estado: string) {
    return {
      'badge-activo': estado === 'activo',
      'badge-suspendido': estado === 'suspendido',
      'badge-completado': estado === 'completado'
    };
  }

  estadoColor(estado: string): string {
    switch (estado) {
      case 'activo': return 'success';
      case 'suspendido': return 'warning';
      case 'completado': return 'secondary';
      default: return 'medium';
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-CL');
  }

  // ============== REFRESCAR DATOS ==============
  refreshMedications() {
    if (this.patientId) {
      this.loadMedications(this.patientId, this.currentPage);
    }
  }

  clearError() {
    this.error = null;
  }

  private blankMedication(): Partial<CreateMedicationRequest> {
    return {
      nombre: '',
      principioActivo: '',
      dosis: '',
      frecuencia: '',
      via: 'oral',
      duracion: '',
      indicaciones: '',
      contraindicaciones: [],
      efectosSecundarios: [],
      medicoPrescriptor: '',
      fechaInicio: new Date(),
      observaciones: ''
    };
  }
}