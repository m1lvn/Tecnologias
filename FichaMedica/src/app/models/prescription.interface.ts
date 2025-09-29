// Interfaces para el modelo de datos de Prescripciones
import { Document } from 'mongoose';

// Medicamento prescrito
export interface PrescribedMedication {
  medicationId: string;
  nombreMedicamento: string;
  principioActivo: string;
  concentracion: string;
  formaFarmaceutica: string;
  dosis: string;
  viaAdministracion: string;
  frecuencia: string;
  duracion: string;
  cantidadTotal: number;
  unidad: string;
  instrucciones: string;
  observaciones?: string;
  sustituible: boolean;
}

// Información del prescriptor
export interface PrescriptorInfo {
  doctorId: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  rut: string;
  registroMedico: string;
  colegioProfesional?: string;
  firma?: string; // URL de la firma digital
}

// Estado de la prescripción
export interface PrescriptionStatusInfo {
  estado: 'vigente' | 'dispensada' | 'vencida' | 'suspendida' | 'anulada';
  fechaCambio: Date;
  motivoCambio?: string;
  cambiadoPor?: string;
  porcentajeDispensado?: number; // 0-100
}

// Dispensación del medicamento
export interface Dispensation {
  dispensationId: string;
  farmaciaId?: string;
  nombreFarmacia?: string;
  farmaceuticoId?: string;
  nombreFarmaceutico?: string;
  fechaDispensacion: Date;
  cantidadDispensada: number;
  loteNumero?: string;
  fechaVencimiento?: Date;
  costoTotal?: number;
  observaciones?: string;
}

// Información de seguimiento
export interface FollowUpInfo {
  adherencia?: number; // Porcentaje de adherencia 0-100
  efectosSecundarios?: {
    descripcion: string;
    intensidad: 1 | 2 | 3 | 4 | 5;
    fechaInicio: Date;
    fechaFin?: Date;
    resuelto: boolean;
  }[];
  eficacia?: {
    mejorias: string[];
    puntuacion: 1 | 2 | 3 | 4 | 5; // Escala de eficacia
    observaciones?: string;
  };
  motivosSuspension?: string[];
}

// Alertas y recordatorios
export interface PrescriptionAlerts {
  alergias: boolean;
  interacciones: boolean;
  contraindicaciones: boolean;
  dosisMaxima: boolean;
  duplicaciones: boolean;
  embarazoLactancia: boolean;
  alertasPersonalizadas?: string[];
}

// Interfaz principal de la prescripción
export interface IPrescription {
  prescriptionId: string;
  patientId: string;
  consultationId?: string;
  prescriptorInfo: PrescriptorInfo;
  fechaPrescripcion: Date;
  fechaValidez: Date;
  medicamentos: PrescribedMedication[];
  status: PrescriptionStatusInfo;
  dispensaciones?: Dispensation[];
  followUp?: FollowUpInfo;
  alerts: PrescriptionAlerts;
  indicacionesGenerales?: string;
  observaciones?: string;
  tipoReceta: 'normal' | 'magistral' | 'estupefaciente' | 'psicotropico';
  codigoQR?: string; // Para recetas digitales
  firmaDigital?: string;
  fechaCreacion: Date;
  fechaModificacion?: Date;
}

// Documento de MongoDB para prescripción
export interface IPrescriptionDocument extends Omit<IPrescription, '_id'>, Document {
  // Métodos del documento
  isValid(): boolean;
  isExpired(): boolean;
  canBeDispensed(): boolean;
  getTotalCost(): number;
  hasInteractions(): boolean;
  getRemainingDays(): number;
  calculateAdherence(): number;
}

// Filtros para búsqueda de prescripciones
export interface PrescriptionFilters {
  patientId?: string;
  doctorId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  estado?: string[];
  medicamento?: string;
  tipoReceta?: string[];
  conAlertas?: boolean;
  vencidas?: boolean;
  dispensadas?: boolean;
}

// Estadísticas de prescripciones
export interface PrescriptionStats {
  totalPrescripciones: number;
  vigentes: number;
  vencidas: number;
  dispensadas: number;
  suspendidas: number;
  medicamentosMasPrescritos: { medicamento: string; cantidad: number }[];
  adherenciaPromedio: number;
  efectosSecundariosReportados: number;
}

// Datos para creación de prescripción
export interface CreatePrescriptionData {
  patientId: string;
  consultationId?: string;
  doctorId: string;
  fechaValidez: Date;
  medicamentos: Omit<PrescribedMedication, 'medicationId'>[];
  indicacionesGenerales?: string;
  observaciones?: string;
  tipoReceta: string;
}

// Datos para actualización de prescripción
export interface UpdatePrescriptionData {
  medicamentos?: PrescribedMedication[];
  estado?: string;
  motivoCambio?: string;
  indicacionesGenerales?: string;
  observaciones?: string;
  followUp?: Partial<FollowUpInfo>;
}

// Historial de cambios en prescripción
export interface PrescriptionHistory {
  fecha: Date;
  accion: 'creada' | 'modificada' | 'dispensada' | 'suspendida' | 'reactivada' | 'anulada';
  usuario: string;
  detalles: string;
  camposModificados?: string[];
}

// Reporte de adherencia
export interface AdherenceReport {
  prescriptionId: string;
  patientId: string;
  medicamento: string;
  fechaInicio: Date;
  fechaFin?: Date;
  dosisPrescritas: number;
  dosisTomadas: number;
  adherencia: number;
  factoresNoAdherencia?: string[];
  recomendaciones?: string[];
}

// Enums para mayor tipo seguridad
export enum PrescriptionStatus {
  VIGENTE = 'vigente',
  DISPENSADA = 'dispensada',
  VENCIDA = 'vencida',
  SUSPENDIDA = 'suspendida',
  ANULADA = 'anulada'
}

export enum PrescriptionType {
  NORMAL = 'normal',
  MAGISTRAL = 'magistral',
  ESTUPEFACIENTE = 'estupefaciente',
  PSICOTROPICO = 'psicotropico'
}

export enum AlertType {
  ALERGIA = 'alergia',
  INTERACCION = 'interaccion',
  CONTRAINDICACION = 'contraindicacion',
  DOSIS_MAXIMA = 'dosis_maxima',
  DUPLICACION = 'duplicacion',
  EMBARAZO_LACTANCIA = 'embarazo_lactancia'
}