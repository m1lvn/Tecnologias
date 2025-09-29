import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, of } from 'rxjs';
import { IMedication, CreateMedicationData, UpdateMedicationData, MedicationFilters } from '../models/medication.interface';
import { environment } from '../../environments/environment';

export interface MedicationListResponse {
  medications: IMedication[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MedicationSearchResponse {
  medications: IMedication[];
  suggestions: string[];
  categories: string[];
}

export interface MedicationStats {
  totalMedications: number;
  activeIngredients: number;
  mostPrescribed: Array<{
    medicationId: string;
    name: string;
    prescriptionCount: number;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
  }>;
  lowStockAlerts: number;
}

@Injectable({
  providedIn: 'root'
})
export class MedicationService {
  private readonly apiUrl = `${environment.apiUrl}/medications`;
  
  // Estado reactivo del servicio
  private medicationsSubject = new BehaviorSubject<IMedication[]>([]);
  private selectedMedicationSubject = new BehaviorSubject<IMedication | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public medications$ = this.medicationsSubject.asObservable();
  public selectedMedication$ = this.selectedMedicationSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  // Cache local para optimización
  private medicationsCache = new Map<string, IMedication>();
  private searchCache = new Map<string, IMedication[]>();
  private lastSearchFilter: MedicationFilters | null = null;
  private cacheExpiration = 10 * 60 * 1000; // 10 minutos (datos menos volátiles)
  private lastCacheUpdate = 0;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los medicamentos con paginación y filtros
   */
  getMedications(
    page: number = 1,
    limit: number = 20,
    filter?: MedicationFilters
  ): Observable<MedicationListResponse> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filter) {
      if (filter.nombre) {
        params = params.set('nombre', filter.nombre);
      }
      if (filter.principioActivo) {
        params = params.set('principioActivo', filter.principioActivo);
      }
      if (filter.grupoTerapeutico) {
        params = params.set('grupoTerapeutico', filter.grupoTerapeutico);
      }
      if (filter.laboratorio) {
        params = params.set('laboratorio', filter.laboratorio);
      }
      if (filter.requiereReceta !== undefined) {
        params = params.set('requiereReceta', filter.requiereReceta.toString());
      }
      if (filter.activo !== undefined) {
        params = params.set('activo', filter.activo.toString());
      }
      if (filter.precioMin !== undefined) {
        params = params.set('precioMin', filter.precioMin.toString());
      }
      if (filter.precioMax !== undefined) {
        params = params.set('precioMax', filter.precioMax.toString());
      }
      if (filter.disponibilidad && filter.disponibilidad.length > 0) {
        params = params.set('disponibilidad', filter.disponibilidad.join(','));
      }
    }

    return this.http.get<MedicationListResponse>(`${this.apiUrl}`, { params })
      .pipe(
        map((response) => {
          // Actualizar cache local
          response.medications.forEach(medication => {
            this.medicationsCache.set(medication.medicationId, medication);
          });
          
          // Actualizar estado reactivo
          this.medicationsSubject.next(response.medications);
          this.lastSearchFilter = filter || null;
          this.lastCacheUpdate = Date.now();
          
          this.setLoading(false);
          return response;
        }),
        catchError((error) => {
          this.handleError('Error al obtener medicamentos', error);
          return of({
            medications: [],
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
   * Obtiene un medicamento por ID
   */
  getMedicationById(id: string): Observable<IMedication | null> {
    // Verificar cache primero
    if (this.medicationsCache.has(id) && this.isCacheValid()) {
      const cachedMedication = this.medicationsCache.get(id)!;
      this.selectedMedicationSubject.next(cachedMedication);
      return of(cachedMedication);
    }

    this.setLoading(true);
    this.clearError();

    return this.http.get<IMedication>(`${this.apiUrl}/${id}`)
      .pipe(
        map((medication) => {
          // Actualizar cache y estado
          this.medicationsCache.set(id, medication);
          this.selectedMedicationSubject.next(medication);
          this.setLoading(false);
          return medication;
        }),
        catchError((error) => {
          this.handleError('Error al obtener medicamento', error);
          this.selectedMedicationSubject.next(null);
          return of(null);
        })
      );
  }

  /**
   * Búsqueda de medicamentos por principio activo
   */
  searchByActiveIngredient(ingredient: string): Observable<IMedication[]> {
    // Verificar cache de búsqueda
    const cacheKey = `ingredient:${ingredient.toLowerCase()}`;
    if (this.searchCache.has(cacheKey) && this.isCacheValid()) {
      return of(this.searchCache.get(cacheKey)!);
    }

    this.setLoading(true);
    this.clearError();

    const params = new HttpParams().set('principioActivo', ingredient);

    return this.http.get<IMedication[]>(`${this.apiUrl}/search/ingredient`, { params })
      .pipe(
        map((medications) => {
          // Actualizar cache de búsqueda y general
          this.searchCache.set(cacheKey, medications);
          medications.forEach(medication => {
            this.medicationsCache.set(medication.medicationId, medication);
          });
          
          this.setLoading(false);
          return medications;
        }),
        catchError((error) => {
          this.handleError('Error en búsqueda por principio activo', error);
          return of([]);
        })
      );
  }

  /**
   * Crea un nuevo medicamento
   */
  createMedication(medicationData: CreateMedicationData): Observable<IMedication | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<IMedication>(`${this.apiUrl}`, medicationData)
      .pipe(
        map((newMedication) => {
          // Agregar al cache
          this.medicationsCache.set(newMedication.medicationId, newMedication);
          
          // Actualizar lista de medicamentos
          const currentMedications = this.medicationsSubject.value;
          this.medicationsSubject.next([newMedication, ...currentMedications]);
          
          this.selectedMedicationSubject.next(newMedication);
          this.setLoading(false);
          return newMedication;
        }),
        catchError((error) => {
          this.handleError('Error al crear medicamento', error);
          return of(null);
        })
      );
  }

  /**
   * Actualiza un medicamento existente
   */
  updateMedication(
    id: string, 
    updates: UpdateMedicationData
  ): Observable<IMedication | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.put<IMedication>(`${this.apiUrl}/${id}`, updates)
      .pipe(
        map((updatedMedication) => {
          // Actualizar cache
          this.medicationsCache.set(id, updatedMedication);
          
          // Limpiar cache de búsqueda (puede haber cambiado)
          this.searchCache.clear();
          
          // Actualizar lista de medicamentos
          const currentMedications = this.medicationsSubject.value;
          const updatedList = currentMedications.map(m => 
            m.medicationId === id ? updatedMedication : m
          );
          this.medicationsSubject.next(updatedList);
          
          // Actualizar medicamento seleccionado si es el mismo
          const currentSelected = this.selectedMedicationSubject.value;
          if (currentSelected && currentSelected.medicationId === id) {
            this.selectedMedicationSubject.next(updatedMedication);
          }
          
          this.setLoading(false);
          return updatedMedication;
        }),
        catchError((error) => {
          this.handleError('Error al actualizar medicamento', error);
          return of(null);
        })
      );
  }

  /**
   * Elimina un medicamento
   */
  deleteMedication(id: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => {
          // Remover del cache
          this.medicationsCache.delete(id);
          this.searchCache.clear(); // Limpiar búsquedas
          
          // Remover de la lista
          const currentMedications = this.medicationsSubject.value;
          const filteredList = currentMedications.filter(m => m.medicationId !== id);
          this.medicationsSubject.next(filteredList);
          
          // Limpiar selección si era el medicamento eliminado
          const currentSelected = this.selectedMedicationSubject.value;
          if (currentSelected && currentSelected.medicationId === id) {
            this.selectedMedicationSubject.next(null);
          }
          
          this.setLoading(false);
          return true;
        }),
        catchError((error) => {
          this.handleError('Error al eliminar medicamento', error);
          return of(false);
        })
      );
  }

  /**
   * Búsqueda avanzada de medicamentos
   */
  searchMedications(query: string, filters?: MedicationFilters): Observable<MedicationSearchResponse> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams().set('search', query);

    if (filters) {
      if (filters.grupoTerapeutico) {
        params = params.set('grupoTerapeutico', filters.grupoTerapeutico);
      }
      if (filters.laboratorio) {
        params = params.set('laboratorio', filters.laboratorio);
      }
      if (filters.requiereReceta !== undefined) {
        params = params.set('requiereReceta', filters.requiereReceta.toString());
      }
      if (filters.precioMin !== undefined) {
        params = params.set('precioMin', filters.precioMin.toString());
      }
      if (filters.precioMax !== undefined) {
        params = params.set('precioMax', filters.precioMax.toString());
      }
    }

    return this.http.get<MedicationSearchResponse>(`${this.apiUrl}/search/advanced`, { params })
      .pipe(
        map((response) => {
          // Actualizar cache
          response.medications.forEach(medication => {
            this.medicationsCache.set(medication.medicationId, medication);
          });
          
          this.setLoading(false);
          return response;
        }),
        catchError((error) => {
          this.handleError('Error en búsqueda avanzada de medicamentos', error);
          return of({
            medications: [],
            suggestions: [],
            categories: []
          });
        })
      );
  }

  /**
   * Obtiene estadísticas de medicamentos
   */
  getMedicationStats(): Observable<MedicationStats | null> {
    return this.http.get<MedicationStats>(`${this.apiUrl}/stats`)
      .pipe(
        catchError((error) => {
          this.handleError('Error al obtener estadísticas de medicamentos', error);
          return of(null);
        })
      );
  }

  /**
   * Obtiene medicamentos por grupo terapéutico
   */
  getMedicationsByTherapeuticGroup(group: string): Observable<IMedication[]> {
    const cacheKey = `group:${group.toLowerCase()}`;
    if (this.searchCache.has(cacheKey) && this.isCacheValid()) {
      return of(this.searchCache.get(cacheKey)!);
    }

    const params = new HttpParams().set('grupoTerapeutico', group);

    return this.http.get<IMedication[]>(`${this.apiUrl}/therapeutic-group`, { params })
      .pipe(
        map((medications) => {
          this.searchCache.set(cacheKey, medications);
          medications.forEach(medication => {
            this.medicationsCache.set(medication.medicationId, medication);
          });
          return medications;
        }),
        catchError((error) => {
          this.handleError('Error al obtener medicamentos por categoría', error);
          return of([]);
        })
      );
  }

  /**
   * Verifica interacciones medicamentosas
   */
  checkInteractions(medicationIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/interactions`, { medicationIds })
      .pipe(
        catchError((error) => {
          this.handleError('Error al verificar interacciones', error);
          return of(null);
        })
      );
  }

  /**
   * Selecciona un medicamento en el estado del servicio
   */
  selectMedication(medication: IMedication | null): void {
    this.selectedMedicationSubject.next(medication);
  }

  /**
   * Limpia el cache del servicio
   */
  clearCache(): void {
    this.medicationsCache.clear();
    this.searchCache.clear();
    this.lastCacheUpdate = 0;
    this.lastSearchFilter = null;
  }

  /**
   * Recarga los datos con el último filtro usado
   */
  refreshData(): Observable<MedicationListResponse> {
    this.clearCache();
    return this.getMedications(1, 20, this.lastSearchFilter || undefined);
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
  get currentMedications(): IMedication[] {
    return this.medicationsSubject.value;
  }

  get currentSelectedMedication(): IMedication | null {
    return this.selectedMedicationSubject.value;
  }

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  get currentError(): string | null {
    return this.errorSubject.value;
  }
}