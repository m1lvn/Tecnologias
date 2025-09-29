const mongoose = require('mongoose');

// Schema para contacto de emergencia
const contactoEmergenciaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del contacto de emergencia es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono del contacto de emergencia es requerido'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\+]?[\d\s\-\(\)]{7,20}$/.test(v);
      },
      message: 'Formato de teléfono inválido'
    }
  },
  relacion: {
    type: String,
    required: [true, 'La relación con el contacto de emergencia es requerida'],
    trim: true,
    maxlength: [50, 'La relación no puede exceder 50 caracteres']
  }
}, { _id: false });

// Schema principal del paciente
const patientSchema = new mongoose.Schema({
  nombres: {
    type: String,
    required: [true, 'Los nombres son requeridos'],
    trim: true,
    maxlength: [100, 'Los nombres no pueden exceder 100 caracteres'],
    validate: {
      validator: function(v) {
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,}$/.test(v);
      },
      message: 'Los nombres solo pueden contener letras y espacios'
    }
  },
  apellidos: {
    type: String,
    required: [true, 'Los apellidos son requeridos'],
    trim: true,
    maxlength: [100, 'Los apellidos no pueden exceder 100 caracteres'],
    validate: {
      validator: function(v) {
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,}$/.test(v);
      },
      message: 'Los apellidos solo pueden contener letras y espacios'
    }
  },
  documento: {
    type: String,
    required: [true, 'El documento es requerido'],
    unique: true,
    trim: true,
    maxlength: [20, 'El documento no puede exceder 20 caracteres'],
    validate: {
      validator: function(v) {
        return /^[0-9A-Za-z\-]{5,20}$/.test(v);
      },
      message: 'Formato de documento inválido'
    }
  },
  tipoDocumento: {
    type: String,
    required: [true, 'El tipo de documento es requerido'],
    enum: {
      values: ['CC', 'TI', 'CE', 'PP', 'RC'],
      message: 'Tipo de documento inválido. Debe ser: CC, TI, CE, PP, RC'
    }
  },
  fechaNacimiento: {
    type: Date,
    required: [true, 'La fecha de nacimiento es requerida'],
    validate: {
      validator: function(v) {
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
        return v >= minDate && v <= today;
      },
      message: 'Fecha de nacimiento inválida'
    }
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\+]?[\d\s\-\(\)]{7,20}$/.test(v);
      },
      message: 'Formato de teléfono inválido'
    }
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Formato de email inválido'
    }
  },
  direccion: {
    type: String,
    required: [true, 'La dirección es requerida'],
    trim: true,
    maxlength: [200, 'La dirección no puede exceder 200 caracteres']
  },
  genero: {
    type: String,
    required: [true, 'El género es requerido'],
    enum: {
      values: ['M', 'F', 'Otro'],
      message: 'Género inválido. Debe ser: M, F, Otro'
    }
  },
  estadoCivil: {
    type: String,
    required: [true, 'El estado civil es requerido'],
    enum: {
      values: ['soltero', 'casado', 'divorciado', 'viudo', 'union_libre'],
      message: 'Estado civil inválido'
    }
  },
  ocupacion: {
    type: String,
    required: [true, 'La ocupación es requerida'],
    trim: true,
    maxlength: [100, 'La ocupación no puede exceder 100 caracteres']
  },
  contactoEmergencia: {
    type: contactoEmergenciaSchema,
    required: [true, 'El contacto de emergencia es requerido']
  },
  alergias: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 20;
      },
      message: 'No se pueden registrar más de 20 alergias'
    }
  },
  medicamentos: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 30;
      },
      message: 'No se pueden registrar más de 30 medicamentos'
    }
  },
  antecedentes: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 50;
      },
      message: 'No se pueden registrar más de 50 antecedentes'
    }
  },
  grupoSanguineo: {
    type: String,
    trim: true,
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      message: 'Grupo sanguíneo inválido'
    },
    default: ''
  },
  eps: {
    type: String,
    trim: true,
    maxlength: [100, 'El nombre de la EPS no puede exceder 100 caracteres'],
    default: ''
  },
  estado: {
    type: String,
    enum: {
      values: ['activo', 'inactivo'],
      message: 'Estado inválido. Debe ser: activo, inactivo'
    },
    default: 'activo'
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
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Índices para optimizar búsquedas
patientSchema.index({ documento: 1 }, { unique: true });
patientSchema.index({ email: 1 }, { unique: true });
patientSchema.index({ nombres: 1, apellidos: 1 });
patientSchema.index({ estado: 1 });
patientSchema.index({ fechaCreacion: -1 });
patientSchema.index({ 
  nombres: 'text', 
  apellidos: 'text', 
  documento: 'text',
  email: 'text'
}, {
  weights: {
    nombres: 10,
    apellidos: 10,
    documento: 5,
    email: 3
  },
  name: 'search_index'
});

// Middleware pre-save para actualizar fechaActualizacion
patientSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.fechaActualizacion = new Date();
  }
  next();
});

// Middleware pre-findOneAndUpdate para actualizar fechaActualizacion
patientSchema.pre('findOneAndUpdate', function(next) {
  this.set({ fechaActualizacion: new Date() });
  next();
});

// Método virtual para obtener la edad
patientSchema.virtual('edad').get(function() {
  if (!this.fechaNacimiento) return null;
  
  const today = new Date();
  const birth = new Date(this.fechaNacimiento);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
});

// Método virtual para obtener el nombre completo
patientSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombres} ${this.apellidos}`;
});

// Método estático para búsqueda de texto
patientSchema.statics.searchByText = function(query, options = {}) {
  const searchRegex = new RegExp(query.split(' ').join('|'), 'i');
  
  return this.find({
    $or: [
      { nombres: searchRegex },
      { apellidos: searchRegex },
      { documento: searchRegex },
      { email: searchRegex }
    ],
    ...options
  });
};

// Método de instancia para actualizar estado
patientSchema.methods.updateStatus = function(newStatus) {
  this.estado = newStatus;
  this.fechaActualizacion = new Date();
  return this.save();
};

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;