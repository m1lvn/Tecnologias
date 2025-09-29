import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces para consultas médicas
export interface MedicalConsultation {
  id: string;
  pacienteId: string;
  fecha: Date;
  hora: string;
  medico: string;
  especialidad: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
  signosVitales: {
    presionArterial: string;
    frecuenciaCardiaca: number;
    frecuenciaRespiratoria: number;
    temperatura: number;
    peso: number;
    altura: number;
    saturacionOxigeno: number;
  };
  examenFisico: string;
  planTratamiento: string;
  medicamentosRecetados: string[];
  proximaCita?: Date;
  estado: 'programada' | 'en_curso' | 'completada' | 'cancelada';
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface ConsultationListResponse {
  consultas: MedicalConsultation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateConsultationRequest {
  fecha: Date;
  hora: string;
  medico: string;
  especialidad: string;
  motivo: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
  signosVitales?: {
    presionArterial?: string;
    frecuenciaCardiaca?: number;
    frecuenciaRespiratoria?: number;
    temperatura?: number;
    peso?: number;
    altura?: number;
    saturacionOxigeno?: number;
  };
  examenFisico?: string;
  planTratamiento?: string;
  medicamentosRecetados?: string[];
  proximaCita?: Date;
}

export interface UpdateConsultationRequest extends Partial<CreateConsultationRequest> {
  estado?: 'programada' | 'en_curso' | 'completada' | 'cancelada';
}

@Injectable({
  providedIn: 'root'
})
export class MedicalConsultationService {
  private readonly baseApiUrl = `${environment.apiUrl}`;
  
  // Estado reactivo
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Construir URL específica para consultas de paciente
  private getConsultationUrl(patientId: string): string {
    return `${this.baseApiUrl}/patients/${patientId}/consultas`;
  }

  private setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  private setError(error: string | null) {
    this.errorSubject.next(error);
  }

  /**
   * Obtener consultas de un paciente específico
   */
  getPatientConsultations(
    patientId: string,
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Observable<ConsultationListResponse> {
    this.setLoading(true);
    this.setError(null);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ConsultationListResponse>(this.getConsultationUrl(patientId), { params })
      .pipe(
        map((response) => {
          this.setLoading(false);
          return response;
        }),
        catchError((error) => {
          console.error('Error loading patient consultations:', error);
          this.setError('Error al cargar las consultas');
          this.setLoading(false);
          return of({
            consultas: [],
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
   * Obtener una consulta específica por ID
   */
  getConsultationById(consultationId: string): Observable<MedicalConsultation | null> {
    this.setLoading(true);
    this.setError(null);

    return this.http.get<MedicalConsultation>(`${this.baseApiUrl}/consultas/${consultationId}`)
      .pipe(
        map((consultation) => {
          this.setLoading(false);
          return consultation;
        }),
        catchError((error) => {
          console.error('Error loading consultation:', error);
          this.setError('Error al cargar la consulta');
          this.setLoading(false);
          return of(null);
        })
      );
  }

  /**
   * Crear una nueva consulta para un paciente
   */
  createConsultation(
    patientId: string,
    consultationData: CreateConsultationRequest
  ): Observable<MedicalConsultation | null> {
    this.setLoading(true);
    this.setError(null);

    return this.http.post<MedicalConsultation>(this.getConsultationUrl(patientId), consultationData)
      .pipe(
        map((consultation) => {
          this.setLoading(false);
          return consultation;
        }),
        catchError((error) => {
          console.error('Error creating consultation:', error);
          this.setError('Error al crear la consulta');
          this.setLoading(false);
          return of(null);
        })
      );
  }

  /**
   * Actualizar una consulta existente
   */
  updateConsultation(
    consultationId: string,
    updates: UpdateConsultationRequest
  ): Observable<MedicalConsultation | null> {
    this.setLoading(true);
    this.setError(null);

    return this.http.put<MedicalConsultation>(`${this.baseApiUrl}/consultas/${consultationId}`, updates)
      .pipe(
        map((consultation) => {
          this.setLoading(false);
          return consultation;
        }),
        catchError((error) => {
          console.error('Error updating consultation:', error);
          this.setError('Error al actualizar la consulta');
          this.setLoading(false);
          return of(null);
        })
      );
  }

  /**
   * Eliminar una consulta
   */
  deleteConsultation(consultationId: string): Observable<boolean> {
    this.setLoading(true);
    this.setError(null);

    return this.http.delete(`${this.baseApiUrl}/consultas/${consultationId}`)
      .pipe(
        map(() => {
          this.setLoading(false);
          return true;
        }),
        catchError((error) => {
          console.error('Error deleting consultation:', error);
          this.setError('Error al eliminar la consulta');
          this.setLoading(false);
          return of(false);
        })
      );
  }

  /**
   * Cambiar estado de una consulta
   */
  changeConsultationStatus(
    consultationId: string,
    newStatus: 'programada' | 'en_curso' | 'completada' | 'cancelada'
  ): Observable<MedicalConsultation | null> {
    return this.updateConsultation(consultationId, { estado: newStatus });
  }

  /**
   * Limpiar error actual
   */
  clearError() {
    this.setError(null);
  }
}