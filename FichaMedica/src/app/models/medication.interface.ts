// Interfaces para el modelo de datos de Medicamentos
import { Document } from 'mongoose';

// Información básica del medicamento
export interface DrugInfo {
  nombre: string;
  nombreComercial?: string;
  principioActivo: string;
  concentracion: string;
  formaFarmaceutica: 'tableta' | 'capsula' | 'jarabe' | 'inyectable' | 'crema' | 'gotas' | 'parche' | 'inhalador' | 'supositorio' | 'otros';
  laboratorio?: string;
  codigoBarras?: string;
  registroSanitario?: string;
}

// Información farmacológica
export interface PharmacologicalInfo {
  grupoTerapeutico: string;
  mecanismoAccion?: string;
  indicaciones: string[];
  contraindicaciones: string[];
  efectosSecundarios: string[];
  interaccionesMedicamentosas: string[];
  precauciones: string[];
  embarazoLactancia?: 'A' | 'B' | 'C' | 'D' | 'X';
}

// Información de dosificación
export interface DosageInfo {
  dosis: {
    adultos?: string;
    pediatrica?: string;
    geriatrica?: string;
  };
  viaAdministracion: string[];
  frecuencia: string[];
  duracionTratamiento?: string;
  dosisMaximaDiaria?: string;
}

// Información de almacenamiento
export interface StorageInfo {
  temperaturaAlmacenamiento: string;
  condicionesEspeciales?: string[];
  vidaUtil: string;
  condicionesConservacion: string;
  fotosensible?: boolean;
  refrigeracion?: boolean;
}

// Información comercial
export interface CommercialInfo {
  precio?: number;
  coberturaSeguros?: string[];
  disponibilidad: 'disponible' | 'agotado' | 'descontinuado' | 'bajo_stock';
  proveedor?: string;
  ultimaActualizacionPrecio?: Date;
  requiereReceta: boolean;
  medicamentoControlado?: boolean;
}

// Interfaz principal del medicamento
export interface IMedication {
  medicationId: string;
  drugInfo: DrugInfo;
  pharmacologicalInfo: PharmacologicalInfo;
  dosageInfo: DosageInfo;
  storageInfo: StorageInfo;
  commercialInfo: CommercialInfo;
  fechaRegistro: Date;
  fechaActualizacion?: Date;
  activo: boolean;
  observaciones?: string;
  imagenes?: string[]; // URLs de imágenes del medicamento
}

// Documento de MongoDB para medicamento
export interface IMedicationDocument extends Omit<IMedication, '_id'>, Document {
  // Métodos del documento
  isAvailable(): boolean;
  requiresPrescription(): boolean;
  hasInteractionWith(medicationId: string): boolean;
  isContraindicatedFor(conditions: string[]): boolean;
}

// Filtros para búsqueda de medicamentos
export interface MedicationFilters {
  nombre?: string;
  principioActivo?: string;
  grupoTerapeutico?: string;
  laboratorio?: string;
  formaFarmaceutica?: string[];
  disponibilidad?: string[];
  requiereReceta?: boolean;
  precioMin?: number;
  precioMax?: number;
  activo?: boolean;
}

// Estadísticas de medicamentos
export interface MedicationStats {
  totalMedicamentos: number;
  disponibles: number;
  agotados: number;
  requierenReceta: number;
  medicamentosControlados: number;
  gruposTerapeuticos: { grupo: string; cantidad: number }[];
}

// Datos para creación de medicamento
export interface CreateMedicationData {
  drugInfo: DrugInfo;
  pharmacologicalInfo: PharmacologicalInfo;
  dosageInfo: DosageInfo;
  storageInfo: StorageInfo;
  commercialInfo: Omit<CommercialInfo, 'ultimaActualizacionPrecio'>;
  observaciones?: string;
}

// Datos para actualización de medicamento
export interface UpdateMedicationData {
  drugInfo?: Partial<DrugInfo>;
  pharmacologicalInfo?: Partial<PharmacologicalInfo>;
  dosageInfo?: Partial<DosageInfo>;
  storageInfo?: Partial<StorageInfo>;
  commercialInfo?: Partial<CommercialInfo>;
  observaciones?: string;
  activo?: boolean;
}

// Enums para mayor tipo seguridad
export enum PharmaceuticalForm {
  TABLETA = 'tableta',
  CAPSULA = 'capsula',
  JARABE = 'jarabe',
  INYECTABLE = 'inyectable',
  CREMA = 'crema',
  GOTAS = 'gotas',
  PARCHE = 'parche',
  INHALADOR = 'inhalador',
  SUPOSITORIO = 'supositorio',
  OTROS = 'otros'
}

export enum Availability {
  AVAILABLE = 'disponible',
  OUT_OF_STOCK = 'agotado',
  DISCONTINUED = 'descontinuado',
  LOW_STOCK = 'bajo_stock'
}

export enum PregnancyCategory {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  X = 'X'
}