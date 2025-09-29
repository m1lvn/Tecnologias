import { Schema, model } from 'mongoose';
import { IDoctorDocument, Specialty, ConsultationType, WorkDay } from '../models/doctor.interface';

// Esquema para información personal del doctor
const DoctorPersonalInfoSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true,
    maxlength: [50, 'El apellido no puede exceder 50 caracteres']
  },
  rut: {
    type: String,
    required: [true, 'El RUT es obligatorio'],
    unique: true,
    trim: true
  },
  fechaNacimiento: {
    type: Date,
    required: [true, 'La fecha de nacimiento es obligatoria']
  },
  sexo: {
    type: String,
    required: [true, 'El sexo es obligatorio'],
    enum: ['M', 'F', 'Otro']
  },
  direccion: {
    type: String,
    required: [true, 'La dirección es obligatoria'],
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    trim: true,
    lowercase: true
  },
  telefonoEmergencia: String,
  nacionalidad: String
}, { _id: false });

// Esquema para certificaciones
const CertificationSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la certificación es obligatorio'],
    trim: true
  },
  institucion: {
    type: String,
    required: [true, 'La institución es obligatoria'],
    trim: true
  },
  fechaObtencion: {
    type: Date,
    required: [true, 'La fecha de obtención es obligatoria']
  },
  fechaVencimiento: Date,
  activa: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Esquema para información profesional
const ProfessionalInfoSchema = new Schema({
  registroMedico: {
    type: String,
    required: [true, 'El registro médico es obligatorio'],
    unique: true,
    trim: true
  },
  especialidades: [{
    type: String,
    required: [true, 'Debe tener al menos una especialidad'],
    trim: true
  }],
  subespecialidades: [String],
  colegioProfesional: {
    type: String,
    required: [true, 'El colegio profesional es obligatorio'],
    trim: true
  },
  numeroColegiadoId: {
    type: String,
    required: [true, 'El número de colegiado es obligatorio'],
    trim: true
  },
  fechaTitulacion: {
    type: Date,
    required: [true, 'La fecha de titulación es obligatoria']
  },
  universidadTitulo: {
    type: String,
    required: [true, 'La universidad de título es obligatoria'],
    trim: true
  },
  certificaciones: [CertificationSchema],
  diplomados: [String],
  maestrias: [String],
  doctorados: [String]
}, { _id: false });

// Esquema para horarios
const ScheduleSchema = new Schema({
  dia: {
    type: String,
    required: [true, 'El día es obligatorio'],
    enum: Object.values(WorkDay)
  },
  horaInicio: {
    type: String,
    required: [true, 'La hora de inicio es obligatoria']
  },
  horaFin: {
    type: String,
    required: [true, 'La hora de fin es obligatoria']
  }
}, { _id: false });

// Esquema para centros médicos
const MedicalCenterSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del centro médico es obligatorio'],
    trim: true
  },
  direccion: {
    type: String,
    required: [true, 'La dirección es obligatoria'],
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true
  },
  especialidad: {
    type: String,
    required: [true, 'La especialidad es obligatoria'],
    trim: true
  },
  horarios: [ScheduleSchema],
  activo: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Esquema para consulta privada
const PrivateConsultationSchema = new Schema({
  direccion: {
    type: String,
    required: [true, 'La dirección es obligatoria'],
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true
  },
  email: String,
  horarios: [ScheduleSchema],
  valorConsulta: {
    type: Number,
    min: [0, 'El valor no puede ser negativo']
  }
}, { _id: false });

// Esquema para información laboral
const WorkInfoSchema = new Schema({
  centrosMedicos: [MedicalCenterSchema],
  consultaPrivada: PrivateConsultationSchema,
  segurosAceptados: [String]
}, { _id: false });

// Esquema para cargos
const PositionSchema = new Schema({
  institucion: {
    type: String,
    required: [true, 'La institución es obligatoria'],
    trim: true
  },
  cargo: {
    type: String,
    required: [true, 'El cargo es obligatorio'],
    trim: true
  },
  fechaInicio: {
    type: Date,
    required: [true, 'La fecha de inicio es obligatoria']
  },
  fechaFin: Date,
  descripcion: String,
  actual: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Esquema para experiencia
const ExperienceSchema = new Schema({
  cargos: [PositionSchema],
  experienciaAnios: {
    type: Number,
    required: [true, 'Los años de experiencia son obligatorios'],
    min: [0, 'La experiencia no puede ser negativa']
  },
  areasExperiencia: [String],
  procedimientosEspecializados: [String]
}, { _id: false });

// Esquema para investigaciones
const ResearchSchema = new Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true
  },
  tipo: {
    type: String,
    required: [true, 'El tipo es obligatorio'],
    enum: ['articulo', 'estudio', 'tesis', 'libro']
  },
  fechaPublicacion: {
    type: Date,
    required: [true, 'La fecha de publicación es obligatoria']
  },
  revista: String,
  coautores: [String],
  resumen: String
}, { _id: false });

// Esquema para conferencias
const ConferenceSchema = new Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true
  },
  evento: {
    type: String,
    required: [true, 'El evento es obligatorio'],
    trim: true
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha es obligatoria']
  },
  tipo: {
    type: String,
    required: [true, 'El tipo es obligatorio'],
    enum: ['ponencia', 'poster', 'moderador']
  },
  ubicacion: {
    type: String,
    required: [true, 'La ubicación es obligatoria'],
    trim: true
  }
}, { _id: false });

// Esquema para premios
const AwardSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del premio es obligatorio'],
    trim: true
  },
  institucion: {
    type: String,
    required: [true, 'La institución es obligatoria'],
    trim: true
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha es obligatoria']
  },
  descripcion: String
}, { _id: false });

// Esquema para información académica
const AcademicInfoSchema = new Schema({
  investigaciones: [ResearchSchema],
  conferencias: [ConferenceSchema],
  premios: [AwardSchema]
}, { _id: false });

// Esquema para notificaciones
const NotificationSettingsSchema = new Schema({
  email: {
    type: Boolean,
    default: true
  },
  sms: {
    type: Boolean,
    default: false
  },
  push: {
    type: Boolean,
    default: true
  },
  recordatoriosCitas: {
    type: Boolean,
    default: true
  },
  alertasMedicas: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Esquema para preferencias
const DoctorPreferencesSchema = new Schema({
  idiomas: [{
    type: String,
    trim: true
  }],
  tiposConsulta: [{
    type: String,
    enum: Object.values(ConsultationType)
  }],
  duracionConsultaStandard: {
    type: Number,
    required: [true, 'La duración estándar es obligatoria'],
    min: [15, 'La duración mínima es 15 minutos'],
    max: [120, 'La duración máxima es 120 minutos']
  },
  diasLaborales: [String],
  notificaciones: NotificationSettingsSchema,
  firmaDigital: String
}, { _id: false });

// Esquema principal del doctor
const DoctorSchema = new Schema({
  doctorId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  personalInfo: {
    type: DoctorPersonalInfoSchema,
    required: true
  },
  professionalInfo: {
    type: ProfessionalInfoSchema,
    required: true
  },
  workInfo: {
    type: WorkInfoSchema,
    required: true
  },
  experience: {
    type: ExperienceSchema,
    required: true
  },
  academicInfo: AcademicInfoSchema,
  preferences: {
    type: DoctorPreferencesSchema,
    required: true
  },
  activo: {
    type: Boolean,
    default: true,
    index: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
    index: true
  },
  fechaUltimaActividad: Date,
  observaciones: String,
  foto: String
}, {
  timestamps: true,
  collection: 'doctors'
});

// Índices para optimizar búsquedas
DoctorSchema.index({ 'personalInfo.nombre': 'text', 'personalInfo.apellido': 'text' });
DoctorSchema.index({ 'personalInfo.rut': 1 }, { unique: true });
DoctorSchema.index({ 'professionalInfo.registroMedico': 1 }, { unique: true });
DoctorSchema.index({ 'professionalInfo.especialidades': 1 });
DoctorSchema.index({ 'workInfo.centrosMedicos.nombre': 1 });
DoctorSchema.index({ activo: 1 });

// Middleware pre-save
DoctorSchema.pre('save', function(this: IDoctorDocument, next) {
  if (!this.doctorId) {
    this.doctorId = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  next();
});

// Métodos del documento
DoctorSchema.methods['getFullName'] = function(this: IDoctorDocument): string {
  return `${this.personalInfo.nombre} ${this.personalInfo.apellido}`;
};

DoctorSchema.methods['getPrimarySpecialty'] = function(this: IDoctorDocument): string {
  return this.professionalInfo.especialidades[0] || '';
};

DoctorSchema.methods['isActiveInCenter'] = function(this: IDoctorDocument, centerName: string): boolean {
  return this.workInfo.centrosMedicos.some(center => 
    center.nombre.toLowerCase().includes(centerName.toLowerCase()) && center.activo
  );
};

DoctorSchema.methods['getExperienceYears'] = function(this: IDoctorDocument): number {
  return this.experience.experienciaAnios;
};

DoctorSchema.methods['canPerformProcedure'] = function(this: IDoctorDocument, procedure: string): boolean {
  return this.experience.procedimientosEspecializados?.some(proc =>
    proc.toLowerCase().includes(procedure.toLowerCase())
  ) || false;
};

DoctorSchema.methods['getWorkSchedule'] = function(this: IDoctorDocument, day: string): any[] {
  const schedules: any[] = [];
  
  this.workInfo.centrosMedicos.forEach(center => {
    const daySchedule = center.horarios.filter(h => h.dia === day);
    if (daySchedule.length > 0) {
      schedules.push({
        center: center.nombre,
        schedules: daySchedule
      });
    }
  });
  
  return schedules;
};

DoctorSchema.methods['isAvailableAt'] = function(this: IDoctorDocument, date: Date): boolean {
  // Esta función requeriría integración con sistema de citas
  // Por ahora retorna true si está activo
  return this.activo;
};

// Métodos estáticos
DoctorSchema.statics['findBySpecialty'] = function(specialty: string) {
  return this.find({ 
    'professionalInfo.especialidades': specialty,
    activo: true 
  });
};

DoctorSchema.statics['findByCenter'] = function(centerName: string) {
  return this.find({
    'workInfo.centrosMedicos.nombre': { $regex: centerName, $options: 'i' },
    'workInfo.centrosMedicos.activo': true,
    activo: true
  });
};

DoctorSchema.statics['searchDoctors'] = function(searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
    activo: true
  }).sort({ score: { $meta: 'textScore' } });
};

export const Doctor = model<IDoctorDocument>('Doctor', DoctorSchema);