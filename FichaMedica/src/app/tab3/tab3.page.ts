import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonBadge, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel,
  IonTextarea, IonTabs, IonTabButton, IonSpinner, IonToast
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';

// Servicios
import { PatientService } from '../services/patient.service';
import { MedicalConsultationService } from '../services/medical-consultation.service';
import { ExamService } from '../services/exam.service';

// Modelos
import { Patient } from '../models/patient.model';

interface FichaMedicaUI {
  datosPersonales: {
    nombres: string;
    apellidos: string;
    documento: string;
    edad: number;
    grupoSanguineo: string;
    direccion: string;
    telefono: string;
    contactoEmergencia: string;
  };
  alertasMedicas: Array<{
    tipo: 'alergia' | 'medicamento' | 'antecedente';
    descripcion: string;
    criticidad: 'alta' | 'media' | 'baja';
  }>;
  consultas: any[];
  examenes: any[];
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonIcon, IonButton, IonSpinner, IonToast,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonBadge, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel,
    IonTextarea, CommonModule, FormsModule
  ],
})
export class Tab3Page implements OnInit, OnDestroy {
  
  // Estados del componente
  ficha: FichaMedicaUI | null = null;
  isLoading = false;
  error: string | null = null;
  patientId: string | null = null;
  
  // Variable para las notas rápidas
  nuevaNota: string = '';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private consultationService: MedicalConsultationService,
    private examService: ExamService
  ) {}

  ngOnInit() {
    // Obtener el ID del paciente desde los query params
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        this.patientId = params['patientId'];
        if (this.patientId) {
          this.loadPatientData(this.patientId);
        } else {
          this.error = 'No se especificó el ID del paciente';
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Cargar todos los datos del paciente
   */
  loadPatientData(patientId: string) {
    this.isLoading = true;
    this.error = null;

    // Cargar datos en paralelo
    const patientData$ = this.patientService.getPatientById(patientId);
    const consultations$ = this.consultationService.getPatientConsultations(patientId, 1, 10);
    const exams$ = this.examService.getPatientExams(patientId);

    this.subscriptions.push(
      forkJoin({
        patient: patientData$,
        consultations: consultations$,
        exams: exams$
      }).subscribe({
        next: (data) => {
          if (data.patient) {
            this.ficha = this.buildFichaMedica(data);
          } else {
            this.error = 'No se encontró el paciente';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading patient data:', error);
          this.error = 'Error al cargar los datos del paciente';
          this.isLoading = false;
        }
      })
    );
  }

  /**
   * Construir la ficha médica a partir de los datos del backend
   */
  private buildFichaMedica(data: any): FichaMedicaUI {
    const patient: Patient = data.patient;
    
    return {
      datosPersonales: {
        nombres: patient.nombres,
        apellidos: patient.apellidos,
        documento: patient.documento,
        edad: this.calculateAge(patient.fechaNacimiento),
        grupoSanguineo: patient.grupoSanguineo,
        direccion: patient.direccion,
        telefono: patient.telefono,
        contactoEmergencia: `${patient.contactoEmergencia.nombre} - ${patient.contactoEmergencia.telefono}`
      },
      alertasMedicas: [
        // Alergias
        ...patient.alergias.map(alergia => ({
          tipo: 'alergia' as const,
          descripcion: alergia,
          criticidad: 'alta' as const
        })),
        // Medicamentos
        ...patient.medicamentos.map(medicamento => ({
          tipo: 'medicamento' as const,
          descripcion: medicamento,
          criticidad: 'media' as const
        })),
        // Antecedentes
        ...patient.antecedentes.map(antecedente => ({
          tipo: 'antecedente' as const,
          descripcion: antecedente,
          criticidad: 'media' as const
        }))
      ],
      consultas: data.consultations.consultas || [],
      examenes: data.exams.examenes || []
    };
  }

  /**
   * Calcular edad a partir de fecha de nacimiento
   */
  private calculateAge(fechaNacimiento: Date): number {
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

  // ============== NAVEGACIÓN ==============
  goBack() {
    this.router.navigateByUrl('/tabs/tab2');
  }

  verMedicamentos() {
    if (this.patientId) {
      this.router.navigate(['/tabs/tab4'], { 
        queryParams: { patientId: this.patientId } 
      });
    }
  }

  verExamenes() {
    if (this.patientId) {
      this.router.navigate(['/tabs/tab5'], { 
        queryParams: { patientId: this.patientId } 
      });
    }
  }

  nuevaConsulta() {
    if (this.patientId) {
      // TODO: Implementar modal o navegación para nueva consulta
      console.log('Nueva consulta para paciente:', this.patientId);
    }
  }

  // ============== UTILIDADES UI ==============
  badgeClass(criticidad: 'alta' | 'media' | 'baja') {
    return {
      'badge-alta': criticidad === 'alta',
      'badge-media': criticidad === 'media',
      'badge-baja': criticidad === 'baja'
    };
  }

  badgeColor(criticidad: 'alta' | 'media' | 'baja'): string {
    switch (criticidad) {
      case 'alta': return 'danger';
      case 'media': return 'warning';
      case 'baja': return 'secondary';
      default: return 'secondary';
    }
  }

  // Alias para compatibilidad con HTML
  getBadgeColor(criticidad: string): string {
    return this.badgeColor(criticidad as 'alta' | 'media' | 'baja');
  }

  verMedicacion() {
    if (this.patientId) {
      this.router.navigate(['/tabs/tab4'], { 
        queryParams: { patientId: this.patientId } 
      });
    }
  }

  estadoExamenColor(estado: string): string {
    switch (estado) {
      case 'normal': return 'success';
      case 'atencion': return 'warning';
      case 'critico': return 'danger';
      default: return 'medium';
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-CL');
  }

  formatDateShort(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
  }

  getExamenBadgeColor(estado: string): string {
    return this.estadoExamenColor(estado);
  }

  getExamenBadgeText(estado: string): string {
    switch (estado) {
      case 'normal': return 'Normal';
      case 'atencion': return 'Atención';
      case 'critico': return 'Crítico';
      case 'solicitado': return 'Solicitado';
      case 'en_proceso': return 'En Proceso';
      case 'completado': return 'Completado';
      default: return estado;
    }
  }

  formatTime(time: string | Date): string {
    if (!time) return '';
    if (typeof time === 'string') return time;
    return time.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }

  // ============== REFRESCAR DATOS ==============
  refreshData() {
    if (this.patientId) {
      this.loadPatientData(this.patientId);
    }
  }

  clearError() {
    this.error = null;
  }

  // ============== NOTAS RÁPIDAS ==============
  guardarNota() {
    if (!this.nuevaNota.trim()) return;
    
    // TODO: Implementar guardado de nota en el backend
    console.log('Guardar nota:', this.nuevaNota);
    this.nuevaNota = '';
  }

  agregarNota() {
    this.guardarNota();
  }
}