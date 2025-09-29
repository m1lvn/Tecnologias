// Exportar todos los servicios principales
export { PatientService } from './patient.service';
export { MedicalConsultationService } from './medical-consultation.service';
export { MedicationService } from './medication.service';
export { PrescriptionService } from './prescription.service';
export { DoctorService } from './doctor.service';

// Servicios principales
export { PatientService } from './patient.service';
export { PatientMockService } from './patient-mock.service';

// Re-exports de modelos para conveniencia
export type { Patient, PatientListResponse, CreatePatientRequest, UpdatePatientRequest } from '../models/patient.model';
export type { ConsultationListResponse, ConsultationStats } from './medical-consultation.service';
export type { MedicationListResponse, MedicationSearchResponse, MedicationStats } from './medication.service';
export type { PrescriptionListResponse, PrescriptionStats } from './prescription.service';
export type { DoctorListResponse, DoctorStats } from './doctor.service';