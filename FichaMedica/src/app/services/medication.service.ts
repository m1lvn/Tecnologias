import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, of, finalize } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces para medicamentos
export interface Medication {
  id: string;
  pacienteId: string;
  nombre: string;
  principioActivo: string;
  dosis: string;
  frecuencia: string;
  via: 'oral' | 'intravenosa' | 'topica' | 'otra';
  duracion: string;
  indicaciones: string;
  contraindicaciones: string[];
  efectosSecundarios: string[];
  medicoPrescriptor: string;
  fechaInicio: Date;
  fechaFin?: Date;
  estado: 'activo' | 'suspendido' | 'completado';
  observaciones?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface MedicationListResponse {
  medicamentos: Medication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateMedicationRequest {
  nombre: string;
  principioActivo: string;
  dosis: string;
  frecuencia: string;
  via: 'oral' | 'intravenosa' | 'topica' | 'otra';
  duracion: string;
  indicaciones: string;
  contraindicaciones: string[];
  efectosSecundarios: string[];
  medicoPrescriptor: string;
  fechaInicio: Date;
  fechaFin?: Date;
  observaciones?: string;
}

export interface UpdateMedicationRequest extends Partial<CreateMedicationRequest> {
  estado?: 'activo' | 'suspendido' | 'completado';
}

@Injectable({
  providedIn: 'root'
})
export class MedicationService {
  private readonly baseApiUrl = `${environment.apiUrl}`;
  
  // Estado reactivo
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Construir URL específica para medicamentos de paciente
  private getMedicationUrl(patientId: string): string {
    return `${this.baseApiUrl}/patients/${patientId}/medicamentos`;
  }

  private setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  private setError(error: string | null) {
    this.errorSubject.next(error);
  }

  /**
   * Obtener medicamentos de un paciente específico
   */
  getPatientMedications(
    patientId: string,
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Observable<MedicationListResponse> {
    this.setLoading(true);
    this.setError(null);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<MedicationListResponse>(this.getMedicationUrl(patientId), { params })
      .pipe(
        map((response) => {
          this.setLoading(false);
          return response;
        }),
        catchError((error) => {
          console.error('Error loading patient medications:', error);
          this.setError('Error al cargar los medicamentos');
          this.setLoading(false);
          return of({
            medicamentos: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false
            }
          });
        })
      );
  }

  /**
   * Obtener un medicamento específico por ID
   */
  getMedicationById(medicationId: string): Observable<Medication | null> {
    this.setLoading(true);
    this.setError(null);

    return this.http.get<Medication>(`${this.baseApiUrl}/medicamentos/${medicationId}`)
      .pipe(
        map((medication) => {
          this.setLoading(false);
          return medication;
        }),
        catchError((error) => {
          console.error('Error loading medication:', error);
          this.setError('Error al cargar el medicamento');
          this.setLoading(false);
          return of(null);
        })
      );
  }

  /**
   * Crear un nuevo medicamento para un paciente
   */
  createMedication(
    patientId: string,
    medicationData: CreateMedicationRequest
  ): Observable<Medication | null> {
    this.setLoading(true);
    this.setError(null);

    return this.http.post<Medication>(this.getMedicationUrl(patientId), medicationData)
      .pipe(
        map((medication) => {
          this.setLoading(false);
          return medication;
        }),
        catchError((error) => {
          console.error('Error creating medication:', error);
          this.setError('Error al crear el medicamento');
          this.setLoading(false);
          return of(null);
        })
      );
  }

  /**
   * Actualizar un medicamento existente
   */
  updateMedication(
    medicationId: string,
    updates: UpdateMedicationRequest
  ): Observable<Medication | null> {
    this.setLoading(true);
    this.setError(null);

    return this.http.put<Medication>(`${this.baseApiUrl}/medicamentos/${medicationId}`, updates)
      .pipe(
        map((medication) => {
          this.setLoading(false);
          return medication;
        }),
        catchError((error) => {
          console.error('Error updating medication:', error);
          this.setError('Error al actualizar el medicamento');
          this.setLoading(false);
          return of(null);
        })
      );
  }

  /**
   * Eliminar un medicamento
   */
  deleteMedication(medicationId: string): Observable<boolean> {
    this.setLoading(true);
    this.setError(null);

    return this.http.delete(`${this.baseApiUrl}/medicamentos/${medicationId}`)
      .pipe(
        map(() => {
          this.setLoading(false);
          return true;
        }),
        catchError((error) => {
          console.error('Error deleting medication:', error);
          this.setError('Error al eliminar el medicamento');
          this.setLoading(false);
          return of(false);
        })
      );
  }

  /**
   * Limpiar error actual
   */
  clearError() {
    this.setError(null);
  }

  /**
   * Cambiar estado de un medicamento (activo, suspendido, completado)
   */
  changeMedicationStatus(
    medicationId: string,
    newStatus: 'activo' | 'suspendido' | 'completado'
  ): Observable<Medication | null> {
    return this.updateMedication(medicationId, { estado: newStatus });
  }
}