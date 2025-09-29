import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient, PatientListResponse, CreatePatientRequest, UpdatePatientRequest } from '../models/patient.model';
import { PatientMockService } from './patient-mock.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  
  constructor(private mockService: PatientMockService) {}

  /**
   * Obtener lista de pacientes con paginación y filtros
   */
  getPatients(
    page: number = 1, 
    limit: number = 20, 
    search?: string
  ): Observable<PatientListResponse> {
    // En desarrollo, usar datos mock
    if (!environment.production) {
      return this.mockService.getPatients(page, limit, search).pipe(
        // Transformar el formato del mock al formato esperado
        // El mock devuelve {patients, total, page, totalPages}
        // PatientListResponse espera {patients, total, page, totalPages, limit}
      );
    }
    
    // TODO: Implementar llamada HTTP real para producción
    throw new Error('Backend HTTP implementation not yet available');
  }

  /**
   * Obtener un paciente por ID
   */
  getPatientById(id: string): Observable<Patient | null> {
    if (!environment.production) {
      return this.mockService.getPatientById(id);
    }
    
    throw new Error('Backend HTTP implementation not yet available');
  }

  /**
   * Crear un nuevo paciente
   */
  createPatient(patient: CreatePatientRequest): Observable<Patient> {
    if (!environment.production) {
      return this.mockService.createPatient(patient);
    }
    
    throw new Error('Backend HTTP implementation not yet available');
  }

  /**
   * Actualizar un paciente existente
   */
  updatePatient(id: string, updates: UpdatePatientRequest): Observable<Patient | null> {
    if (!environment.production) {
      return this.mockService.updatePatient(id, updates);
    }
    
    throw new Error('Backend HTTP implementation not yet available');
  }

  /**
   * Eliminar un paciente
   */
  deletePatient(id: string): Observable<boolean> {
    if (!environment.production) {
      return this.mockService.deletePatient(id);
    }
    
    throw new Error('Backend HTTP implementation not yet available');
  }

  /**
   * Buscar pacientes por término de búsqueda
   */
  searchPatients(query: string): Observable<Patient[]> {
    if (!environment.production) {
      return this.mockService.searchPatients(query);
    }
    
    throw new Error('Backend HTTP implementation not yet available');
  }
}