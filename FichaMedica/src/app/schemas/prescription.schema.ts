import { Schema, model } from 'mongoose';
import { IPrescriptionDocument, PrescriptionStatus, PrescriptionType } from '../models/prescription.interface';

// Esquema para medicamento prescrito
const PrescribedMedicationSchema = new Schema({
  medicationId: {
    type: String,
    required: [true, 'El ID del medicamento es obligatorio']
  },
  nombreMedicamento: {
    type: String,
    required: [true, 'El nombre del medicamento es obligatorio'],
    trim: true
  },
  principioActivo: {
    type: String,
    required: [true, 'El principio activo es obligatorio'],
    trim: true
  },
  concentracion: {
    type: String,
    required: [true, 'La concentración es obligatoria'],
    trim: true
  },
  formaFarmaceutica: {
    type: String,
    required: [true, 'La forma farmacéutica es obligatoria'],
    trim: true
  },
  dosis: {
    type: String,
    required: [true, 'La dosis es obligatoria'],
    trim: true
  },
  viaAdministracion: {
    type: String,
    required: [true, 'La vía de administración es obligatoria'],
    trim: true
  },
  frecuencia: {
    type: String,
    required: [true, 'La frecuencia es obligatoria'],
    trim: true
  },
  duracion: {
    type: String,
    required: [true, 'La duración es obligatoria'],
    trim: true
  },
  cantidadTotal: {
    type: Number,
    required: [true, 'La cantidad total es obligatoria'],
    min: [1, 'La cantidad debe ser mayor a 0']
  },
  unidad: {
    type: String,
    required: [true, 'La unidad es obligatoria'],
    trim: true
  },
  instrucciones: {
    type: String,
    required: [true, 'Las instrucciones son obligatorias'],
    trim: true
  },
  observaciones: {
    type: String,
    trim: true
  },
  sustituible: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Esquema para información del prescriptor
const PrescriptorInfoSchema = new Schema({
  doctorId: {
    type: String,
    required: [true, 'El ID del doctor es obligatorio']
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
    required: [true, 'La especialidad es obligatoria'],
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
  },
  colegioProfesional: String,
  firma: String
}, { _id: false });

// Esquema para estado de prescripción
const PrescriptionStatusInfoSchema = new Schema({
  estado: {
    type: String,
    required: [true, 'El estado es obligatorio'],
    enum: {
      values: Object.values(PrescriptionStatus),
      message: 'Estado de prescripción inválido'
    },
    default: PrescriptionStatus.VIGENTE
  },
  fechaCambio: {
    type: Date,
    default: Date.now
  },
  motivoCambio: String,
  cambiadoPor: String,
  porcentajeDispensado: {
    type: Number,
    min: [0, 'El porcentaje no puede ser negativo'],
    max: [100, 'El porcentaje no puede exceder 100%'],
    default: 0
  }
}, { _id: false });

// Esquema para dispensación
const DispensationSchema = new Schema({
  dispensationId: {
    type: String,
    required: [true, 'El ID de dispensación es obligatorio']
  },
  farmaciaId: String,
  nombreFarmacia: String,
  farmaceuticoId: String,
  nombreFarmaceutico: String,
  fechaDispensacion: {
    type: Date,
    required: [true, 'La fecha de dispensación es obligatoria']
  },
  cantidadDispensada: {
    type: Number,
    required: [true, 'La cantidad dispensada es obligatoria'],
    min: [1, 'La cantidad debe ser mayor a 0']
  },
  loteNumero: String,
  fechaVencimiento: Date,
  costoTotal: {
    type: Number,
    min: [0, 'El costo no puede ser negativo']
  },
  observaciones: String
}, { _id: false });

// Esquema para efectos secundarios
const SideEffectSchema = new Schema({
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  intensidad: {
    type: Number,
    required: [true, 'La intensidad es obligatoria'],
    min: [1, 'La intensidad mínima es 1'],
    max: [5, 'La intensidad máxima es 5']
  },
  fechaInicio: {
    type: Date,
    required: [true, 'La fecha de inicio es obligatoria']
  },
  fechaFin: Date,
  resuelto: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Esquema para eficacia
const EfficacySchema = new Schema({
  mejorias: [{
    type: String,
    trim: true
  }],
  puntuacion: {
    type: Number,
    required: [true, 'La puntuación es obligatoria'],
    min: [1, 'La puntuación mínima es 1'],
    max: [5, 'La puntuación máxima es 5']
  },
  observaciones: String
}, { _id: false });

// Esquema para seguimiento
const FollowUpInfoSchema = new Schema({
  adherencia: {
    type: Number,
    min: [0, 'La adherencia no puede ser negativa'],
    max: [100, 'La adherencia no puede exceder 100%']
  },
  efectosSecundarios: [SideEffectSchema],
  eficacia: EfficacySchema,
  motivosSuspension: [String]
}, { _id: false });

// Esquema para alertas
const PrescriptionAlertsSchema = new Schema({
  alergias: {
    type: Boolean,
    default: false
  },
  interacciones: {
    type: Boolean,
    default: false
  },
  contraindicaciones: {
    type: Boolean,
    default: false
  },
  dosisMaxima: {
    type: Boolean,
    default: false
  },
  duplicaciones: {
    type: Boolean,
    default: false
  },
  embarazoLactancia: {
    type: Boolean,
    default: false
  },
  alertasPersonalizadas: [String]
}, { _id: false });

// Esquema principal de prescripción
const PrescriptionSchema = new Schema({
  prescriptionId: {
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
  consultationId: {
    type: String,
    index: true
  },
  prescriptorInfo: {
    type: PrescriptorInfoSchema,
    required: true
  },
  fechaPrescripcion: {
    type: Date,
    required: [true, 'La fecha de prescripción es obligatoria'],
    default: Date.now,
    index: true
  },
  fechaValidez: {
    type: Date,
    required: [true, 'La fecha de validez es obligatoria'],
    index: true
  },
  medicamentos: {
    type: [PrescribedMedicationSchema],
    required: [true, 'Debe haber al menos un medicamento'],
    validate: {
      validator: function(medicamentos: any[]) {
        return medicamentos.length > 0;
      },
      message: 'Debe prescribir al menos un medicamento'
    }
  },
  status: {
    type: PrescriptionStatusInfoSchema,
    required: true
  },
  dispensaciones: [DispensationSchema],
  followUp: FollowUpInfoSchema,
  alerts: {
    type: PrescriptionAlertsSchema,
    required: true
  },
  indicacionesGenerales: String,
  observaciones: String,
  tipoReceta: {
    type: String,
    required: [true, 'El tipo de receta es obligatorio'],
    enum: {
      values: Object.values(PrescriptionType),
      message: 'Tipo de receta inválido'
    },
    default: PrescriptionType.NORMAL
  },
  codigoQR: String,
  firmaDigital: String,
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaModificacion: Date
}, {
  timestamps: true,
  collection: 'prescriptions'
});

// Índices para optimizar búsquedas
PrescriptionSchema.index({ patientId: 1, fechaPrescripcion: -1 });
PrescriptionSchema.index({ 'prescriptorInfo.doctorId': 1, fechaPrescripcion: -1 });
PrescriptionSchema.index({ 'status.estado': 1 });
PrescriptionSchema.index({ fechaValidez: 1 });
PrescriptionSchema.index({ tipoReceta: 1 });
PrescriptionSchema.index({ 'medicamentos.medicationId': 1 });

// Middleware pre-save
PrescriptionSchema.pre('save', function(this: IPrescriptionDocument, next) {
  if (!this.prescriptionId) {
    this.prescriptionId = `PRESC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  if (this.isModified() && !this.isNew) {
    this.fechaModificacion = new Date();
  }

  next();
});

// Métodos del documento
PrescriptionSchema.methods['isValid'] = function(this: IPrescriptionDocument): boolean {
  const now = new Date();
  return this.fechaValidez >= now && this.status.estado === PrescriptionStatus.VIGENTE;
};

PrescriptionSchema.methods['isExpired'] = function(this: IPrescriptionDocument): boolean {
  const now = new Date();
  return this.fechaValidez < now;
};

PrescriptionSchema.methods['canBeDispensed'] = function(this: IPrescriptionDocument): boolean {
  return this.isValid() && (this.status?.porcentajeDispensado || 0) < 100;
};

PrescriptionSchema.methods['getTotalCost'] = function(this: IPrescriptionDocument): number {
  if (!this.dispensaciones) return 0;
  
  return this.dispensaciones.reduce((total, dispensacion) => {
    return total + (dispensacion.costoTotal || 0);
  }, 0);
};

PrescriptionSchema.methods['hasInteractions'] = function(this: IPrescriptionDocument): boolean {
  return this.alerts.interacciones;
};

PrescriptionSchema.methods['getRemainingDays'] = function(this: IPrescriptionDocument): number {
  const now = new Date();
  const validUntil = new Date(this.fechaValidez);
  const diffTime = validUntil.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

PrescriptionSchema.methods['calculateAdherence'] = function(this: IPrescriptionDocument): number {
  return this.followUp?.adherencia || 0;
};

// Métodos estáticos
PrescriptionSchema.statics['findByPatient'] = function(patientId: string) {
  return this.find({ patientId }).sort({ fechaPrescripcion: -1 });
};

PrescriptionSchema.statics['findActiveByPatient'] = function(patientId: string) {
  return this.find({ 
    patientId,
    'status.estado': PrescriptionStatus.VIGENTE,
    fechaValidez: { $gte: new Date() }
  }).sort({ fechaPrescripcion: -1 });
};

PrescriptionSchema.statics['findExpiring'] = function(days: number = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    'status.estado': PrescriptionStatus.VIGENTE,
    fechaValidez: { $lte: futureDate, $gte: new Date() }
  });
};

export const Prescription = model<IPrescriptionDocument>('Prescription', PrescriptionSchema);