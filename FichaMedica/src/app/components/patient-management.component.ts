import { Component, OnInit } from '@angular/core';
import { DynamoDBService } from '../services/dynamodb.service';
import { PatientProfile, DoctorProfile, Consultation } from '../models/dynamodb-schema';

@Component({
  selector: 'app-patient-management',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Gestión de Pacientes</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Formulario para crear paciente -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Nuevo Paciente</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-label position="floating">Nombre</ion-label>
            <ion-input [(ngModel)]="newPatient.nombre"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Apellido</ion-label>
            <ion-input [(ngModel)]="newPatient.apellido"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Fecha de Nacimiento</ion-label>
            <ion-input type="date" [(ngModel)]="newPatient.fechaNacimiento"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Sexo</ion-label>
            <ion-select [(ngModel)]="newPatient.sexo">
              <ion-select-option value="M">Masculino</ion-select-option>
              <ion-select-option value="F">Femenino</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Teléfono</ion-label>
            <ion-input [(ngModel)]="newPatient.telefono"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Tipo de Sangre</ion-label>
            <ion-select [(ngModel)]="newPatient.tipoSangre">
              <ion-select-option value="A+">A+</ion-select-option>
              <ion-select-option value="A-">A-</ion-select-option>
              <ion-select-option value="B+">B+</ion-select-option>
              <ion-select-option value="B-">B-</ion-select-option>
              <ion-select-option value="O+">O+</ion-select-option>
              <ion-select-option value="O-">O-</ion-select-option>
              <ion-select-option value="AB+">AB+</ion-select-option>
              <ion-select-option value="AB-">AB-</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-button expand="block" (click)="createPatient()" [disabled]="isCreating">
            <ion-spinner name="crescent" *ngIf="isCreating"></ion-spinner>
            {{ isCreating ? 'Creando...' : 'Crear Paciente' }}
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Lista de pacientes -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Pacientes Registrados</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <!-- Buscador -->
          <ion-searchbar 
            [(ngModel)]="searchTerm" 
            (ionInput)="searchPatients()"
            placeholder="Buscar paciente por nombre">
          </ion-searchbar>

          <!-- Lista de pacientes -->
          <ion-list *ngIf="patients.length > 0">
            <ion-item *ngFor="let patient of patients" (click)="selectPatient(patient)">
              <ion-label>
                <h2>{{ patient.nombre }} {{ patient.apellido }}</h2>
                <p>{{ patient.fechaNacimiento }} - {{ patient.sexo === 'M' ? 'Masculino' : 'Femenino' }}</p>
                <p>{{ patient.telefono }} | Tipo: {{ patient.tipoSangre }}</p>
              </ion-label>
              <ion-button fill="clear" slot="end" (click)="viewPatientHistory(patient)">
                <ion-icon name="medical-outline"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-list>

          <ion-text *ngIf="patients.length === 0 && !isLoading">
            <p>No se encontraron pacientes.</p>
          </ion-text>

          <ion-spinner *ngIf="isLoading"></ion-spinner>
        </ion-card-content>
      </ion-card>

      <!-- Modal o detalle del paciente seleccionado -->
      <ion-card *ngIf="selectedPatient">
        <ion-card-header>
          <ion-card-title>{{ selectedPatient.nombre }} {{ selectedPatient.apellido }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-label>
              <h3>Información Personal</h3>
              <p>Fecha de Nacimiento: {{ selectedPatient.fechaNacimiento }}</p>
              <p>Sexo: {{ selectedPatient.sexo === 'M' ? 'Masculino' : 'Femenino' }}</p>
              <p>Teléfono: {{ selectedPatient.telefono }}</p>
              <p>Tipo de Sangre: {{ selectedPatient.tipoSangre }}</p>
              <p>Peso: {{ selectedPatient.peso }} kg</p>
              <p>Altura: {{ selectedPatient.altura }} cm</p>
            </ion-label>
          </ion-item>

          <!-- Historial médico -->
          <ion-item>
            <ion-label>
              <h3>Historial Médico</h3>
            </ion-label>
            <ion-button fill="clear" (click)="loadPatientHistory(selectedPatient.patientId)">
              <ion-icon name="refresh"></ion-icon>
            </ion-button>
          </ion-item>

          <!-- Consultas -->
          <ion-list *ngIf="patientConsultations.length > 0">
            <ion-item-divider>
              <ion-label>Consultas Médicas</ion-label>
            </ion-item-divider>
            <ion-item *ngFor="let consultation of patientConsultations">
              <ion-label>
                <h4>{{ consultation.fecha }}</h4>
                <p>Motivo: {{ consultation.motivo }}</p>
                <p>Tratamiento: {{ consultation.tratamiento }}</p>
              </ion-label>
            </ion-item>
          </ion-list>

          <!-- Exámenes -->
          <ion-list *ngIf="patientExams.length > 0">
            <ion-item-divider>
              <ion-label>Exámenes Médicos</ion-label>
            </ion-item-divider>
            <ion-item *ngFor="let exam of patientExams">
              <ion-label>
                <h4>{{ exam.tipoExamen }} - {{ exam.fecha }}</h4>
                <p>Resultados: {{ exam.resultados }}</p>
              </ion-label>
            </ion-item>
          </ion-list>

          <ion-button expand="block" (click)="clearSelection()">
            Cerrar
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 16px;
    }
    
    ion-spinner {
      margin: 20px auto;
      display: block;
    }
  `]
})
export class PatientManagementComponent implements OnInit {
  // Datos del formulario
  newPatient: Partial<PatientProfile> = {
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    sexo: '',
    direccion: '',
    telefono: '',
    tipoSangre: '',
    peso: 0,
    altura: 0,
    notas: ''
  };

  // Estados de la aplicación
  patients: PatientProfile[] = [];
  selectedPatient: PatientProfile | null = null;
  patientConsultations: Consultation[] = [];
  patientExams: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  isCreating: boolean = false;

  constructor(private dynamoService: DynamoDBService) {}

  ngOnInit() {
    // Configurar credenciales si es necesario
    // this.dynamoService.configureCredentials('your-access-key', 'your-secret-key');
  }

  async createPatient() {
    if (!this.newPatient.nombre || !this.newPatient.apellido) {
      alert('Por favor, complete los campos obligatorios');
      return;
    }

    this.isCreating = true;
    try {
      const patientId = await this.dynamoService.createPatient(this.newPatient as any);
      console.log('Paciente creado con ID:', patientId);
      
      // Limpiar formulario
      this.newPatient = {
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        sexo: '',
        direccion: '',
        telefono: '',
        tipoSangre: '',
        peso: 0,
        altura: 0,
        notas: ''
      };

      // Recargar lista de pacientes si hay búsqueda activa
      if (this.searchTerm) {
        await this.searchPatients();
      }

      alert('Paciente creado exitosamente');
    } catch (error) {
      console.error('Error creando paciente:', error);
      alert('Error al crear el paciente');
    } finally {
      this.isCreating = false;
    }
  }

  async searchPatients() {
    if (!this.searchTerm) {
      this.patients = [];
      return;
    }

    this.isLoading = true;
    try {
      this.patients = await this.dynamoService.searchPatientsByName(this.searchTerm);
    } catch (error) {
      console.error('Error buscando pacientes:', error);
      alert('Error al buscar pacientes');
    } finally {
      this.isLoading = false;
    }
  }

  selectPatient(patient: PatientProfile) {
    this.selectedPatient = patient;
    this.loadPatientHistory(patient.patientId);
  }

  async loadPatientHistory(patientId: string) {
    try {
      this.patientConsultations = await this.dynamoService.getPatientConsultations(patientId);
      this.patientExams = await this.dynamoService.getPatientExams(patientId);
    } catch (error) {
      console.error('Error cargando historial del paciente:', error);
    }
  }

  viewPatientHistory(patient: PatientProfile) {
    this.selectPatient(patient);
  }

  clearSelection() {
    this.selectedPatient = null;
    this.patientConsultations = [];
    this.patientExams = [];
  }

  // Método para crear una nueva consulta
  async createConsultation(patientId: string, doctorId: string, motivo: string, tratamiento: string) {
    try {
      const consultationData = {
        patientId,
        doctorId,
        fecha: new Date().toISOString(),
        motivo,
        tratamiento,
        diagnosticos: []
      };

      const consultationId = await this.dynamoService.createConsultation(consultationData);
      console.log('Consulta creada con ID:', consultationId);
      
      // Recargar historial
      await this.loadPatientHistory(patientId);
      
    } catch (error) {
      console.error('Error creando consulta:', error);
    }
  }
}