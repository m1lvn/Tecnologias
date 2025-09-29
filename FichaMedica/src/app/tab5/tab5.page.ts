import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonIcon, IonButton, IonBadge, IonSpinner, IonToast, IonModal,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonInput, IonTextarea,
  IonSelect, IonSelectOption, IonDatetime, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { add, create, eye, calendar, medical, clipboard } from 'ionicons/icons';

// Servicios
import { ExamService, Exam, CreateExamRequest } from '../services/exam.service';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
    IonIcon, IonButton, IonBadge, IonSpinner, IonToast, IonModal,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonInput, IonTextarea,
    IonSelect, IonSelectOption, IonDatetime, IonItem, IonLabel,
    CommonModule, FormsModule
  ]
})
export class Tab5Page implements OnInit, OnDestroy {
  
  // Estados del componente
  examenes: Exam[] = [];
  isLoading = false;
  error: string | null = null;
  patientId: string | null = null;
  
  // Modal para crear examen
  isCreateModalOpen = false;
  newExam: Partial<CreateExamRequest> = this.blankExam();
  
  // Paginación y filtros
  currentPage = 1;
  totalPages = 1;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private examService: ExamService
  ) {
    addIcons({ add, create, eye, calendar, medical, clipboard });
  }

  ngOnInit() {
    // Obtener el ID del paciente desde los query params
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        this.patientId = params['patientId'];
        if (this.patientId) {
          this.loadExams(this.patientId);
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
      this.examService.loading$.subscribe(loading => {
        this.isLoading = loading;
      }),
      this.examService.error$.subscribe(error => {
        this.error = error;
      })
    );
  }

  /**
   * Cargar exámenes del paciente
   */
  loadExams(patientId: string) {
    this.subscriptions.push(
      this.examService.getPatientExams(patientId).subscribe({
        next: (response) => {
          this.examenes = response.examenes;
          this.totalPages = response.pagination?.totalPages || 1;
          this.error = null;
        },
        error: (error) => {
          console.error('Error loading exams:', error);
          this.error = 'Error al cargar los exámenes';
        }
      })
    );
  }

  // ============== NAVEGACIÓN ==============
  volverFicha() {
    if (this.patientId) {
      this.router.navigate(['/tabs/tab3'], { 
        queryParams: { patientId: this.patientId } 
      });
    } else {
      this.router.navigate(['/tabs/tab3']);
    }
  }

  goBack() {
    this.volverFicha();
  }

  // ============== CREAR EXAMEN ==============
  openCreateModal() {
    this.newExam = this.blankExam();
    this.isCreateModalOpen = true;
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
  }

  saveExam() {
    if (!this.patientId || !this.newExam.nombre?.trim()) {
      this.error = 'Nombre del examen es obligatorio';
      return;
    }

    const examData: CreateExamRequest = {
      patientId: this.patientId,
      nombre: this.newExam.nombre,
      tipo: this.newExam.tipo || 'laboratorio',
      solicitadoPor: this.newExam.solicitadoPor || 'Dr. No especificado',
      estado: 'pendiente',
      observaciones: this.newExam.observaciones
    };

    this.subscriptions.push(
      this.examService.createExam(this.patientId, examData).subscribe({
        next: (newExam) => {
          if (newExam) {
            this.examenes = [newExam, ...this.examenes];
            this.closeCreateModal();
            this.error = null;
          }
        },
        error: (error) => {
          console.error('Error creating exam:', error);
          this.error = 'Error al crear el examen';
        }
      })
    );
  }

  // ============== GESTIÓN DE EXÁMENES ==============
  verDetalle(exam: Exam) {
    // TODO: Implementar modal o página de detalle del examen
    console.log('Ver detalle del examen:', exam);
  }

  editarExamen(exam: Exam) {
    // TODO: Implementar edición de examen
    console.log('Editar examen:', exam);
  }

  eliminarExamen(exam: Exam) {
    if (confirm('¿Está seguro de que desea eliminar este examen?')) {
      this.subscriptions.push(
        this.examService.deleteExam(exam.id).subscribe({
          next: () => {
            this.examenes = this.examenes.filter(e => e.id !== exam.id);
          },
          error: (error) => {
            console.error('Error deleting exam:', error);
            this.error = 'Error al eliminar el examen';
          }
        })
      );
    }
  }

  // ============== UTILIDADES UI ==============
  getBadgeColor(estado: string): string {
    switch(estado) {
      case 'normal': return 'success';
      case 'atencion': return 'warning';
      case 'critico': return 'danger';
      case 'solicitado': return 'medium';
      case 'en_proceso': return 'primary';
      case 'completado': return 'success';
      default: return 'medium';
    }
  }

  estadoDisplay(estado: string): string {
    switch(estado) {
      case 'solicitado': return 'Solicitado';
      case 'en_proceso': return 'En Proceso';
      case 'completado': return 'Completado';
      case 'normal': return 'Normal';
      case 'atencion': return 'Atención';
      case 'critico': return 'Crítico';
      default: return estado;
    }
  }

  getBadgeText(estado: string): string {
    return this.estadoDisplay(estado);
  }

  tipoDisplay(tipo: string): string {
    switch(tipo) {
      case 'laboratorio': return 'Laboratorio';
      case 'imagen': return 'Imagen';
      case 'biopsia': return 'Biopsia';
      case 'funcional': return 'Funcional';
      default: return tipo;
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-CL');
  }

  // ============== FILTROS Y BÚSQUEDA ==============
  filtrarPorEstado(estado: string) {
    if (this.patientId) {
      this.subscriptions.push(
        this.examService.getPatientExams(this.patientId, { estado }).subscribe({
          next: (response) => {
            this.examenes = response.examenes;
          },
          error: (error) => {
            console.error('Error filtering exams:', error);
            this.error = 'Error al filtrar los exámenes';
          }
        })
      );
    }
  }

  mostrarTodos() {
    if (this.patientId) {
      this.loadExams(this.patientId);
    }
  }

  // ============== REFRESCAR DATOS ==============
  refreshExams() {
    if (this.patientId) {
      this.loadExams(this.patientId);
    }
  }

  clearError() {
    this.error = null;
  }

  private blankExam(): Partial<CreateExamRequest> {
    return {
      nombre: '',
      tipo: 'laboratorio',
      solicitadoPor: '',
      observaciones: ''
    };
  }
}