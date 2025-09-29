// Archivo índice para todos los modelos y esquemas MongoDB de FichaMedica

// Exportar interfaces
export * from './patient.interface';
export * from './medical-consultation.interface';
export * from './medication.interface';
export * from './prescription.interface';
export { 
  IDoctor, 
  IDoctorDocument, 
  DoctorPersonalInfo, 
  ProfessionalInfo, 
  WorkInfo, 
  Experience, 
  AcademicInfo, 
  DoctorPreferences, 
  DoctorStats,
  DoctorFilters,
  CreateDoctorData,
  UpdateDoctorData,
  DoctorSchedule,
  DoctorEvaluation,
  DoctorsListResponse,
  Specialty,
  WorkDay,
  ConsultationType as DoctorConsultationType 
} from './doctor.interface';

// Exportar esquemas y modelos
export { Patient } from '../schemas/patient.schema';
export { MedicalConsultation } from '../schemas/medical-consultation.schema';
export { Medication } from '../schemas/medication.schema';
export { Prescription } from '../schemas/prescription.schema';
export { Doctor } from '../schemas/doctor.schema';

// Exportar utilidades
export * from '../utils/validators';