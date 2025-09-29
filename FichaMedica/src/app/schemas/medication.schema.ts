import { Schema, model } from 'mongoose';
import { IMedicationDocument, PharmaceuticalForm, Availability, PregnancyCategory } from '../models/medication.interface';

// Esquema para información del medicamento
const DrugInfoSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del medicamento es obligatorio'],
    trim: true,
    maxlength: [200, 'El nombre no puede exceder 200 caracteres']
  },
  nombreComercial: {
    type: String,
    trim: true,
    maxlength: [200, 'El nombre comercial no puede exceder 200 caracteres']
  },
  principioActivo: {
    type: String,
    required: [true, 'El principio activo es obligatorio'],
    trim: true,
    maxlength: [200, 'El principio activo no puede exceder 200 caracteres']
  },
  concentracion: {
    type: String,
    required: [true, 'La concentración es obligatoria'],
    trim: true
  },
  formaFarmaceutica: {
    type: String,
    required: [true, 'La forma farmacéutica es obligatoria'],
    enum: {
      values: Object.values(PharmaceuticalForm),
      message: 'Forma farmacéutica inválida'
    }
  },
  laboratorio: {
    type: String,
    trim: true
  },
  codigoBarras: String,
  registroSanitario: String
}, { _id: false });

// Esquema para información farmacológica
const PharmacologicalInfoSchema = new Schema({
  grupoTerapeutico: {
    type: String,
    required: [true, 'El grupo terapéutico es obligatorio'],
    trim: true
  },
  mecanismoAccion: String,
  indicaciones: [{
    type: String,
    trim: true
  }],
  contraindicaciones: [{
    type: String,
    trim: true
  }],
  efectosSecundarios: [{
    type: String,
    trim: true
  }],
  interaccionesMedicamentosas: [{
    type: String,
    trim: true
  }],
  precauciones: [{
    type: String,
    trim: true
  }],
  embarazoLactancia: {
    type: String,
    enum: Object.values(PregnancyCategory)
  }
}, { _id: false });

// Esquema para información de dosificación
const DosageInfoSchema = new Schema({
  dosis: {
    adultos: String,
    pediatrica: String,
    geriatrica: String
  },
  viaAdministracion: [{
    type: String,
    trim: true
  }],
  frecuencia: [{
    type: String,
    trim: true
  }],
  duracionTratamiento: String,
  dosisMaximaDiaria: String
}, { _id: false });

// Esquema para información de almacenamiento
const StorageInfoSchema = new Schema({
  temperaturaAlmacenamiento: {
    type: String,
    required: [true, 'La temperatura de almacenamiento es obligatoria'],
    trim: true
  },
  condicionesEspeciales: [String],
  vidaUtil: {
    type: String,
    required: [true, 'La vida útil es obligatoria'],
    trim: true
  },
  condicionesConservacion: {
    type: String,
    required: [true, 'Las condiciones de conservación son obligatorias'],
    trim: true
  },
  fotosensible: {
    type: Boolean,
    default: false
  },
  refrigeracion: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Esquema para información comercial
const CommercialInfoSchema = new Schema({
  precio: {
    type: Number,
    min: [0, 'El precio no puede ser negativo']
  },
  coberturaSeguros: [String],
  disponibilidad: {
    type: String,
    required: [true, 'La disponibilidad es obligatoria'],
    enum: {
      values: Object.values(Availability),
      message: 'Estado de disponibilidad inválido'
    },
    default: Availability.AVAILABLE
  },
  proveedor: String,
  ultimaActualizacionPrecio: Date,
  requiereReceta: {
    type: Boolean,
    required: [true, 'Se debe especificar si requiere receta'],
    default: true
  },
  medicamentoControlado: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Esquema principal del medicamento
const MedicationSchema = new Schema({
  medicationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  drugInfo: {
    type: DrugInfoSchema,
    required: true
  },
  pharmacologicalInfo: {
    type: PharmacologicalInfoSchema,
    required: true
  },
  dosageInfo: {
    type: DosageInfoSchema,
    required: true
  },
  storageInfo: {
    type: StorageInfoSchema,
    required: true
  },
  commercialInfo: {
    type: CommercialInfoSchema,
    required: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
    index: true
  },
  fechaActualizacion: Date,
  activo: {
    type: Boolean,
    default: true,
    index: true
  },
  observaciones: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las observaciones no pueden exceder 1000 caracteres']
  },
  imagenes: [String]
}, {
  timestamps: true,
  collection: 'medications'
});

// Índices para optimizar búsquedas
MedicationSchema.index({ 'drugInfo.nombre': 'text', 'drugInfo.principioActivo': 'text' });
MedicationSchema.index({ 'drugInfo.principioActivo': 1 });
MedicationSchema.index({ 'pharmacologicalInfo.grupoTerapeutico': 1 });
MedicationSchema.index({ 'drugInfo.laboratorio': 1 });
MedicationSchema.index({ 'commercialInfo.disponibilidad': 1 });
MedicationSchema.index({ 'commercialInfo.requiereReceta': 1 });
MedicationSchema.index({ activo: 1 });

// Middleware pre-save
MedicationSchema.pre('save', function(this: IMedicationDocument, next) {
  if (!this.medicationId) {
    this.medicationId = `MED-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  if (this.isModified() && !this.isNew) {
    this.fechaActualizacion = new Date();
  }

  if (this.isModified('commercialInfo.precio')) {
    this.commercialInfo.ultimaActualizacionPrecio = new Date();
  }

  next();
});

// Métodos del documento
MedicationSchema.methods['isAvailable'] = function(this: IMedicationDocument): boolean {
  return this.activo && this.commercialInfo.disponibilidad === Availability.AVAILABLE;
};

MedicationSchema.methods['requiresPrescription'] = function(this: IMedicationDocument): boolean {
  return this.commercialInfo.requiereReceta;
};

MedicationSchema.methods['hasInteractionWith'] = function(this: IMedicationDocument, medicationId: string): boolean {
  // Esta función requeriría una base de datos de interacciones
  // Por ahora retorna false, pero puede implementarse más adelante
  return false;
};

MedicationSchema.methods['isContraindicatedFor'] = function(this: IMedicationDocument, conditions: string[]): boolean {
  if (!conditions || conditions.length === 0) return false;
  
  return this.pharmacologicalInfo.contraindicaciones.some(contraindicacion =>
    conditions.some(condition => 
      contraindicacion.toLowerCase().includes(condition.toLowerCase())
    )
  );
};

// Métodos estáticos
MedicationSchema.statics['findAvailable'] = function() {
  return this.find({ 
    activo: true, 
    'commercialInfo.disponibilidad': Availability.AVAILABLE 
  });
};

MedicationSchema.statics['searchByName'] = function(searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
    activo: true
  }).sort({ score: { $meta: 'textScore' } });
};

MedicationSchema.statics['findByTherapeuticGroup'] = function(group: string) {
  return this.find({ 
    'pharmacologicalInfo.grupoTerapeutico': group,
    activo: true 
  });
};

export const Medication = model<IMedicationDocument>('Medication', MedicationSchema);