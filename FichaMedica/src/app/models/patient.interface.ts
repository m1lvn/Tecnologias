// Interfaces para el modelo de datos de Pacientes
import { Document } from 'mongoose';

// Información personal del paciente
export interface PersonalInfo {
  nombre: string;
  apellido: string;
  rut: string;
  fechaNacimiento: Date;
  sexo: 'M' | 'F' | 'Otro';
  tipoSangre: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  direccion: string;
  telefono: string;
  contactoEmergencia: string;
  email?: string;
}

// Información médica básica
export interface MedicalInfo {
  alergias: string[];
  condicionesCronicas: string[];
  medicamentosActuales: string[];
  peso: number; // en kg
  altura: number; // en cm
  imc?: number; // calculado automáticamente
  grupoSanguineo?: string;
  factorRh?: '+' | '-';
}

// Información de seguro médico
export interface InsuranceInfo {
  tipoSeguro: 'FONASA' | 'ISAPRE' | 'Particular' | 'Otro';
  numeroAfiliado?: string;
  plan?: string;
  vigente: boolean;
  observaciones?: string;
}

// Datos de auditoría
export interface AuditInfo {
  creadoPor: string; // ID del usuario que creó el registro
  fechaCreacion: Date;
  modificadoPor?: string; // ID del último usuario que modificó
  fechaModificacion?: Date;
  version: number;
}

// Interfaz principal del paciente
export interface IPatient {
  patientId: string; // Identificador único generado automáticamente
  personalInfo: PersonalInfo;
  medicalInfo: MedicalInfo;
  insuranceInfo?: InsuranceInfo;
  auditInfo: AuditInfo;
  activo: boolean;
  fechaRegistro: Date;
  ultimaVisita?: Date;
  observaciones?: string;
  tags?: string[]; // Etiquetas para categorización
}

// Documento de MongoDB para paciente
export interface IPatientDocument extends Omit<IPatient, '_id'>, Document {
  // Métodos del documento
  calculateAge(): number;
  calculateIMC(): number;
  isActive(): boolean;
  getFullName(): string;
  formatRut(): string;
}

// Filtros para búsqueda de pacientes
export interface PatientFilters {
  nombre?: string;
  apellido?: string;
  rut?: string;
  sexo?: 'M' | 'F' | 'Otro';
  edadMin?: number;
  edadMax?: number;
  tipoSangre?: string;
  activo?: boolean;
  fechaRegistroDesde?: Date;
  fechaRegistroHasta?: Date;
  ultimaVisitaDesde?: Date;
  ultimaVisitaHasta?: Date;
  alergias?: string[];
  condicionesCronicas?: string[];
  tags?: string[];
}

// Estadísticas de paciente
export interface PatientStats {
  totalConsultas: number;
  ultimaConsulta?: Date;
  consultasMesActual: number;
  consultasAnioActual: number;
  medicamentosActivos: number;
  alertasMedicas: number;
  examenesPendientes: number;
  proximaCita?: Date;
}

// Datos para creación de paciente
export interface CreatePatientData {
  personalInfo: Omit<PersonalInfo, 'email'> & { email?: string };
  medicalInfo: Omit<MedicalInfo, 'imc'>;
  insuranceInfo?: InsuranceInfo;
  observaciones?: string;
  tags?: string[];
}

// Datos para actualización de paciente
export interface UpdatePatientData {
  personalInfo?: Partial<PersonalInfo>;
  medicalInfo?: Partial<MedicalInfo>;
  insuranceInfo?: Partial<InsuranceInfo>;
  observaciones?: string;
  tags?: string[];
  activo?: boolean;
}

// Respuesta del API para lista de pacientes
export interface PatientsListResponse {
  patients: IPatient[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Validaciones de RUT
export interface RutValidation {
  isValid: boolean;
  formatted: string;
  error?: string;
}

// Enums para mayor tipo seguridad
export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+', 
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-'
}

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'Otro'
}

export enum InsuranceType {
  FONASA = 'FONASA',
  ISAPRE = 'ISAPRE',
  PRIVATE = 'Particular',
  OTHER = 'Otro'
}