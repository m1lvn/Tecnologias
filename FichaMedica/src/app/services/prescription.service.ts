import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, of } from 'rxjs';
import { IPrescription, CreatePrescriptionData, UpdatePrescriptionData, PrescriptionFilters } from '../models/prescription.interface';
import { environment } from '../../environments/environment';

export interface PrescriptionListResponse {
  prescriptions: IPrescription[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PrescriptionStats {
  totalPrescriptions: number;
  activePrescriptions: number;
  expiredPrescriptions: number;
  mostPrescribedMedications: Array<{
    medicationId: string;
    medicationName: string;
    prescriptionCount: number;
  }>;
  prescriptionsBySpecialty: Array<{
    specialty: string;
    count: number;
  }>;
  adherenceRate: number; // Porcentaje de adherencia
}

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private readonly apiUrl = `${environment.apiUrl}/prescriptions`;
  
  // Estado reactivo del servicio
  private prescriptionsSubject = new BehaviorSubject<IPrescription[]>([]);
  private selectedPrescriptionSubject = new BehaviorSubject<IPrescription | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public prescriptions$ = this.prescriptionsSubject.asObservable();
  public selectedPrescription$ = this.selectedPrescriptionSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  private error$ = this.errorSubject.asObservable();

  // Cache local para optimización
  private prescriptionsCache = new Map<string, IPrescription>();
  private patientPrescriptionsCache = new Map<string, IPrescription[]>();
  private lastSearchFilter: PrescriptionFilters | null = null;
  private cacheExpiration = 5 * 60 * 1000; // 5 minutos (datos médicos importantes)
  private lastCacheUpdate = 0;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las prescripciones con paginación y filtros
   */
  getPrescriptions(
    page: number = 1,
    limit: number = 20,
    filter?: PrescriptionFilters
  ): Observable<PrescriptionListResponse> {
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
      if (filter.medicamento) {
        params = params.set('medicamento', filter.medicamento);
      }
      if (filter.estado && filter.estado.length > 0) {
        params = params.set('estado', filter.estado.join(','));
      }
      if (filter.fechaDesde) {
        params = params.set('fechaDesde', filter.fechaDesde.toISOString());
      }
      if (filter.fechaHasta) {
        params = params.set('fechaHasta', filter.fechaHasta.toISOString());
      }
      if (filter.tipoReceta && filter.tipoReceta.length > 0) {
        params = params.set('tipoReceta', filter.tipoReceta.join(','));
      }
      if (filter.vencidas !== undefined) {
        params = params.set('vencidas', filter.vencidas.toString());
      }
      if (filter.dispensadas !== undefined) {
        params = params.set('dispensadas', filter.dispensadas.toString());
      }
    }

    return this.http.get<PrescriptionListResponse>(`${this.apiUrl}`, { params })
      .pipe(
        map((response) => {
          // Actualizar cache local
          response.prescriptions.forEach(prescription => {
            this.prescriptionsCache.set(prescription.prescriptionId, prescription);
          });
          
          // Actualizar estado reactivo
          this.prescriptionsSubject.next(response.prescriptions);
          this.lastSearchFilter = filter || null;
          this.lastCacheUpdate = Date.now();
          
          this.setLoading(false);
          return response;
        }),
        catchError((error) => {
          this.handleError('Error al obtener prescripciones', error);
          return of({
            prescriptions: [],
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
   * Obtiene una prescripción por ID
   */
  getPrescriptionById(id: string): Observable<IPrescription | null> {
    // Verificar cache primero
    if (this.prescriptionsCache.has(id) && this.isCacheValid()) {
      const cachedPrescription = this.prescriptionsCache.get(id)!;
      this.selectedPrescriptionSubject.next(cachedPrescription);
      return of(cachedPrescription);
    }

    this.setLoading(true);
    this.clearError();

    return this.http.get<IPrescription>(`${this.apiUrl}/${id}`)
      .pipe(
        map((prescription) => {
          // Actualizar cache y estado
          this.prescriptionsCache.set(id, prescription);
          this.selectedPrescriptionSubject.next(prescription);
          this.setLoading(false);
          return prescription;
        }),
        catchError((error) => {
          this.handleError('Error al obtener prescripción', error);
          this.selectedPrescriptionSubject.next(null);
          return of(null);
        })
      );
  }

  /**
   * Obtiene todas las prescripciones de un paciente específico
   */
  getPrescriptionsByPatient(
    patientId: string,
    activeOnly: boolean = false
  ): Observable<IPrescription[]> {
    // Verificar cache de paciente
    const cacheKey = `${patientId}:${activeOnly ? 'active' : 'all'}`;
    if (this.patientPrescriptionsCache.has(cacheKey) && this.isCacheValid()) {
      return of(this.patientPrescriptionsCache.get(cacheKey)!);
    }

    this.setLoading(true);
    this.clearError();

    let params = new HttpParams().set('patientId', patientId);
    if (activeOnly) {
      params = params.set('vigentes', 'true');
    }

    return this.http.get<IPrescription[]>(`${this.apiUrl}/patient/${patientId}`, { params })
      .pipe(
        map((prescriptions) => {
          // Actualizar cache de paciente y general
          this.patientPrescriptionsCache.set(cacheKey, prescriptions);
          prescriptions.forEach(prescription => {
            this.prescriptionsCache.set(prescription.prescriptionId, prescription);
          });
          
          this.setLoading(false);
          return prescriptions;
        }),
        catchError((error) => {
          this.handleError('Error al obtener prescripciones del paciente', error);
          return of([]);
        })
      );
  }

  /**
   * Crea una nueva prescripción
   */
  createPrescription(prescriptionData: CreatePrescriptionData): Observable<IPrescription | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<IPrescription>(`${this.apiUrl}`, prescriptionData)
      .pipe(
        map((newPrescription) => {
          // Agregar al cache
          this.prescriptionsCache.set(newPrescription.prescriptionId, newPrescription);
          
          // Invalidar cache de paciente
          if (newPrescription.patientId) {
            this.invalidatePatientCache(newPrescription.patientId);
          }
          
          // Actualizar lista de prescripciones
          const currentPrescriptions = this.prescriptionsSubject.value;
          this.prescriptionsSubject.next([newPrescription, ...currentPrescriptions]);
          
          this.selectedPrescriptionSubject.next(newPrescription);
          this.setLoading(false);
          return newPrescription;
        }),
        catchError((error) => {
          this.handleError('Error al crear prescripción', error);
          return of(null);
        })
      );
  }

  /**
   * Actualiza una prescripción existente
   */
  updatePrescription(
    id: string, 
    updates: UpdatePrescriptionData
  ): Observable<IPrescription | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.put<IPrescription>(`${this.apiUrl}/${id}`, updates)
      .pipe(
        map((updatedPrescription) => {
          // Actualizar cache
          this.prescriptionsCache.set(id, updatedPrescription);
          
          // Invalidar cache de paciente si cambió
          if (updatedPrescription.patientId) {
            this.invalidatePatientCache(updatedPrescription.patientId);
          }
          
          // Actualizar lista de prescripciones
          const currentPrescriptions = this.prescriptionsSubject.value;
          const updatedList = currentPrescriptions.map(p => 
            p.prescriptionId === id ? updatedPrescription : p
          );
          this.prescriptionsSubject.next(updatedList);
          
          // Actualizar prescripción seleccionada si es la misma
          const currentSelected = this.selectedPrescriptionSubject.value;
          if (currentSelected && currentSelected.prescriptionId === id) {
            this.selectedPrescriptionSubject.next(updatedPrescription);
          }
          
          this.setLoading(false);
          return updatedPrescription;
        }),
        catchError((error) => {
          this.handleError('Error al actualizar prescripción', error);
          return of(null);
        })
      );
  }

  /**
   * Elimina una prescripción
   */
  deletePrescription(id: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => {
          // Obtener prescripción antes de eliminar para invalidar cache de paciente
          const prescription = this.prescriptionsCache.get(id);
          
          // Remover del cache
          this.prescriptionsCache.delete(id);
          
          // Invalidar cache de paciente
          if (prescription && prescription.patientId) {
            this.invalidatePatientCache(prescription.patientId);
          }
          
          // Remover de la lista
          const currentPrescriptions = this.prescriptionsSubject.value;
          const filteredList = currentPrescriptions.filter(p => p.prescriptionId !== id);
          this.prescriptionsSubject.next(filteredList);
          
          // Limpiar selección si era la prescripción eliminada
          const currentSelected = this.selectedPrescriptionSubject.value;
          if (currentSelected && currentSelected.prescriptionId === id) {
            this.selectedPrescriptionSubject.next(null);
          }
          
          this.setLoading(false);
          return true;
        }),
        catchError((error) => {
          this.handleError('Error al eliminar prescripción', error);
          return of(false);
        })
      );
  }

  /**
   * Marca una prescripción como completada/dispensada
   */
  markAsDispensed(prescriptionId: string, dispensedDate?: Date): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    const body = {
      estado: 'completada',
      fechaDispensacion: dispensedDate || new Date()
    };

    return this.http.patch(`${this.apiUrl}/${prescriptionId}/dispense`, body)
      .pipe(
        map(() => {
          // Invalidar cache para forzar actualización
          this.prescriptionsCache.delete(prescriptionId);
          
          // También invalidar cache de paciente
          const prescription = this.prescriptionsCache.get(prescriptionId);
          if (prescription && prescription.patientId) {
            this.invalidatePatientCache(prescription.patientId);
          }
          
          this.setLoading(false);
          return true;
        }),
        catchError((error) => {
          this.handleError('Error al marcar prescripción como dispensada', error);
          return of(false);
        })
      );
  }

  /**
   * Suspende una prescripción
   */
  suspendPrescription(prescriptionId: string, reason: string): Observable<boolean> {
    return this.http.patch(`${this.apiUrl}/${prescriptionId}/suspend`, { razon: reason })
      .pipe(
        map(() => {
          // Invalidar cache
          this.prescriptionsCache.delete(prescriptionId);
          return true;
        }),
        catchError((error) => {
          this.handleError('Error al suspender prescripción', error);
          return of(false);
        })
      );
  }

  /**
   * Busca prescripciones avanzada
   */
  searchPrescriptions(query: string, filters?: PrescriptionFilters): Observable<IPrescription[]> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams().set('search', query);

    if (filters) {
      if (filters.estado && filters.estado.length > 0) {
        params = params.set('estado', filters.estado.join(','));
      }
      if (filters.fechaDesde) {
        params = params.set('fechaDesde', filters.fechaDesde.toISOString());
      }
      if (filters.fechaHasta) {
        params = params.set('fechaHasta', filters.fechaHasta.toISOString());
      }
    }

    return this.http.get<IPrescription[]>(`${this.apiUrl}/search/advanced`, { params })
      .pipe(
        map((prescriptions) => {
          // Actualizar cache
          prescriptions.forEach(prescription => {
            this.prescriptionsCache.set(prescription.prescriptionId, prescription);
          });
          
          this.setLoading(false);
          return prescriptions;
        }),
        catchError((error) => {
          this.handleError('Error en búsqueda avanzada de prescripciones', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene estadísticas de prescripciones
   */
  getPrescriptionStats(filters?: PrescriptionFilters): Observable<PrescriptionStats | null> {
    let params = new HttpParams();

    if (filters) {
      if (filters.fechaDesde) {
        params = params.set('fechaDesde', filters.fechaDesde.toISOString());
      }
      if (filters.fechaHasta) {
        params = params.set('fechaHasta', filters.fechaHasta.toISOString());
      }
    }

    return this.http.get<PrescriptionStats>(`${this.apiUrl}/stats`, { params })
      .pipe(
        catchError((error) => {
          this.handleError('Error al obtener estadísticas de prescripciones', error);
          return of(null);
        })
      );
  }

  /**
   * Obtiene prescripciones que están por vencer
   */
  getExpiringPrescriptions(days: number = 7): Observable<IPrescription[]> {
    const params = new HttpParams().set('daysToExpiry', days.toString());

    return this.http.get<IPrescription[]>(`${this.apiUrl}/expiring`, { params })
      .pipe(
        catchError((error) => {
          this.handleError('Error al obtener prescripciones por vencer', error);
          return of([]);
        })
      );
  }

  /**
   * Verifica adherencia al tratamiento de un paciente
   */
  checkAdherence(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/adherence/${patientId}`)
      .pipe(
        catchError((error) => {
          this.handleError('Error al verificar adherencia', error);
          return of(null);
        })
      );
  }

  /**
   * Selecciona una prescripción en el estado del servicio
   */
  selectPrescription(prescription: IPrescription | null): void {
    this.selectedPrescriptionSubject.next(prescription);
  }

  /**
   * Limpia el cache del servicio
   */
  clearCache(): void {
    this.prescriptionsCache.clear();
    this.patientPrescriptionsCache.clear();
    this.lastCacheUpdate = 0;
    this.lastSearchFilter = null;
  }

  /**
   * Recarga los datos con el último filtro usado
   */
  refreshData(): Observable<PrescriptionListResponse> {
    this.clearCache();
    return this.getPrescriptions(1, 20, this.lastSearchFilter || undefined);
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

  private invalidatePatientCache(patientId: string): void {
    // Remover todas las entradas de cache para este paciente
    for (const key of this.patientPrescriptionsCache.keys()) {
      if (key.startsWith(patientId + ':')) {
        this.patientPrescriptionsCache.delete(key);
      }
    }
  }

  // Getters para acceso directo al estado
  get currentPrescriptions(): IPrescription[] {
    return this.prescriptionsSubject.value;
  }

  get currentSelectedPrescription(): IPrescription | null {
    return this.selectedPrescriptionSubject.value;
  }

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  get currentError(): string | null {
    return this.errorSubject.value;
  }
}