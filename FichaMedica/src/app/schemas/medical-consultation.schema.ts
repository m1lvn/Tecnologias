import { Schema, model } from 'mongoose';
import { IMedicalConsultationDocument, ConsultationType, ConsultationStatus, DiagnosisType, Severity } from '../models/medical-consultation.interface';

// Esquema para signos vitales
const VitalSignsSchema = new Schema({
  presionArterial: {
    sistolica: {
      type: Number,
      required: [true, 'La presión sistólica es obligatoria'],
      min: [50, 'Presión sistólica muy baja'],
      max: [300, 'Presión sistólica muy alta']
    },
    diastolica: {
      type: Number,
      required: [true, 'La presión diastólica es obligatoria'],
      min: [30, 'Presión diastólica muy baja'],
      max: [200, 'Presión diastólica muy alta']
    }
  },
  frecuenciaCardiaca: {
    type: Number,
    required: [true, 'La frecuencia cardíaca es obligatoria'],
    min: [30, 'Frecuencia cardíaca muy baja'],
    max: [300, 'Frecuencia cardíaca muy alta']
  },
  temperatura: {
    type: Number,
    required: [true, 'La temperatura es obligatoria'],
    min: [30, 'Temperatura muy baja'],
    max: [45, 'Temperatura muy alta']
  },
  frecuenciaRespiratoria: {
    type: Number,
    min: [5, 'Frecuencia respiratoria muy baja'],
    max: [100, 'Frecuencia respiratoria muy alta']
  },
  saturacionOxigeno: {
    type: Number,
    min: [50, 'Saturación de oxígeno muy baja'],
    max: [100, 'Saturación de oxígeno no puede exceder 100%']
  },
  peso: {
    type: Number,
    min: [0.1, 'El peso debe ser mayor a 0'],
    max: [1000, 'El peso no puede exceder 1000 kg']
  },
  altura: {
    type: Number,
    min: [10, 'La altura debe ser mayor a 10 cm'],
    max: [300, 'La altura no puede exceder 300 cm']
  },
  imc: Number
}, { _id: false });

// Esquema para diagnósticos
const DiagnosisSchema = new Schema({
  codigo: {
    type: String,
    required: [true, 'El código CIE-10 es obligatorio'],
    trim: true,
    uppercase: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción del diagnóstico es obligatoria'],
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  tipo: {
    type: String,
    required: [true, 'El tipo de diagnóstico es obligatorio'],
    enum: {
      values: Object.values(DiagnosisType),
      message: 'Tipo de diagnóstico inválido'
    }
  },
  gravedad: {
    type: String,
    enum: {
      values: Object.values(Severity),
      message: 'Gravedad inválida'
    }
  },
  confirmado: {
    type: Boolean,
    default: false
  },
  fechaDiagnostico: {
    type: Date,
    default: Date.now
  },
  observaciones: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las observaciones no pueden exceder 1000 caracteres']
  }
}, { _id: false });

// Esquema para síntomas
const SymptomSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del síntoma es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción del síntoma es obligatoria'],
    trim: true
  },
  intensidad: {
    type: Number,
    required: [true, 'La intensidad del síntoma es obligatoria'],
    min: [1, 'La intensidad mínima es 1'],
    max: [5, 'La intensidad máxima es 5']
  },
  duracion: {
    type: String,
    required: [true, 'La duración del síntoma es obligatoria'],
    trim: true
  },
  frecuencia: {
    type: String,
    enum: ['constante', 'intermitente', 'ocasional']
  },
  factoresDesencadenantes: [String],
  factoresAliviantes: [String]
}, { _id: false });

// Esquema para examen físico
const PhysicalExamSchema = new Schema({
  aspecto: {
    type: String,
    required: [true, 'El aspecto general es obligatorio'],
    trim: true
  },
  conciencia: {
    type: String,
    required: [true, 'El estado de conciencia es obligatorio'],
    enum: ['alerta', 'somnoliento', 'estuporoso', 'comatoso']
  },
  orientacion: {
    type: String,
    required: [true, 'La orientación es obligatoria'],
    enum: ['orientado', 'desorientado_tiempo', 'desorientado_espacio', 'desorientado_persona']
  },
  sistemaCardiovascular: String,
  sistemaRespiratorio: String,
  sistemaDigestivo: String,
  sistemaNeurologico: String,
  pielYAnexos: String,
  aparatoLocomotor: String,
  otros: String
}, { _id: false });

// Esquema para derivaciones
const DerivacionSchema = new Schema({
  especialidad: {
    type: String,
    required: [true, 'La especialidad es obligatoria'],
    trim: true
  },
  medico: {
    type: String,
    trim: true
  },
  prioridad: {
    type: String,
    required: [true, 'La prioridad es obligatoria'],
    enum: ['urgente', 'alta', 'normal', 'baja']
  },
  motivo: {
    type: String,
    required: [true, 'El motivo de derivación es obligatorio'],
    trim: true
  }
}, { _id: false });

// Esquema para controles
const ControlSchema = new Schema({
  fecha: {
    type: Date,
    required: [true, 'La fecha del control es obligatoria']
  },
  tipo: {
    type: String,
    required: [true, 'El tipo de control es obligatorio'],
    enum: ['control', 'resultado_examen', 'seguimiento']
  },
  observaciones: {
    type: String,
    trim: true
  }
}, { _id: false });

// Esquema para reposo
const ReposoSchema = new Schema({
  tipo: {
    type: String,
    required: [true, 'El tipo de reposo es obligatorio'],
    enum: ['absoluto', 'relativo', 'laboral']
  },
  duracion: {
    type: String,
    required: [true, 'La duración del reposo es obligatoria'],
    trim: true
  },
  observaciones: {
    type: String,
    trim: true
  }
}, { _id: false });

// Esquema para plan de tratamiento
const TreatmentPlanSchema = new Schema({
  indicacionesGenerales: [{
    type: String,
    trim: true
  }],
  medicamentos: [{
    type: String,
    trim: true
  }],
  examenes: [{
    type: String,
    trim: true
  }],
  procedimientos: [{
    type: String,
    trim: true
  }],
  derivaciones: [DerivacionSchema],
  controles: [ControlSchema],
  reposo: ReposoSchema
}, { _id: false });

// Esquema para información del doctor
const DoctorInfoSchema = new Schema({
  doctorId: {
    type: String,
    required: [true, 'El ID del doctor es obligatorio'],
    trim: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del doctor es obligatorio'],
    trim: true
  },
  apellido: {
    type: String,
    required: [true, 'El apellido del doctor es obligatorio'],
    trim: true
  },
  especialidad: {
    type: String,
    required: [true, 'La especialidad del doctor es obligatoria'],
    trim: true
  },
  rut: {
    type: String,
    required: [true, 'El RUT del doctor es obligatorio'],
    trim: true
  },
  registroMedico: {
    type: String,
    required: [true, 'El registro médico es obligatorio'],
    trim: true
  }
}, { _id: false });

// Esquema para anamnesis
const AnamnesisSchema = new Schema({
  enfermedadActual: {
    type: String,
    required: [true, 'La enfermedad actual es obligatoria'],
    trim: true
  },
  antecedentesPersonales: {
    type: String,
    trim: true
  },
  antecedentesFamiliares: {
    type: String,
    trim: true
  },
  habitosYEstiloVida: {
    type: String,
    trim: true
  },
  medicamentosActuales: [{
    type: String,
    trim: true
  }]
}, { _id: false });

// Esquema para auditoría de consulta
const ConsultationAuditInfoSchema = new Schema({
  creadoPor: {
    type: String,
    required: [true, 'El creador es obligatorio']
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  modificadoPor: String,
  fechaModificacion: Date,
  version: {
    type: Number,
    default: 1
  },
  estado: {
    type: String,
    required: [true, 'El estado es obligatorio'],
    enum: {
      values: Object.values(ConsultationStatus),
      message: 'Estado de consulta inválido'
    },
    default: ConsultationStatus.BORRADOR
  }
}, { _id: false });

// Esquema principal de consulta médica
const MedicalConsultationSchema = new Schema({
  consultationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  patientId: {
    type: String,
    required: [true, 'El ID del paciente es obligatorio'],
    index: true
  },
  doctorInfo: {
    type: DoctorInfoSchema,
    required: true
  },
  fechaConsulta: {
    type: Date,
    required: [true, 'La fecha de consulta es obligatoria'],
    index: true
  },
  tipoConsulta: {
    type: String,
    required: [true, 'El tipo de consulta es obligatorio'],
    enum: {
      values: Object.values(ConsultationType),
      message: 'Tipo de consulta inválido'
    }
  },
  motivoConsulta: {
    type: String,
    required: [true, 'El motivo de consulta es obligatorio'],
    trim: true
  },
  anamnesis: {
    type: AnamnesisSchema,
    required: true
  },
  sintomas: [SymptomSchema],
  signosVitales: {
    type: VitalSignsSchema,
    required: true
  },
  examenFisico: {
    type: PhysicalExamSchema,
    required: true
  },
  diagnosticos: {
    type: [DiagnosisSchema],
    required: [true, 'Al menos un diagnóstico es obligatorio'],
    validate: {
      validator: function(diagnosticos: any[]) {
        return diagnosticos.length > 0;
      },
      message: 'Debe haber al menos un diagnóstico'
    }
  },
  planTratamiento: {
    type: TreatmentPlanSchema,
    required: true
  },
  auditInfo: {
    type: ConsultationAuditInfoSchema,
    required: true
  },
  documentosAdjuntos: [String],
  duracionConsulta: {
    type: Number,
    min: [1, 'La duración mínima es 1 minuto'],
    max: [600, 'La duración máxima es 600 minutos']
  },
  costoConsulta: {
    type: Number,
    min: [0, 'El costo no puede ser negativo']
  },
  observaciones: {
    type: String,
    trim: true,
    maxlength: [2000, 'Las observaciones no pueden exceder 2000 caracteres']
  }
}, {
  timestamps: true,
  collection: 'medicalConsultations'
});

// Índices para optimizar búsquedas
MedicalConsultationSchema.index({ patientId: 1, fechaConsulta: -1 });
MedicalConsultationSchema.index({ 'doctorInfo.doctorId': 1, fechaConsulta: -1 });
MedicalConsultationSchema.index({ 'doctorInfo.especialidad': 1 });
MedicalConsultationSchema.index({ tipoConsulta: 1 });
MedicalConsultationSchema.index({ 'auditInfo.estado': 1 });
MedicalConsultationSchema.index({ 'diagnosticos.codigo': 1 });
MedicalConsultationSchema.index({ 'diagnosticos.tipo': 1 });

// Middleware pre-save
MedicalConsultationSchema.pre('save', function(this: IMedicalConsultationDocument, next) {
  // Generar consultationId si no existe
  if (!this.consultationId) {
    this.consultationId = `CONS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  // Calcular IMC en signos vitales si es posible
  if (this.signosVitales.peso && this.signosVitales.altura && !this.signosVitales.imc) {
    const alturaEnMetros = this.signosVitales.altura / 100;
    this.signosVitales.imc = Number((this.signosVitales.peso / (alturaEnMetros * alturaEnMetros)).toFixed(2));
  }

  // Actualizar información de auditoría
  if (this.isModified() && !this.isNew) {
    this.auditInfo.version += 1;
    this.auditInfo.fechaModificacion = new Date();
  }

  next();
});

// Métodos del documento
MedicalConsultationSchema.methods['calcularIMC'] = function(this: IMedicalConsultationDocument): number {
  if (!this.signosVitales.peso || !this.signosVitales.altura) {
    return 0;
  }
  
  const alturaEnMetros = this.signosVitales.altura / 100;
  return Number((this.signosVitales.peso / (alturaEnMetros * alturaEnMetros)).toFixed(2));
};

MedicalConsultationSchema.methods['esConsultaUrgente'] = function(this: IMedicalConsultationDocument): boolean {
  return this.tipoConsulta === ConsultationType.URGENCIA;
};

MedicalConsultationSchema.methods['obtenerDiagnosticoPrincipal'] = function(this: IMedicalConsultationDocument) {
  return this.diagnosticos.find(d => d.tipo === DiagnosisType.PRINCIPAL) || null;
};

MedicalConsultationSchema.methods['calcularTiempoEvolucion'] = function(this: IMedicalConsultationDocument): number {
  const ahora = new Date();
  const fechaConsulta = new Date(this.fechaConsulta);
  const diferencia = ahora.getTime() - fechaConsulta.getTime();
  return Math.floor(diferencia / (1000 * 60 * 60 * 24)); // días
};

MedicalConsultationSchema.methods['generarResumen'] = function(this: IMedicalConsultationDocument): string {
  const diagnosticoPrincipal = this.obtenerDiagnosticoPrincipal();
  const doctor = `${this.doctorInfo.nombre} ${this.doctorInfo.apellido}`;
  const fecha = this.fechaConsulta.toLocaleDateString();
  
  return `Consulta ${this.tipoConsulta} - ${fecha} - Dr. ${doctor} - ${diagnosticoPrincipal?.descripcion || 'Sin diagnóstico principal'}`;
};

// Métodos estáticos
MedicalConsultationSchema.statics['findByPatient'] = function(patientId: string) {
  return this.find({ patientId }).sort({ fechaConsulta: -1 });
};

MedicalConsultationSchema.statics['findByDoctor'] = function(doctorId: string) {
  return this.find({ 'doctorInfo.doctorId': doctorId }).sort({ fechaConsulta: -1 });
};

MedicalConsultationSchema.statics['findByDateRange'] = function(startDate: Date, endDate: Date) {
  return this.find({
    fechaConsulta: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ fechaConsulta: -1 });
};

// Crear y exportar el modelo
export const MedicalConsultation = model<IMedicalConsultationDocument>('MedicalConsultation', MedicalConsultationSchema);