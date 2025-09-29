// Interfaces para el modelo de datos de Consultas Médicas
import { Document } from 'mongoose';

// Signos vitales
export interface VitalSigns {
  presionArterial: {
    sistolica: number;
    diastolica: number;
  };
  frecuenciaCardiaca: number; // pulsaciones por minuto
  temperatura: number; // en grados Celsius
  frecuenciaRespiratoria?: number; // respiraciones por minuto
  saturacionOxigeno?: number; // porcentaje
  peso?: number; // en kg
  altura?: number; // en cm
  imc?: number; // calculado automáticamente
}

// Diagnóstico médico
export interface Diagnosis {
  codigo: string; // Código CIE-10
  descripcion: string;
  tipo: 'principal' | 'secundario' | 'sospecha';
  gravedad?: 'leve' | 'moderado' | 'grave' | 'critico';
  confirmado: boolean;
  fechaDiagnostico: Date;
  observaciones?: string;
}

// Síntomas reportados
export interface Symptom {
  nombre: string;
  descripcion: string;
  intensidad: 1 | 2 | 3 | 4 | 5; // Escala del 1 al 5
  duracion: string; // Ejemplo: "3 días", "2 semanas"
  frecuencia?: 'constante' | 'intermitente' | 'ocasional';
  factoresDesencadenantes?: string[];
  factoresAliviantes?: string[];
}

// Examen físico
export interface PhysicalExam {
  aspecto: string;
  conciencia: 'alerta' | 'somnoliento' | 'estuporoso' | 'comatoso';
  orientacion: 'orientado' | 'desorientado_tiempo' | 'desorientado_espacio' | 'desorientado_persona';
  sistemaCardiovascular?: string;
  sistemaRespiratorio?: string;
  sistemaDigestivo?: string;
  sistemaNeurologico?: string;
  pielYAnexos?: string;
  aparatoLocomotor?: string;
  otros?: string;
}

// Plan de tratamiento
export interface TreatmentPlan {
  indicacionesGenerales: string[];
  medicamentos: string[]; // IDs de prescripciones
  examenes: string[]; // Exámenes solicitados
  procedimientos: string[];
  derivaciones?: {
    especialidad: string;
    medico?: string;
    prioridad: 'urgente' | 'alta' | 'normal' | 'baja';
    motivo: string;
  }[];
  controles: {
    fecha: Date;
    tipo: 'control' | 'resultado_examen' | 'seguimiento';
    observaciones?: string;
  }[];
  reposo?: {
    tipo: 'absoluto' | 'relativo' | 'laboral';
    duracion: string;
    observaciones?: string;
  };
}

// Información del médico tratante
export interface DoctorInfo {
  doctorId: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  rut: string;
  registroMedico: string;
}

// Datos de auditoría para consulta
export interface ConsultationAuditInfo {
  creadoPor: string;
  fechaCreacion: Date;
  modificadoPor?: string;
  fechaModificacion?: Date;
  version: number;
  estado: 'borrador' | 'finalizada' | 'corregida' | 'anulada';
}

// Interfaz principal de consulta médica
export interface IMedicalConsultation {
  consultationId: string;
  patientId: string;
  doctorInfo: DoctorInfo;
  fechaConsulta: Date;
  tipoConsulta: 'primera_vez' | 'control' | 'urgencia' | 'telemedicina' | 'procedimiento';
  motivoConsulta: string;
  anamnesis: {
    enfermedadActual: string;
    antecedentesPersonales?: string;
    antecedentesFamiliares?: string;
    habitosYEstiloVida?: string;
    medicamentosActuales?: string[];
  };
  sintomas: Symptom[];
  signosVitales: VitalSigns;
  examenFisico: PhysicalExam;
  diagnosticos: Diagnosis[];
  planTratamiento: TreatmentPlan;
  auditInfo: ConsultationAuditInfo;
  documentosAdjuntos?: string[]; // URLs o IDs de documentos
  duracionConsulta?: number; // en minutos
  costoConsulta?: number;
  observaciones?: string;
}

// Documento de MongoDB para consulta médica
export interface IMedicalConsultationDocument extends Omit<IMedicalConsultation, '_id'>, Document {
  // Métodos del documento
  calcularIMC(): number;
  esConsultaUrgente(): boolean;
  obtenerDiagnosticoPrincipal(): Diagnosis | null;
  calcularTiempoEvolucion(): number; // días desde la consulta
  generarResumen(): string;
}

// Filtros para búsqueda de consultas
export interface ConsultationFilters {
  patientId?: string;
  doctorId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  tipoConsulta?: string[];
  especialidad?: string;
  diagnostico?: string;
  estado?: string[];
  conDiagnosticoPrincipal?: boolean;
  urgente?: boolean;
  conExamenesPendientes?: boolean;
}

// Estadísticas de consultas
export interface ConsultationStats {
  totalConsultas: number;
  consultasPorTipo: { [tipo: string]: number };
  consultasPorMes: { mes: string; cantidad: number }[];
  duracionPromedio: number;
  diagnosticosMasFrecuentes: { diagnostico: string; cantidad: number }[];
  medicosActivos: number;
}

// Datos para creación de consulta
export interface CreateConsultationData {
  patientId: string;
  doctorId: string;
  fechaConsulta: Date;
  tipoConsulta: string;
  motivoConsulta: string;
  anamnesis: IMedicalConsultation['anamnesis'];
  sintomas?: Symptom[];
  signosVitales: VitalSigns;
  examenFisico: PhysicalExam;
  diagnosticos: Diagnosis[];
  planTratamiento: TreatmentPlan;
  observaciones?: string;
}

// Datos para actualización de consulta
export interface UpdateConsultationData {
  motivoConsulta?: string;
  anamnesis?: Partial<IMedicalConsultation['anamnesis']>;
  sintomas?: Symptom[];
  signosVitales?: Partial<VitalSigns>;
  examenFisico?: Partial<PhysicalExam>;
  diagnosticos?: Diagnosis[];
  planTratamiento?: Partial<TreatmentPlan>;
  observaciones?: string;
  estado?: 'borrador' | 'finalizada' | 'corregida' | 'anulada';
}

// Respuesta del API para lista de consultas
export interface ConsultationsListResponse {
  consultations: IMedicalConsultation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Resumen de consulta para listas
export interface ConsultationSummary {
  consultationId: string;
  patientId: string;
  pacienteNombre: string;
  doctorNombre: string;
  fechaConsulta: Date;
  tipoConsulta: string;
  diagnosticoPrincipal?: string;
  estado: string;
  duracion?: number;
}

// Enums para mayor tipo seguridad
export enum ConsultationType {
  PRIMERA_VEZ = 'primera_vez',
  CONTROL = 'control',
  URGENCIA = 'urgencia',
  TELEMEDICINA = 'telemedicina',
  PROCEDIMIENTO = 'procedimiento'
}

export enum ConsultationStatus {
  BORRADOR = 'borrador',
  FINALIZADA = 'finalizada',
  CORREGIDA = 'corregida',
  ANULADA = 'anulada'
}

export enum DiagnosisType {
  PRINCIPAL = 'principal',
  SECUNDARIO = 'secundario',
  SOSPECHA = 'sospecha'
}

export enum Severity {
  LEVE = 'leve',
  MODERADO = 'moderado',
  GRAVE = 'grave',
  CRITICO = 'critico'
}