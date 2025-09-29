import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, of, throwError } from 'rxjs';
import { Patient, PatientListResponse, CreatePatientRequest, UpdatePatientRequest } from '../models/patient.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/patients`;
  
  // Subjects para estado reactivo
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public patients$ = this.patientsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtener lista de pacientes con paginación
   */
  getPatients(page: number = 1, limit: number = 20, search?: string): Observable<PatientListResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PatientListResponse>(this.apiUrl, { params }).pipe(
      map(response => {
        // Actualizar el subject con los pacientes
        this.patientsSubject.next(response.patients);
        this.loadingSubject.next(false);
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        
        // Devolver respuesta vacía pero válida para que la UI pueda mostrar placeholders
        const emptyResponse: PatientListResponse = {
          patients: [],
          total: 0,
          page: 1,
          totalPages: 0,
          limit: limit
        };
        
        return of(emptyResponse);
      })
    );
  }

  /**
   * Obtener un paciente por ID
   */
  getPatientById(id: string): Observable<Patient | null> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<Patient>(`${this.apiUrl}/${id}`).pipe(
      map(patient => {
        this.loadingSubject.next(false);
        return patient;
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return of(null);
      })
    );
  }

  /**
   * Crear un nuevo paciente
   */
  createPatient(patient: CreatePatientRequest): Observable<Patient | null> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<Patient>(this.apiUrl, patient).pipe(
      map(newPatient => {
        this.loadingSubject.next(false);
        // Actualizar la lista de pacientes
        const currentPatients = this.patientsSubject.value;
        this.patientsSubject.next([newPatient, ...currentPatients]);
        return newPatient;
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return of(null);
      })
    );
  }

  /**
   * Actualizar un paciente
   */
  updatePatient(id: string, updates: UpdatePatientRequest): Observable<Patient | null> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.put<Patient>(`${this.apiUrl}/${id}`, updates).pipe(
      map(updatedPatient => {
        this.loadingSubject.next(false);
        // Actualizar la lista de pacientes
        const currentPatients = this.patientsSubject.value;
        const index = currentPatients.findIndex(p => p.id === id);
        if (index >= 0) {
          currentPatients[index] = updatedPatient;
          this.patientsSubject.next([...currentPatients]);
        }
        return updatedPatient;
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return of(null);
      })
    );
  }

  /**
   * Eliminar un paciente
   */
  deletePatient(id: string): Observable<boolean> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        this.loadingSubject.next(false);
        // Remover de la lista de pacientes
        const currentPatients = this.patientsSubject.value;
        const filteredPatients = currentPatients.filter(p => p.id !== id);
        this.patientsSubject.next(filteredPatients);
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return of(false);
      })
    );
  }

  /**
   * Buscar pacientes
   */
  searchPatients(query: string): Observable<Patient[]> {
    if (!query.trim()) {
      return of([]);
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const params = new HttpParams().set('search', query.trim());

    return this.http.get<Patient[]>(`${this.apiUrl}/search`, { params }).pipe(
      map(patients => {
        this.loadingSubject.next(false);
        return patients;
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return of([]);
      })
    );
  }

  /**
   * Limpiar errores
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: HttpErrorResponse): string {
    console.error('Error al obtener pacientes', error);
    
    if (error.status === 0) {
      // Error de red o CORS
      return 'No se puede conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000';
    } else if (error.status === 404) {
      return 'Recurso no encontrado';
    } else if (error.status === 500) {
      return 'Error interno del servidor';
    } else if (error.status >= 400 && error.status < 500) {
      return error.error?.message || 'Error en la solicitud';
    } else {
      return 'Error desconocido. Inténtalo de nuevo.';
    }
  }
}

export interface PatientCreateRequest {
  personalInfo: PersonalInfo;
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    chronicDiseases?: string[];
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    validUntil: Date;
  };
}

export interface PatientUpdateRequest {
  personalInfo?: Partial<PersonalInfo>;
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    chronicDiseases?: string[];
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  insuranceInfo?: {
    provider?: string;
    policyNumber?: string;
    validUntil?: Date;
  };
}

export interface PatientListResponse {
  patients: IPatient[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly apiUrl = `${environment.apiUrl}/patients`;
  
  // Estado reactivo del servicio
  private patientsSubject = new BehaviorSubject<IPatient[]>([]);
  private selectedPatientSubject = new BehaviorSubject<IPatient | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public patients$ = this.patientsSubject.asObservable();
  public selectedPatient$ = this.selectedPatientSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  // Cache local para optimización
  private patientsCache = new Map<string, IPatient>();
  private lastSearchFilter: PatientFilters | null = null;
  private cacheExpiration = 5 * 60 * 1000; // 5 minutos
  private lastCacheUpdate = 0;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los pacientes con paginación y filtros
   */
  getPatients(
    page: number = 1,
    limit: number = 20,
    filter?: PatientFilters
  ): Observable<PatientListResponse> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filter) {
      if (filter.nombre) {
        params = params.set('nombre', filter.nombre);
      }
      if (filter.apellido) {
        params = params.set('apellido', filter.apellido);
      }
      if (filter.rut) {
        params = params.set('rut', filter.rut);
      }
      if (filter.edadMin !== undefined) {
        params = params.set('edadMin', filter.edadMin.toString());
      }
      if (filter.edadMax !== undefined) {
        params = params.set('edadMax', filter.edadMax.toString());
      }
      if (filter.tipoSangre) {
        params = params.set('tipoSangre', filter.tipoSangre);
      }
      if (filter.activo !== undefined) {
        params = params.set('activo', filter.activo.toString());
      }
      if (filter.sexo) {
        params = params.set('sexo', filter.sexo);
      }
    }

    return this.http.get<PatientListResponse>(`${this.apiUrl}`, { params })
      .pipe(
        map((response) => {
          // Actualizar cache local
          response.patients.forEach(patient => {
            this.patientsCache.set(patient.patientId, patient);
          });
          
          // Actualizar estado reactivo
          this.patientsSubject.next(response.patients);
          this.lastSearchFilter = filter || null;
          this.lastCacheUpdate = Date.now();
          
          this.setLoading(false);
          return response;
        }),
        catchError((error) => {
          this.handleError('Error al obtener pacientes', error);
          return of({
            patients: [],
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
   * Obtiene un paciente por ID
   */
  getPatientById(id: string): Observable<IPatient | null> {
    // Verificar cache primero
    if (this.patientsCache.has(id) && this.isCacheValid()) {
      const cachedPatient = this.patientsCache.get(id)!;
      this.selectedPatientSubject.next(cachedPatient);
      return of(cachedPatient);
    }

    this.setLoading(true);
    this.clearError();

    return this.http.get<IPatient>(`${this.apiUrl}/${id}`)
      .pipe(
        map((patient) => {
          // Actualizar cache y estado
          this.patientsCache.set(id, patient);
          this.selectedPatientSubject.next(patient);
          this.setLoading(false);
          return patient;
        }),
        catchError((error) => {
          this.handleError('Error al obtener paciente', error);
          this.selectedPatientSubject.next(null);
          return of(null);
        })
      );
  }

  /**
   * Busca pacientes por RUT
   */
  getPatientByRut(rut: string): Observable<IPatient | null> {
    this.setLoading(true);
    this.clearError();

    const params = new HttpParams().set('rut', rut);

    return this.http.get<IPatient>(`${this.apiUrl}/search`, { params })
      .pipe(
        map((patient) => {
          if (patient && patient.patientId) {
            this.patientsCache.set(patient.patientId, patient);
            this.selectedPatientSubject.next(patient);
          }
          this.setLoading(false);
          return patient;
        }),
        catchError((error) => {
          this.handleError('Error al buscar paciente por RUT', error);
          return of(null);
        })
      );
  }

  /**
   * Crea un nuevo paciente
   */
  createPatient(patientData: PatientCreateRequest): Observable<IPatient | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<IPatient>(`${this.apiUrl}`, patientData)
      .pipe(
        map((newPatient) => {
          // Agregar al cache y actualizar lista
          if (newPatient.patientId) {
            this.patientsCache.set(newPatient.patientId, newPatient);
          }
          
          // Actualizar lista de pacientes
          const currentPatients = this.patientsSubject.value;
          this.patientsSubject.next([newPatient, ...currentPatients]);
          
          this.selectedPatientSubject.next(newPatient);
          this.setLoading(false);
          return newPatient;
        }),
        catchError((error) => {
          this.handleError('Error al crear paciente', error);
          return of(null);
        })
      );
  }

  /**
   * Actualiza un paciente existente
   */
  updatePatient(id: string, updates: PatientUpdateRequest): Observable<IPatient | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.put<IPatient>(`${this.apiUrl}/${id}`, updates)
      .pipe(
        map((updatedPatient) => {
          // Actualizar cache
          this.patientsCache.set(id, updatedPatient);
          
          // Actualizar lista de pacientes
          const currentPatients = this.patientsSubject.value;
          const updatedList = currentPatients.map(p => 
            p.patientId === id ? updatedPatient : p
          );
          this.patientsSubject.next(updatedList);
          
          // Actualizar paciente seleccionado si es el mismo
          const currentSelected = this.selectedPatientSubject.value;
          if (currentSelected && currentSelected.patientId === id) {
            this.selectedPatientSubject.next(updatedPatient);
          }
          
          this.setLoading(false);
          return updatedPatient;
        }),
        catchError((error) => {
          this.handleError('Error al actualizar paciente', error);
          return of(null);
        })
      );
  }

  /**
   * Elimina un paciente
   */
  deletePatient(id: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => {
          // Remover del cache
          this.patientsCache.delete(id);
          
          // Remover de la lista
          const currentPatients = this.patientsSubject.value;
          const filteredList = currentPatients.filter(p => p.patientId !== id);
          this.patientsSubject.next(filteredList);
          
          // Limpiar selección si era el paciente eliminado
          const currentSelected = this.selectedPatientSubject.value;
          if (currentSelected && currentSelected.patientId === id) {
            this.selectedPatientSubject.next(null);
          }
          
          this.setLoading(false);
          return true;
        }),
        catchError((error) => {
          this.handleError('Error al eliminar paciente', error);
          return of(false);
        })
      );
  }

  /**
   * Búsqueda avanzada de pacientes
   */
  searchPatients(query: string, filters?: PatientFilters): Observable<IPatient[]> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams().set('search', query);

    if (filters) {
      if (filters.edadMin !== undefined) {
        params = params.set('edadMin', filters.edadMin.toString());
      }
      if (filters.edadMax !== undefined) {
        params = params.set('edadMax', filters.edadMax.toString());
      }
      if (filters.tipoSangre) {
        params = params.set('tipoSangre', filters.tipoSangre);
      }
      if (filters.activo !== undefined) {
        params = params.set('activo', filters.activo.toString());
      }
    }

    return this.http.get<IPatient[]>(`${this.apiUrl}/search/advanced`, { params })
      .pipe(
        map((patients) => {
          // Actualizar cache
          patients.forEach(patient => {
            if (patient.patientId) {
              this.patientsCache.set(patient.patientId, patient);
            }
          });
          
          this.setLoading(false);
          return patients;
        }),
        catchError((error) => {
          this.handleError('Error en búsqueda avanzada', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene estadísticas de pacientes
   */
  getPatientStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`)
      .pipe(
        catchError((error) => {
          this.handleError('Error al obtener estadísticas', error);
          return of(null);
        })
      );
  }

  /**
   * Selecciona un paciente en el estado del servicio
   */
  selectPatient(patient: IPatient | null): void {
    this.selectedPatientSubject.next(patient);
  }

  /**
   * Limpia el cache del servicio
   */
  clearCache(): void {
    this.patientsCache.clear();
    this.lastCacheUpdate = 0;
    this.lastSearchFilter = null;
  }

  /**
   * Recarga los datos con el último filtro usado
   */
  refreshData(): Observable<PatientListResponse> {
    this.clearCache();
    return this.getPatients(1, 20, this.lastSearchFilter || undefined);
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
  get currentPatients(): IPatient[] {
    return this.patientsSubject.value;
  }

  get currentSelectedPatient(): IPatient | null {
    return this.selectedPatientSubject.value;
  }

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  get currentError(): string | null {
    return this.errorSubject.value;
  }
}