// Interfaces para el modelo de datos de Médicos/Doctores
import { Document } from 'mongoose';

// Información personal del doctor
export interface DoctorPersonalInfo {
  nombre: string;
  apellido: string;
  rut: string;
  fechaNacimiento: Date;
  sexo: 'M' | 'F' | 'Otro';
  direccion: string;
  telefono: string;
  email: string;
  telefonoEmergencia?: string;
  nacionalidad?: string;
}

// Información profesional
export interface ProfessionalInfo {
  registroMedico: string;
  especialidades: string[];
  subespecialidades?: string[];
  colegioProfesional: string;
  numeroColegiadoId: string;
  fechaTitulacion: Date;
  universidadTitulo: string;
  certificaciones?: {
    nombre: string;
    institucion: string;
    fechaObtencion: Date;
    fechaVencimiento?: Date;
    activa: boolean;
  }[];
  diplomados?: string[];
  maestrias?: string[];
  doctorados?: string[];
}

// Información laboral
export interface WorkInfo {
  centrosMedicos: {
    nombre: string;
    direccion: string;
    telefono: string;
    especialidad: string;
    horarios: {
      dia: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
      horaInicio: string;
      horaFin: string;
    }[];
    activo: boolean;
  }[];
  consultaPrivada?: {
    direccion: string;
    telefono: string;
    email?: string;
    horarios: {
      dia: string;
      horaInicio: string;
      horaFin: string;
    }[];
    valorConsulta?: number;
  };
  segurosAceptados?: string[];
}

// Experiencia profesional
export interface Experience {
  cargos: {
    institucion: string;
    cargo: string;
    fechaInicio: Date;
    fechaFin?: Date;
    descripcion?: string;
    actual: boolean;
  }[];
  experienciaAnios: number;
  areasExperiencia: string[];
  procedimientosEspecializados?: string[];
}

// Información académica
export interface AcademicInfo {
  investigaciones?: {
    titulo: string;
    tipo: 'articulo' | 'estudio' | 'tesis' | 'libro';
    fechaPublicacion: Date;
    revista?: string;
    coautores?: string[];
    resumen?: string;
  }[];
  conferencias?: {
    titulo: string;
    evento: string;
    fecha: Date;
    tipo: 'ponencia' | 'poster' | 'moderador';
    ubicacion: string;
  }[];
  premios?: {
    nombre: string;
    institucion: string;
    fecha: Date;
    descripcion?: string;
  }[];
}

// Configuraciones y preferencias
export interface DoctorPreferences {
  idiomas: string[];
  tiposConsulta: ('presencial' | 'telemedicina' | 'domiciliaria')[];
  duracionConsultaStandard: number; // minutos
  diasLaborales: string[];
  notificaciones: {
    email: boolean;
    sms: boolean;
    push: boolean;
    recordatoriosCitas: boolean;
    alertasMedicas: boolean;
  };
  firmaDigital?: string; // URL o base64
}

// Estadísticas del doctor
export interface DoctorStats {
  totalPacientes: number;
  consultasMes: number;
  consultasAno: number;
  promedioConsultasDiarias: number;
  especialidadPrincipal: string;
  puntuacionPromedio?: number;
  tiempoPromedioConsulta: number;
}

// Interfaz principal del doctor
export interface IDoctor {
  doctorId: string;
  personalInfo: DoctorPersonalInfo;
  professionalInfo: ProfessionalInfo;
  workInfo: WorkInfo;
  experience: Experience;
  academicInfo?: AcademicInfo;
  preferences: DoctorPreferences;
  activo: boolean;
  fechaRegistro: Date;
  fechaUltimaActividad?: Date;
  observaciones?: string;
  foto?: string; // URL de la foto
}

// Documento de MongoDB para doctor
export interface IDoctorDocument extends Omit<IDoctor, '_id'>, Document {
  // Métodos del documento
  getFullName(): string;
  getPrimarySpecialty(): string;
  isActiveInCenter(centerName: string): boolean;
  getExperienceYears(): number;
  canPerformProcedure(procedure: string): boolean;
  getWorkSchedule(day: string): any[];
  isAvailableAt(date: Date): boolean;
}

// Filtros para búsqueda de doctores
export interface DoctorFilters {
  nombre?: string;
  apellido?: string;
  especialidad?: string[];
  centroMedico?: string;
  activo?: boolean;
  experienciaMin?: number;
  certificaciones?: string[];
  atencionPrivada?: boolean;
  telemedicina?: boolean;
}

// Datos para creación de doctor
export interface CreateDoctorData {
  personalInfo: DoctorPersonalInfo;
  professionalInfo: ProfessionalInfo;
  workInfo: WorkInfo;
  experience: Experience;
  preferences: DoctorPreferences;
  observaciones?: string;
}

// Datos para actualización de doctor
export interface UpdateDoctorData {
  personalInfo?: Partial<DoctorPersonalInfo>;
  professionalInfo?: Partial<ProfessionalInfo>;
  workInfo?: Partial<WorkInfo>;
  experience?: Partial<Experience>;
  academicInfo?: Partial<AcademicInfo>;
  preferences?: Partial<DoctorPreferences>;
  activo?: boolean;
  observaciones?: string;
}

// Horario del doctor
export interface DoctorSchedule {
  doctorId: string;
  fecha: Date;
  horarios: {
    horaInicio: string;
    horaFin: string;
    disponible: boolean;
    motivo?: string; // Si no está disponible
    consultasAgendadas?: number;
  }[];
  centroMedico: string;
  observaciones?: string;
}

// Evaluación del doctor
export interface DoctorEvaluation {
  evaluationId: string;
  doctorId: string;
  patientId: string;
  consultationId: string;
  fecha: Date;
  puntuacion: 1 | 2 | 3 | 4 | 5;
  aspectos: {
    puntualidad: number;
    atencionAlPaciente: number;
    claridadExplicaciones: number;
    tiempoConsulta: number;
    resolucionProblemas: number;
  };
  comentarios?: string;
  recomendaria: boolean;
}

// Respuesta del API para lista de doctores
export interface DoctorsListResponse {
  doctors: IDoctor[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Enums para mayor tipo seguridad
export enum Specialty {
  MEDICINA_GENERAL = 'Medicina General',
  CARDIOLOGIA = 'Cardiología',
  DERMATOLOGIA = 'Dermatología',
  ENDOCRINOLOGIA = 'Endocrinología',
  GASTROENTEROLOGIA = 'Gastroenterología',
  GINECOLOGIA = 'Ginecología',
  NEUROLOGIA = 'Neurología',
  OFTALMOLOGIA = 'Oftalmología',
  ORTOPEDIA = 'Ortopedia',
  PEDIATRIA = 'Pediatría',
  PSIQUIATRIA = 'Psiquiatría',
  RADIOLOGIA = 'Radiología',
  UROLOGIA = 'Urología'
}

export enum ConsultationType {
  PRESENCIAL = 'presencial',
  TELEMEDICINA = 'telemedicina',
  DOMICILIARIA = 'domiciliaria'
}

export enum WorkDay {
  LUNES = 'lunes',
  MARTES = 'martes',
  MIERCOLES = 'miercoles',
  JUEVES = 'jueves',
  VIERNES = 'viernes',
  SABADO = 'sabado',
  DOMINGO = 'domingo'
}