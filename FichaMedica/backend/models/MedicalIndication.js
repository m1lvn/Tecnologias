const mongoose = require('mongoose');

// Schema principal de indicación médica
const indicationSchema = new mongoose.Schema({
  indicationId: {
    type: String,
    unique: true,
    default: function() {
      return 'IND-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'El ID del paciente es requerido']
  },
  titulo: {
    type: String,
    required: [true, 'El título de la indicación es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
  },
  tipo: {
    type: String,
    required: [true, 'El tipo de indicación es requerido'],
    enum: {
      values: ['Dieta', 'Seguimiento', 'Reposo', 'Ejercicio', 'Control', 'Cuidados', 'Medicación'],
      message: 'Tipo de indicación inválido'
    }
  },
  estado: {
    type: String,
    required: [true, 'El estado es requerido'],
    enum: {
      values: ['Vigente', 'Completado', 'Pendiente', 'Cancelado'],
      message: 'Estado inválido'
    },
    default: 'Vigente'
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha es requerida'],
    default: Date.now
  },
  fechaVencimiento: {
    type: Date,
    default: null
  },
  medico: {
    type: String,
    required: [true, 'El médico es requerido'],
    trim: true,
    maxlength: [100, 'El nombre del médico no puede exceder 100 caracteres']
  },
  prioridad: {
    type: String,
    enum: {
      values: ['baja', 'media', 'alta', 'urgente'],
      message: 'Prioridad inválida'
    },
    default: 'media'
  },
  recordatorios: {
    type: [Date],
    default: []
  },
  notas: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres'],
    default: ''
  },
  fechaCompletado: {
    type: Date,
    default: null
  },
  resultados: {
    type: String,
    trim: true,
    maxlength: [1000, 'Los resultados no pueden exceder 1000 caracteres'],
    default: ''
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
indicationSchema.index({ patientId: 1, fecha: -1 });
indicationSchema.index({ estado: 1 });
indicationSchema.index({ tipo: 1 });
indicationSchema.index({ prioridad: 1 });
indicationSchema.index({ fechaVencimiento: 1 });
indicationSchema.index({ medico: 1 });
indicationSchema.index({ indicationId: 1 }, { unique: true });
indicationSchema.index({ 
  titulo: 'text', 
  descripcion: 'text', 
  notas: 'text',
  medico: 'text'
});

// Middleware pre-save
indicationSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.fechaActualizacion = new Date();
  }
  
  // Si se marca como completado, establecer fecha de completado
  if (this.estado === 'Completado' && !this.fechaCompletado) {
    this.fechaCompletado = new Date();
  }
  
  next();
});

// Método virtual para verificar si está vencida
indicationSchema.virtual('estaVencida').get(function() {
  if (!this.fechaVencimiento) return false;
  return new Date() > this.fechaVencimiento;
});

// Método virtual para obtener días restantes
indicationSchema.virtual('diasRestantes').get(function() {
  if (!this.fechaVencimiento) return null;
  
  const hoy = new Date();
  const vencimiento = new Date(this.fechaVencimiento);
  const diffTime = vencimiento - hoy;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Método virtual para obtener el estado con vencimiento
indicationSchema.virtual('estadoCompleto').get(function() {
  if (this.estaVencida && this.estado === 'Vigente') {
    return 'Vencida';
  }
  return this.estado;
});

// Método estático para obtener indicaciones por paciente
indicationSchema.statics.findByPatient = function(patientId, options = {}) {
  return this.find({ patientId, ...options }).sort({ fecha: -1 });
};

// Método estático para obtener indicaciones vigentes por paciente
indicationSchema.statics.findActiveByPatient = function(patientId) {
  return this.find({ 
    patientId, 
    estado: { $in: ['Vigente', 'Pendiente'] }
  }).sort({ prioridad: -1, fecha: -1 });
};

// Método estático para obtener indicaciones por vencer
indicationSchema.statics.findDueSoon = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    fechaVencimiento: { 
      $gte: new Date(), 
      $lte: futureDate 
    },
    estado: { $in: ['Vigente', 'Pendiente'] }
  }).populate('patientId', 'nombres apellidos documento').sort({ fechaVencimiento: 1 });
};

// Método estático para obtener indicaciones vencidas
indicationSchema.statics.findOverdue = function() {
  return this.find({
    fechaVencimiento: { $lt: new Date() },
    estado: { $in: ['Vigente', 'Pendiente'] }
  }).populate('patientId', 'nombres apellidos documento').sort({ fechaVencimiento: 1 });
};

// Método estático para obtener estadísticas de indicaciones
indicationSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$estado',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        estado: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);
};

const MedicalIndication = mongoose.model('MedicalIndication', indicationSchema);

module.exports = MedicalIndication;