const mongoose = require('mongoose');

// Schema para signos vitales
const signosVitalesSchema = new mongoose.Schema({
  presionArterial: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^\d{2,3}\/\d{2,3}\s?(mmHg)?$/i.test(v);
      },
      message: 'Formato de presión arterial inválido (ej: 120/80 mmHg)'
    }
  },
  frecuenciaCardiaca: {
    type: Number,
    min: [30, 'La frecuencia cardíaca debe ser mayor a 30'],
    max: [300, 'La frecuencia cardíaca no puede exceder 300']
  },
  temperatura: {
    type: Number,
    min: [30, 'La temperatura debe ser mayor a 30°C'],
    max: [50, 'La temperatura no puede exceder 50°C']
  },
  peso: {
    type: Number,
    min: [0.1, 'El peso debe ser mayor a 0'],
    max: [1000, 'El peso no puede exceder 1000 kg']
  }
}, { _id: false });

// Schema principal de consulta médica
const consultationSchema = new mongoose.Schema({
  consultationId: {
    type: String,
    unique: true,
    default: function() {
      return 'CONS-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'El ID del paciente es requerido']
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha de la consulta es requerida'],
    default: Date.now
  },
  hora: {
    type: String,
    required: [true, 'La hora de la consulta es requerida'],
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Formato de hora inválido (HH:MM)'
    }
  },
  medico: {
    type: String,
    required: [true, 'El nombre del médico es requerido'],
    trim: true,
    maxlength: [100, 'El nombre del médico no puede exceder 100 caracteres']
  },
  especialidad: {
    type: String,
    required: [true, 'La especialidad es requerida'],
    trim: true,
    maxlength: [100, 'La especialidad no puede exceder 100 caracteres']
  },
  motivo: {
    type: String,
    required: [true, 'El motivo de la consulta es requerido'],
    trim: true,
    maxlength: [500, 'El motivo no puede exceder 500 caracteres']
  },
  observaciones: {
    type: String,
    trim: true,
    maxlength: [2000, 'Las observaciones no pueden exceder 2000 caracteres'],
    default: ''
  },
  signosVitales: {
    type: signosVitalesSchema,
    required: [true, 'Los signos vitales son requeridos']
  },
  diagnosticos: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 10;
      },
      message: 'No se pueden registrar más de 10 diagnósticos'
    }
  },
  tratamiento: {
    type: String,
    trim: true,
    maxlength: [1000, 'El tratamiento no puede exceder 1000 caracteres'],
    default: ''
  },
  proximaCita: {
    type: Date,
    default: null
  },
  estado: {
    type: String,
    enum: {
      values: ['programada', 'en_curso', 'completada', 'cancelada'],
      message: 'Estado inválido'
    },
    default: 'completada'
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
consultationSchema.index({ patientId: 1, fecha: -1 });
consultationSchema.index({ medico: 1 });
consultationSchema.index({ especialidad: 1 });
consultationSchema.index({ estado: 1 });
consultationSchema.index({ consultationId: 1 }, { unique: true });
consultationSchema.index({ 
  motivo: 'text', 
  observaciones: 'text', 
  medico: 'text',
  especialidad: 'text'
});

// Middleware pre-save
consultationSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.fechaActualizacion = new Date();
  }
  next();
});

// Método virtual para obtener la fecha formateada
consultationSchema.virtual('fechaFormateada').get(function() {
  return this.fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Método estático para obtener consultas por paciente
consultationSchema.statics.findByPatient = function(patientId, options = {}) {
  return this.find({ patientId, ...options }).sort({ fecha: -1 });
};

// Método estático para obtener consultas por médico
consultationSchema.statics.findByDoctor = function(medico, dateFrom, dateTo) {
  const filter = { medico };
  if (dateFrom || dateTo) {
    filter.fecha = {};
    if (dateFrom) filter.fecha.$gte = new Date(dateFrom);
    if (dateTo) filter.fecha.$lte = new Date(dateTo);
  }
  return this.find(filter).sort({ fecha: -1 });
};

const MedicalConsultation = mongoose.model('MedicalConsultation', consultationSchema);

module.exports = MedicalConsultation;