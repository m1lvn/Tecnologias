import { Schema, model } from 'mongoose';
import { IPatientDocument, BloodType, Gender, InsuranceType } from '../models/patient.interface';

// Esquema para información personal
const PersonalInfoSchema = new Schema({
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
    trim: true,
    validate: {
      validator: function(rut: string) {
        return /^[0-9]+-[0-9kK]$/.test(rut);
      },
      message: 'Formato de RUT inválido'
    }
  },
  fechaNacimiento: {
    type: Date,
    required: [true, 'La fecha de nacimiento es obligatoria'],
    validate: {
      validator: function(date: Date) {
        return date <= new Date();
      },
      message: 'La fecha de nacimiento no puede ser futura'
    }
  },
  sexo: {
    type: String,
    required: [true, 'El sexo es obligatorio'],
    enum: {
      values: Object.values(Gender),
      message: 'Sexo debe ser M, F u Otro'
    }
  },
  tipoSangre: {
    type: String,
    required: [true, 'El tipo de sangre es obligatorio'],
    enum: {
      values: Object.values(BloodType),
      message: 'Tipo de sangre inválido'
    }
  },
  direccion: {
    type: String,
    required: [true, 'La dirección es obligatoria'],
    trim: true,
    maxlength: [200, 'La dirección no puede exceder 200 caracteres']
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true,
    validate: {
      validator: function(phone: string) {
        return /^\+?[0-9\s\-\(\)]{8,15}$/.test(phone);
      },
      message: 'Formato de teléfono inválido'
    }
  },
  contactoEmergencia: {
    type: String,
    required: [true, 'El contacto de emergencia es obligatorio'],
    trim: true,
    validate: {
      validator: function(phone: string) {
        return /^\+?[0-9\s\-\(\)]{8,15}$/.test(phone);
      },
      message: 'Formato de contacto de emergencia inválido'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email: string) {
        return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Formato de email inválido'
    }
  }
}, { _id: false });

// Esquema para información médica
const MedicalInfoSchema = new Schema({
  alergias: [{
    type: String,
    trim: true
  }],
  condicionesCronicas: [{
    type: String,
    trim: true
  }],
  medicamentosActuales: [{
    type: String,
    trim: true
  }],
  peso: {
    type: Number,
    required: [true, 'El peso es obligatorio'],
    min: [0.1, 'El peso debe ser mayor a 0'],
    max: [1000, 'El peso no puede exceder 1000 kg']
  },
  altura: {
    type: Number,
    required: [true, 'La altura es obligatoria'],
    min: [10, 'La altura debe ser mayor a 10 cm'],
    max: [300, 'La altura no puede exceder 300 cm']
  },
  imc: {
    type: Number,
    min: [1, 'El IMC debe ser mayor a 1'],
    max: [100, 'El IMC no puede exceder 100']
  },
  grupoSanguineo: String,
  factorRh: {
    type: String,
    enum: ['+', '-']
  }
}, { _id: false });

// Esquema para información de seguro
const InsuranceInfoSchema = new Schema({
  tipoSeguro: {
    type: String,
    required: [true, 'El tipo de seguro es obligatorio'],
    enum: {
      values: Object.values(InsuranceType),
      message: 'Tipo de seguro inválido'
    }
  },
  numeroAfiliado: {
    type: String,
    trim: true
  },
  plan: {
    type: String,
    trim: true
  },
  vigente: {
    type: Boolean,
    default: true
  },
  observaciones: {
    type: String,
    trim: true,
    maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres']
  }
}, { _id: false });

// Esquema para información de auditoría
const AuditInfoSchema = new Schema({
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
  }
}, { _id: false });

// Esquema principal del paciente
const PatientSchema = new Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  personalInfo: {
    type: PersonalInfoSchema,
    required: true
  },
  medicalInfo: {
    type: MedicalInfoSchema,
    required: true
  },
  insuranceInfo: InsuranceInfoSchema,
  auditInfo: {
    type: AuditInfoSchema,
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
  ultimaVisita: {
    type: Date,
    index: true
  },
  observaciones: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las observaciones no pueden exceder 1000 caracteres']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  collection: 'patients'
});

// Índices para optimizar búsquedas
PatientSchema.index({ 'personalInfo.nombre': 'text', 'personalInfo.apellido': 'text' });
PatientSchema.index({ 'personalInfo.rut': 1 }, { unique: true });
PatientSchema.index({ 'personalInfo.telefono': 1 });
PatientSchema.index({ activo: 1, fechaRegistro: -1 });
PatientSchema.index({ tags: 1 });
PatientSchema.index({ 'medicalInfo.alergias': 1 });
PatientSchema.index({ 'medicalInfo.condicionesCronicas': 1 });

// Middleware pre-save para calcular IMC y generar patientId
PatientSchema.pre('save', function(this: IPatientDocument, next) {
  // Calcular IMC si no existe
  if (this.medicalInfo.peso && this.medicalInfo.altura && !this.medicalInfo.imc) {
    const alturaEnMetros = this.medicalInfo.altura / 100;
    this.medicalInfo.imc = Number((this.medicalInfo.peso / (alturaEnMetros * alturaEnMetros)).toFixed(2));
  }

  // Generar patientId si no existe
  if (!this.patientId) {
    this.patientId = `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  // Actualizar información de auditoría
  if (this.isModified() && !this.isNew) {
    this.auditInfo.version += 1;
    this.auditInfo.fechaModificacion = new Date();
  }

  next();
});

// Métodos del documento
PatientSchema.methods['calculateAge'] = function(this: IPatientDocument): number {
  const today = new Date();
  const birthDate = new Date(this.personalInfo.fechaNacimiento);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

PatientSchema.methods['calculateIMC'] = function(this: IPatientDocument): number {
  if (!this.medicalInfo.peso || !this.medicalInfo.altura) {
    return 0;
  }
  
  const alturaEnMetros = this.medicalInfo.altura / 100;
  return Number((this.medicalInfo.peso / (alturaEnMetros * alturaEnMetros)).toFixed(2));
};

PatientSchema.methods['isActive'] = function(this: IPatientDocument): boolean {
  return this.activo;
};

PatientSchema.methods['getFullName'] = function(this: IPatientDocument): string {
  return `${this.personalInfo.nombre} ${this.personalInfo.apellido}`;
};

PatientSchema.methods['formatRut'] = function(this: IPatientDocument): string {
  const rut = this.personalInfo.rut;
  if (!rut) return '';
  
  // Formatear RUT con puntos: 12.345.678-9
  const rutNumber = rut.replace(/[^0-9kK]/g, '');
  const body = rutNumber.slice(0, -1);
  const verifier = rutNumber.slice(-1);
  
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${verifier}`;
};

// Métodos estáticos
PatientSchema.statics['findByRut'] = function(rut: string) {
  return this.findOne({ 'personalInfo.rut': rut });
};

PatientSchema.statics['findActivePatients'] = function() {
  return this.find({ activo: true }).sort({ fechaRegistro: -1 });
};

PatientSchema.statics['searchPatients'] = function(searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
    activo: true
  }).sort({ score: { $meta: 'textScore' } });
};

// Crear y exportar el modelo
export const Patient = model<IPatientDocument>('Patient', PatientSchema);