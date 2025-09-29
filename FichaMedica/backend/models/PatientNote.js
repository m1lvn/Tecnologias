const mongoose = require('mongoose');

// Schema principal de nota del paciente
const noteSchema = new mongoose.Schema({
  noteId: {
    type: String,
    unique: true,
    default: function() {
      return 'NOTE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'El ID del paciente es requerido']
  },
  contenido: {
    type: String,
    required: [true, 'El contenido de la nota es requerido'],
    trim: true,
    maxlength: [2000, 'El contenido no puede exceder 2000 caracteres']
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha es requerida'],
    default: Date.now
  },
  usuario: {
    type: String,
    required: [true, 'El usuario es requerido'],
    trim: true,
    maxlength: [100, 'El nombre del usuario no puede exceder 100 caracteres']
  },
  tipo: {
    type: String,
    required: [true, 'El tipo de nota es requerido'],
    enum: {
      values: ['nota_rapida', 'observacion', 'recordatorio', 'alerta', 'seguimiento'],
      message: 'Tipo de nota inválido'
    },
    default: 'nota_rapida'
  },
  prioridad: {
    type: String,
    enum: {
      values: ['baja', 'media', 'alta'],
      message: 'Prioridad inválida'
    },
    default: 'media'
  },
  tags: {
    type: [String],
    default: []
  },
  privada: {
    type: Boolean,
    default: false
  },
  fechaVencimiento: {
    type: Date,
    default: null
  },
  completada: {
    type: Boolean,
    default: false
  },
  fechaCompletada: {
    type: Date,
    default: null
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
noteSchema.index({ patientId: 1, fecha: -1 });
noteSchema.index({ tipo: 1 });
noteSchema.index({ prioridad: 1 });
noteSchema.index({ usuario: 1 });
noteSchema.index({ completada: 1 });
noteSchema.index({ fechaVencimiento: 1 });
noteSchema.index({ noteId: 1 }, { unique: true });
noteSchema.index({ 
  contenido: 'text', 
  tags: 'text',
  usuario: 'text'
});

// Middleware pre-save
noteSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.fechaActualizacion = new Date();
  }
  
  // Si se marca como completada, establecer fecha de completada
  if (this.completada && !this.fechaCompletada) {
    this.fechaCompletada = new Date();
  }
  
  next();
});

// Método virtual para verificar si está vencida (solo para recordatorios)
noteSchema.virtual('estaVencida').get(function() {
  if (this.tipo !== 'recordatorio' || !this.fechaVencimiento) return false;
  return new Date() > this.fechaVencimiento && !this.completada;
});

// Método virtual para obtener el tiempo transcurrido
noteSchema.virtual('tiempoTranscurrido').get(function() {
  const ahora = new Date();
  const fecha = new Date(this.fecha);
  const diffMs = ahora - fecha;
  
  const minutos = Math.floor(diffMs / 60000);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  
  if (dias > 0) return `${dias} día${dias > 1 ? 's' : ''}`;
  if (horas > 0) return `${horas} hora${horas > 1 ? 's' : ''}`;
  if (minutos > 0) return `${minutos} minuto${minutos > 1 ? 's' : ''}`;
  return 'Ahora';
});

// Método estático para obtener notas por paciente
noteSchema.statics.findByPatient = function(patientId, options = {}) {
  return this.find({ patientId, ...options }).sort({ fecha: -1 });
};

// Método estático para obtener notas pendientes
noteSchema.statics.findPending = function(patientId = null) {
  const filter = { 
    tipo: 'recordatorio', 
    completada: false 
  };
  
  if (patientId) filter.patientId = patientId;
  
  return this.find(filter).sort({ fechaVencimiento: 1, prioridad: -1 });
};

// Método estático para obtener notas por tipo
noteSchema.statics.findByType = function(tipo, patientId = null) {
  const filter = { tipo };
  if (patientId) filter.patientId = patientId;
  
  return this.find(filter).sort({ fecha: -1 });
};

// Método estático para obtener alertas activas
noteSchema.statics.findActiveAlerts = function(patientId = null) {
  const filter = { 
    tipo: 'alerta', 
    completada: false 
  };
  
  if (patientId) filter.patientId = patientId;
  
  return this.find(filter)
    .populate('patientId', 'nombres apellidos documento')
    .sort({ prioridad: -1, fecha: -1 });
};

// Método para marcar como completada
noteSchema.methods.marcarCompletada = function() {
  this.completada = true;
  this.fechaCompletada = new Date();
  return this.save();
};

const PatientNote = mongoose.model('PatientNote', noteSchema);

module.exports = PatientNote;