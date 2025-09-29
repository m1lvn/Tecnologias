import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, of } from 'rxjs';
import { 
  IMedicalConsultation, 
  CreateConsultationData, 
  UpdateConsultationData,
  ConsultationFilters,
  VitalSigns
} from '../models/medical-consultation.interface';
import { environment } from '../../environments/environment';

export interface ConsultationListResponse {
  consultations: IMedicalConsultation[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ConsultationStats {
  totalConsultations: number;
  consultationsThisMonth: number;
  consultationsThisYear: number;
  averageConsultationsPerDay: number;
  mostCommonDiagnoses: Array<{
    code: string;
    description: string;
    count: number;
  }>;
  consultationsBySpecialty: Array<{
    specialty: string;
    count: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class MedicalConsultationService {
  private readonly apiUrl = `${environment.apiUrl}/consultations`;
  
  // Estado reactivo del servicio
  private consultationsSubject = new BehaviorSubject<IMedicalConsultation[]>([]);
  private selectedConsultationSubject = new BehaviorSubject<IMedicalConsultation | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public consultations$ = this.consultationsSubject.asObservable();
  public selectedConsultation$ = this.selectedConsultationSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  // Cache local para optimización
  private consultationsCache = new Map<string, IMedicalConsultation>();
  private patientConsultationsCache = new Map<string, IMedicalConsultation[]>();
  private lastSearchFilter: ConsultationFilters | null = null;
  private cacheExpiration = 3 * 60 * 1000; // 3 minutos (datos médicos más críticos)
  private lastCacheUpdate = 0;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las consultas médicas con paginación y filtros
   */
  getConsultations(
    page: number = 1,
    limit: number = 20,
    filter?: ConsultationFilters
  ): Observable<ConsultationListResponse> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filter) {
      if (filter.patientId) {
        params = params.set('patientId', filter.patientId);
      }
      if (filter.doctorId) {
        params = params.set('doctorId', filter.doctorId);
      }
      if (filter.fechaDesde) {
        params = params.set('fechaDesde', filter.fechaDesde.toISOString());
      }
      if (filter.fechaHasta) {
        params = params.set('fechaHasta', filter.fechaHasta.toISOString());
      }
      if (filter.especialidad) {
        params = params.set('especialidad', filter.especialidad);
      }
      if (filter.estado && filter.estado.length > 0) {
        params = params.set('estado', filter.estado.join(','));
      }
      if (filter.diagnostico) {
        params = params.set('diagnostico', filter.diagnostico);
      }
      if (filter.tipoConsulta && filter.tipoConsulta.length > 0) {
        params = params.set('tipoConsulta', filter.tipoConsulta.join(','));
      }
    }

    return this.http.get<ConsultationListResponse>(`${this.apiUrl}`, { params })
      .pipe(
        map((response) => {
          // Actualizar cache local
          response.consultations.forEach(consultation => {
            this.consultationsCache.set(consultation.consultationId, consultation);
          });
          
          // Actualizar estado reactivo
          this.consultationsSubject.next(response.consultations);
          this.lastSearchFilter = filter || null;
          this.lastCacheUpdate = Date.now();
          
          this.setLoading(false);
          return response;
        }),
        catchError((error) => {
          this.handleError('Error al obtener consultas médicas', error);
          return of({
            consultations: [],
            total: 0,
            page: 1,
            limit: 20,
            hasNext: false,
            hasPrev: false
          });
        })
      );
  }

  /**
   * Obtiene una consulta médica por ID
   */
  getConsultationById(id: string): Observable<IMedicalConsultation | null> {
    // Verificar cache primero
    if (this.consultationsCache.has(id) && this.isCacheValid()) {
      const cachedConsultation = this.consultationsCache.get(id)!;
      this.selectedConsultationSubject.next(cachedConsultation);
      return of(cachedConsultation);
    }

    this.setLoading(true);
    this.clearError();

    return this.http.get<IMedicalConsultation>(`${this.apiUrl}/${id}`)
      .pipe(
        map((consultation) => {
          // Actualizar cache y estado
          this.consultationsCache.set(id, consultation);
          this.selectedConsultationSubject.next(consultation);
          this.setLoading(false);
          return consultation;
        }),
        catchError((error) => {
          this.handleError('Error al obtener consulta médica', error);
          this.selectedConsultationSubject.next(null);
          return of(null);
        })
      );
  }

  /**
   * Obtiene todas las consultas de un paciente específico
   */
  getConsultationsByPatient(
    patientId: string,
    limit: number = 50
  ): Observable<IMedicalConsultation[]> {
    // Verificar cache de paciente
    if (this.patientConsultationsCache.has(patientId) && this.isCacheValid()) {
      return of(this.patientConsultationsCache.get(patientId)!);
    }

    this.setLoading(true);
    this.clearError();

    const params = new HttpParams()
      .set('patientId', patientId)
      .set('limit', limit.toString())
      .set('sort', 'fechaConsulta:desc'); // Más recientes primero

    return this.http.get<IMedicalConsultation[]>(`${this.apiUrl}/patient/${patientId}`, { params })
      .pipe(
        map((consultations) => {
          // Actualizar cache de paciente y general
          this.patientConsultationsCache.set(patientId, consultations);
          consultations.forEach(consultation => {
            this.consultationsCache.set(consultation.consultationId, consultation);
          });
          
          this.setLoading(false);
          return consultations;
        }),
        catchError((error) => {
          this.handleError('Error al obtener consultas del paciente', error);
          return of([]);
        })
      );
  }

  /**
   * Crea una nueva consulta médica
   */
  createConsultation(consultationData: CreateConsultationData): Observable<IMedicalConsultation | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<IMedicalConsultation>(`${this.apiUrl}`, consultationData)
      .pipe(
        map((newConsultation) => {
          // Agregar al cache
          this.consultationsCache.set(newConsultation.consultationId, newConsultation);
          
          // Invalidar cache de paciente
          if (newConsultation.patientId) {
            this.patientConsultationsCache.delete(newConsultation.patientId);
          }
          
          // Actualizar lista de consultas
          const currentConsultations = this.consultationsSubject.value;
          this.consultationsSubject.next([newConsultation, ...currentConsultations]);
          
          this.selectedConsultationSubject.next(newConsultation);
          this.setLoading(false);
          return newConsultation;
        }),
        catchError((error) => {
          this.handleError('Error al crear consulta médica', error);
          return of(null);
        })
      );
  }

  /**
   * Actualiza una consulta médica existente
   */
  updateConsultation(
    id: string, 
    updates: UpdateConsultationData
  ): Observable<IMedicalConsultation | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.put<IMedicalConsultation>(`${this.apiUrl}/${id}`, updates)
      .pipe(
        map((updatedConsultation) => {
          // Actualizar cache
          this.consultationsCache.set(id, updatedConsultation);
          
          // Invalidar cache de paciente si cambió
          if (updatedConsultation.patientId) {
            this.patientConsultationsCache.delete(updatedConsultation.patientId);
          }
          
          // Actualizar lista de consultas
          const currentConsultations = this.consultationsSubject.value;
          const updatedList = currentConsultations.map(c => 
            c.consultationId === id ? updatedConsultation : c
          );
          this.consultationsSubject.next(updatedList);
          
          // Actualizar consulta seleccionada si es la misma
          const currentSelected = this.selectedConsultationSubject.value;
          if (currentSelected && currentSelected.consultationId === id) {
            this.selectedConsultationSubject.next(updatedConsultation);
          }
          
          this.setLoading(false);
          return updatedConsultation;
        }),
        catchError((error) => {
          this.handleError('Error al actualizar consulta médica', error);
          return of(null);
        })
      );
  }

  /**
   * Elimina una consulta médica
   */
  deleteConsultation(id: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => {
          // Remover del cache
          const consultation = this.consultationsCache.get(id);
          this.consultationsCache.delete(id);
          
          // Invalidar cache de paciente
          if (consultation && consultation.patientId) {
            this.patientConsultationsCache.delete(consultation.patientId);
          }
          
          // Remover de la lista
          const currentConsultations = this.consultationsSubject.value;
          const filteredList = currentConsultations.filter(c => c.consultationId !== id);
          this.consultationsSubject.next(filteredList);
          
          // Limpiar selección si era la consulta eliminada
          const currentSelected = this.selectedConsultationSubject.value;
          if (currentSelected && currentSelected.consultationId === id) {
            this.selectedConsultationSubject.next(null);
          }
          
          this.setLoading(false);
          return true;
        }),
        catchError((error) => {
          this.handleError('Error al eliminar consulta médica', error);
          return of(false);
        })
      );
  }

  /**
   * Búsqueda avanzada de consultas médicas
   */
  searchConsultations(query: string, filters?: ConsultationFilters): Observable<IMedicalConsultation[]> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams().set('search', query);

    if (filters) {
      if (filters.fechaDesde) {
        params = params.set('fechaDesde', filters.fechaDesde.toISOString());
      }
      if (filters.fechaHasta) {
        params = params.set('fechaHasta', filters.fechaHasta.toISOString());
      }
      if (filters.especialidad) {
        params = params.set('especialidad', filters.especialidad);
      }
      if (filters.diagnostico) {
        params = params.set('diagnostico', filters.diagnostico);
      }
    }

    return this.http.get<IMedicalConsultation[]>(`${this.apiUrl}/search/advanced`, { params })
      .pipe(
        map((consultations) => {
          // Actualizar cache
          consultations.forEach(consultation => {
            this.consultationsCache.set(consultation.consultationId, consultation);
          });
          
          this.setLoading(false);
          return consultations;
        }),
        catchError((error) => {
          this.handleError('Error en búsqueda avanzada de consultas', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene estadísticas de consultas médicas
   */
  getConsultationStats(filters?: ConsultationFilters): Observable<ConsultationStats | null> {
    let params = new HttpParams();

    if (filters) {
      if (filters.fechaDesde) {
        params = params.set('fechaDesde', filters.fechaDesde.toISOString());
      }
      if (filters.fechaHasta) {
        params = params.set('fechaHasta', filters.fechaHasta.toISOString());
      }
      if (filters.especialidad) {
        params = params.set('especialidad', filters.especialidad);
      }
    }

    return this.http.get<ConsultationStats>(`${this.apiUrl}/stats`, { params })
      .pipe(
        catchError((error) => {
          this.handleError('Error al obtener estadísticas de consultas', error);
          return of(null);
        })
      );
  }

  /**
   * Obtiene el historial médico completo de un paciente
   */
  getPatientMedicalHistory(patientId: string): Observable<IMedicalConsultation[]> {
    return this.http.get<IMedicalConsultation[]>(`${this.apiUrl}/history/${patientId}`)
      .pipe(
        map((history) => {
          // Actualizar cache
          history.forEach(consultation => {
            this.consultationsCache.set(consultation.consultationId, consultation);
          });
          
          return history;
        }),
        catchError((error) => {
          this.handleError('Error al obtener historial médico', error);
          return of([]);
        })
      );
  }

  /**
   * Registra signos vitales para una consulta
   */
  updateVitalSigns(consultationId: string, vitalSigns: VitalSigns): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.http.patch(`${this.apiUrl}/${consultationId}/vital-signs`, vitalSigns)
      .pipe(
        map(() => {
          // Invalidar cache de la consulta para forzar actualización
          this.consultationsCache.delete(consultationId);
          this.setLoading(false);
          return true;
        }),
        catchError((error) => {
          this.handleError('Error al actualizar signos vitales', error);
          return of(false);
        })
      );
  }

  /**
   * Completa una consulta médica
   */
  completeConsultation(consultationId: string): Observable<boolean> {
    return this.http.patch(`${this.apiUrl}/${consultationId}/complete`, {})
      .pipe(
        map(() => {
          // Invalidar cache para forzar actualización
          this.consultationsCache.delete(consultationId);
          return true;
        }),
        catchError((error) => {
          this.handleError('Error al completar consulta', error);
          return of(false);
        })
      );
  }

  /**
   * Selecciona una consulta en el estado del servicio
   */
  selectConsultation(consultation: IMedicalConsultation | null): void {
    this.selectedConsultationSubject.next(consultation);
  }

  /**
   * Limpia el cache del servicio
   */
  clearCache(): void {
    this.consultationsCache.clear();
    this.patientConsultationsCache.clear();
    this.lastCacheUpdate = 0;
    this.lastSearchFilter = null;
  }

  /**
   * Recarga los datos con el último filtro usado
   */
  refreshData(): Observable<ConsultationListResponse> {
    this.clearCache();
    return this.getConsultations(1, 20, this.lastSearchFilter || undefined);
  }

  // Métodos privados de utilidad
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private clearError(): void {
    this.errorSubject.next(null);
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorSubject.next(message);
    this.setLoading(false);
  }

  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheUpdate < this.cacheExpiration;
  }

  // Getters para acceso directo al estado
  get currentConsultations(): IMedicalConsultation[] {
    return this.consultationsSubject.value;
  }

  get currentSelectedConsultation(): IMedicalConsultation | null {
    return this.selectedConsultationSubject.value;
  }

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  get currentError(): string | null {
    return this.errorSubject.value;
  }
}