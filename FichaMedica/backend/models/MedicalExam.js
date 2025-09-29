const mongoose = require('mongoose');

// Schema principal de examen médico
const examSchema = new mongoose.Schema({
  examId: {
    type: String,
    unique: true,
    default: function() {
      return 'EXAM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'El ID del paciente es requerido']
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del examen es requerido'],
    trim: true,
    maxlength: [200, 'El nombre del examen no puede exceder 200 caracteres']
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha del examen es requerida'],
    default: Date.now
  },
  resultado: {
    type: String,
    required: [true, 'El resultado del examen es requerido'],
    trim: true,
    maxlength: [1000, 'El resultado no puede exceder 1000 caracteres']
  },
  estado: {
    type: String,
    required: [true, 'El estado del examen es requerido'],
    enum: {
      values: ['normal', 'atencion', 'critico', 'pendiente'],
      message: 'Estado inválido. Debe ser: normal, atencion, critico, pendiente'
    },
    default: 'pendiente'
  },
  valorReferencia: {
    type: String,
    trim: true,
    maxlength: [500, 'El valor de referencia no puede exceder 500 caracteres'],
    default: ''
  },
  detalle: {
    type: String,
    trim: true,
    maxlength: [2000, 'El detalle no puede exceder 2000 caracteres'],
    default: ''
  },
  laboratorio: {
    type: String,
    trim: true,
    maxlength: [200, 'El nombre del laboratorio no puede exceder 200 caracteres'],
    default: ''
  },
  medico: {
    type: String,
    trim: true,
    maxlength: [100, 'El nombre del médico no puede exceder 100 caracteres'],
    default: ''
  },
  tipoExamen: {
    type: String,
    enum: {
      values: ['laboratorio', 'imagen', 'funcional', 'biopsia', 'otros'],
      message: 'Tipo de examen inválido'
    },
    default: 'laboratorio'
  },
  archivo: {
    type: String,
    trim: true,
    default: '' // URL o path del archivo del examen
  },
  urgente: {
    type: Boolean,
    default: false
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
examSchema.index({ patientId: 1, fecha: -1 });
examSchema.index({ estado: 1 });
examSchema.index({ tipoExamen: 1 });
examSchema.index({ urgente: 1 });
examSchema.index({ laboratorio: 1 });
examSchema.index({ examId: 1 }, { unique: true });
examSchema.index({ 
  nombre: 'text', 
  resultado: 'text', 
  detalle: 'text',
  laboratorio: 'text',
  medico: 'text'
});

// Middleware pre-save
examSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.fechaActualizacion = new Date();
  }
  next();
});

// Método virtual para obtener la fecha formateada
examSchema.virtual('fechaFormateada').get(function() {
  return this.fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Método virtual para obtener el estado formateado
examSchema.virtual('estadoFormateado').get(function() {
  const estados = {
    'normal': 'Normal',
    'atencion': 'Requiere Atención',
    'critico': 'Crítico',
    'pendiente': 'Pendiente'
  };
  return estados[this.estado] || this.estado;
});

// Método estático para obtener exámenes por paciente
examSchema.statics.findByPatient = function(patientId, options = {}) {
  return this.find({ patientId, ...options }).sort({ fecha: -1 });
};

// Método estático para obtener exámenes por estado
examSchema.statics.findByStatus = function(estado, options = {}) {
  return this.find({ estado, ...options }).sort({ fecha: -1 });
};

// Método estático para obtener exámenes urgentes
examSchema.statics.findUrgent = function(options = {}) {
  return this.find({ urgente: true, ...options }).sort({ fecha: -1 });
};

// Método estático para obtener exámenes críticos o que requieren atención
examSchema.statics.findAlertsExams = function() {
  return this.find({
    estado: { $in: ['critico', 'atencion'] }
  }).populate('patientId', 'nombres apellidos documento').sort({ fecha: -1 });
};

const MedicalExam = mongoose.model('MedicalExam', examSchema);

module.exports = MedicalExam;