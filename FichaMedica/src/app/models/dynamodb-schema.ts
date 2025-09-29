// Definición del esquema DynamoDB para el sistema de fichas médicas

export interface DynamoDBRecord {
  PK: string; // Partition Key
  SK: string; // Sort Key
  entityType: string;
  createdAt: string;
  updatedAt: string;
}

// Interfaces para las entidades principales
export interface PatientProfile extends DynamoDBRecord {
  entityType: 'PATIENT_PROFILE';
  patientId: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  sexo: string;
  direccion: string;
  telefono: string;
  tipoSangre: string;
  peso: number;
  altura: number;
  notas?: string;
}

export interface DoctorProfile extends DynamoDBRecord {
  entityType: 'DOCTOR_PROFILE';
  doctorId: string;
  rut: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  sexo: string;
  especialidad?: string;
}

export interface Consultation extends DynamoDBRecord {
  entityType: 'CONSULTATION';
  consultationId: string;
  patientId: string;
  doctorId: string;
  fecha: string;
  motivo: string;
  tratamiento: string;
  diagnosticos: Diagnosis[];
}

export interface MedicalExam extends DynamoDBRecord {
  entityType: 'MEDICAL_EXAM';
  examId: string;
  patientId: string;
  doctorId: string;
  tipoExamen: string;
  fecha: string;
  documento?: string;
  resultados: string;
}

export interface Prescription extends DynamoDBRecord {
  entityType: 'PRESCRIPTION';
  prescriptionId: string;
  patientId: string;
  doctorId: string;
  consultationId: string;
  fechaFin: string;
  medicamentos: PrescriptionMedication[];
}

export interface Medication extends DynamoDBRecord {
  entityType: 'MEDICATION';
  medicationId: string;
  nombre: string;
  nombreColoquial?: string;
  viaAdministracion: string;
  descripcion?: string;
}

// Interfaces auxiliares
export interface Diagnosis {
  diagnosticoId: string;
  descripcion: string;
  codigo: string;
  principal: boolean;
}

export interface PrescriptionMedication {
  medicationId: string;
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
}

// Tipos de claves para DynamoDB
export type EntityType = 
  | 'PATIENT_PROFILE'
  | 'DOCTOR_PROFILE' 
  | 'CONSULTATION'
  | 'MEDICAL_EXAM'
  | 'PRESCRIPTION'
  | 'MEDICATION';

export type DetailType =
  | 'PROFILE'
  | 'CONSULTATION'
  | 'EXAM'
  | 'PRESCRIPTION'
  | 'INFO';

// Utilidades para generar claves
export class DynamoDBKeyUtils {
  static generatePK(entityType: string, id: string): string {
    return `${entityType}#${id}`;
  }

  static generateSK(detailType: string, id?: string): string {
    return id ? `${detailType}#${id}` : detailType;
  }

  static generatePatientPK(patientId: string): string {
    return this.generatePK('PATIENT', patientId);
  }

  static generateDoctorPK(doctorId: string): string {
    return this.generatePK('DOCTOR', doctorId);
  }

  static generateMedicationPK(medicationId: string): string {
    return this.generatePK('MEDICATION', medicationId);
  }
}