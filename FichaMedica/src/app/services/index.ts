// Servicios principales
export { PatientService } from './patient.service';
export { PatientMockService } from './patient-mock.service';

// Re-exports de modelos para conveniencia
export type { Patient, PatientListResponse, CreatePatientRequest, UpdatePatientRequest } from '../models/patient.model';