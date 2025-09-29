const mongoose = require('mongoose');

// Schema principal de medicamento
const medicationSchema = new mongoose.Schema({
  medicationId: {
    type: String,
    unique: true,
    default: function() {
      return 'MED-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'El ID del paciente es requerido']
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del medicamento es requerido'],
    trim: true,
    maxlength: [200, 'El nombre del medicamento no puede exceder 200 caracteres']
  },
  dosis: {
    type: String,
    required: [true, 'La dosis es requerida'],
    trim: true,
    maxlength: [100, 'La dosis no puede exceder 100 caracteres']
  },
  frecuencia: {
    type: String,
    required: [true, 'La frecuencia es requerida'],
    trim: true,
    maxlength: [100, 'La frecuencia no puede exceder 100 caracteres']
  },
  via: {
    type: String,
    required: [true, 'La vía de administración es requerida'],
    enum: {
      values: ['Oral', 'IV', 'IM', 'SC', 'Tópica', 'Inhalatoria', 'Rectal', 'Sublingual', 'Otra'],
      message: 'Vía de administración inválida'
    },
    default: 'Oral'
  },
  indicacion: {
    type: String,
    required: [true, 'La indicación es requerida'],
    trim: true,
    maxlength: [500, 'La indicación no puede exceder 500 caracteres']
  },
  medicoPrescriptor: {
    type: String,
    required: [true, 'El médico prescriptor es requerido'],
    trim: true,
    maxlength: [100, 'El nombre del médico no puede exceder 100 caracteres']
  },
  fechaInicio: {
    type: Date,
    required: [true, 'La fecha de inicio es requerida'],
    default: Date.now
  },
  fechaFin: {
    type: Date,
    default: null
  },
  estado: {
    type: String,
    required: [true, 'El estado es requerido'],
    enum: {
      values: ['Activo', 'Suspendido', 'Finalizado'],
      message: 'Estado inválido. Debe ser: Activo, Suspendido, Finalizado'
    },
    default: 'Activo'
  },
  observaciones: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las observaciones no pueden exceder 1000 caracteres'],
    default: ''
  },
  efectosSecundarios: {
    type: [String],
    default: []
  },
  adherencia: {
    type: Number,
    min: [0, 'La adherencia no puede ser menor a 0%'],
    max: [100, 'La adherencia no puede ser mayor a 100%'],
    default: 100
  },
  costo: {
    type: Number,
    min: [0, 'El costo no puede ser negativo'],
    default: 0
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Índices para optimizar búsquedas
medicationSchema.index({ patientId: 1, fechaInicio: -1 });
medicationSchema.index({ estado: 1 });
medicationSchema.index({ medicoPrescriptor: 1 });
medicationSchema.index({ via: 1 });
medicationSchema.index({ medicationId: 1 }, { unique: true });
medicationSchema.index({ 
  nombre: 'text', 
  indicacion: 'text', 
  observaciones: 'text',
  medicoPrescriptor: 'text'
});

// Middleware pre-save
medicationSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.fechaActualizacion = new Date();
  }
  
  // Si se marca como finalizado, establecer fecha de fin
  if (this.estado === 'Finalizado' && !this.fechaFin) {
    this.fechaFin = new Date();
  }
  
  next();
});

// Método virtual para obtener la duración del tratamiento
medicationSchema.virtual('duracionTratamiento').get(function() {
  if (!this.fechaFin) return null;
  
  const inicio = new Date(this.fechaInicio);
  const fin = new Date(this.fechaFin);
  const diffTime = Math.abs(fin - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Método virtual para verificar si está activo
medicationSchema.virtual('estaActivo').get(function() {
  return this.estado === 'Activo';
});

// Método estático para obtener medicamentos por paciente
medicationSchema.statics.findByPatient = function(patientId, options = {}) {
  return this.find({ patientId, ...options }).sort({ fechaInicio: -1 });
};

// Método estático para obtener medicamentos activos por paciente
medicationSchema.statics.findActiveByPatient = function(patientId) {
  return this.find({ 
    patientId, 
    estado: 'Activo' 
  }).sort({ fechaInicio: -1 });
};

// Método estático para obtener medicamentos por estado
medicationSchema.statics.findByStatus = function(estado) {
  return this.find({ estado }).sort({ fechaInicio: -1 });
};

// Método estático para detectar posibles interacciones
medicationSchema.statics.checkInteractions = function(patientId, newMedication) {
  // Esta es una implementación básica - en producción se conectaría a una base de datos de interacciones
  return this.findActiveByPatient(patientId).then(activeMedications => {
    const interactions = [];
    
    activeMedications.forEach(med => {
      // Lógica básica de detección de interacciones
      if (med.nombre.toLowerCase().includes('warfarina') && 
          newMedication.toLowerCase().includes('aspirina')) {
        interactions.push({
          medicamentos: [med.nombre, newMedication],
          tipo: 'mayor',
          descripcion: 'Riesgo aumentado de hemorragia',
          recomendacion: 'Monitorear INR frecuentemente'
        });
      }
      
      if (med.nombre.toLowerCase().includes('metformina') && 
          newMedication.toLowerCase().includes('enalapril')) {
        interactions.push({
          medicamentos: [med.nombre, newMedication],
          tipo: 'menor',
          descripcion: 'Interacción menor. Monitorear función renal.',
          recomendacion: 'Controlar creatinina sérica regularmente'
        });
      }
    });
    
    return interactions;
  });
};

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;