import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, of } from 'rxjs';
import { IDoctor, CreateDoctorData, UpdateDoctorData, DoctorFilters } from '../models/doctor.interface';
import { environment } from '../../environments/environment';

export interface DoctorListResponse {
  doctors: IDoctor[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DoctorStats {
  totalDoctors: number;
  activeDoctors: number;
  doctorsBySpecialty: Array<{
    specialty: string;
    count: number;
  }>;
  averageConsultationsPerDoctor: number;
  topPerformingDoctors: Array<{
    doctorId: string;
    name: string;
    consultationCount: number;
    patientSatisfaction: number;
  }>;
  workloadDistribution: Array<{
    doctorId: string;
    name: string;
    activePatients: number;
    weeklyConsultations: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly apiUrl = `${environment.apiUrl}/doctors`;
  
  // Estado reactivo del servicio
  private doctorsSubject = new BehaviorSubject<IDoctor[]>([]);
  private selectedDoctorSubject = new BehaviorSubject<IDoctor | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public doctors$ = this.doctorsSubject.asObservable();
  public selectedDoctor$ = this.selectedDoctorSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  // Cache local para optimización
  private doctorsCache = new Map<string, IDoctor>();
  private specialtyCache = new Map<string, IDoctor[]>();
  private lastSearchFilter: DoctorFilters | null = null;
  private cacheExpiration = 15 * 60 * 1000; // 15 minutos (datos de doctores cambian poco)
  private lastCacheUpdate = 0;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los médicos con paginación y filtros
   */
  getDoctors(
    page: number = 1,
    limit: number = 20,
    filter?: DoctorFilters
  ): Observable<DoctorListResponse> {
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
      if (filter.especialidad && filter.especialidad.length > 0) {
        params = params.set('especialidad', filter.especialidad.join(','));
      }
      if (filter.centroMedico) {
        params = params.set('centroMedico', filter.centroMedico);
      }
      if (filter.activo !== undefined) {
        params = params.set('activo', filter.activo.toString());
      }
      if (filter.experienciaMin !== undefined) {
        params = params.set('experienciaMin', filter.experienciaMin.toString());
      }
      if (filter.atencionPrivada !== undefined) {
        params = params.set('atencionPrivada', filter.atencionPrivada.toString());
      }
      if (filter.telemedicina !== undefined) {
        params = params.set('telemedicina', filter.telemedicina.toString());
      }
    }

    return this.http.get<DoctorListResponse>(`${this.apiUrl}`, { params })
      .pipe(
        map((response) => {
          // Actualizar cache local
          response.doctors.forEach(doctor => {
            this.doctorsCache.set(doctor.doctorId, doctor);
          });
          
          // Actualizar estado reactivo
          this.doctorsSubject.next(response.doctors);
          this.lastSearchFilter = filter || null;
          this.lastCacheUpdate = Date.now();
          
          this.setLoading(false);
          return response;
        }),
        catchError((error) => {
          this.handleError('Error al obtener médicos', error);
          return of({
            doctors: [],
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
   * Obtiene un médico por ID
   */
  getDoctorById(id: string): Observable<IDoctor | null> {
    // Verificar cache primero
    if (this.doctorsCache.has(id) && this.isCacheValid()) {
      const cachedDoctor = this.doctorsCache.get(id)!;
      this.selectedDoctorSubject.next(cachedDoctor);
      return of(cachedDoctor);
    }

    this.setLoading(true);
    this.clearError();

    return this.http.get<IDoctor>(`${this.apiUrl}/${id}`)
      .pipe(
        map((doctor) => {
          // Actualizar cache y estado
          this.doctorsCache.set(id, doctor);
          this.selectedDoctorSubject.next(doctor);
          this.setLoading(false);
          return doctor;
        }),
        catchError((error) => {
          this.handleError('Error al obtener médico', error);
          this.selectedDoctorSubject.next(null);
          return of(null);
        })
      );
  }

  /**
   * Busca médicos por RUT
   */
  getDoctorByRut(rut: string): Observable<IDoctor | null> {
    this.setLoading(true);
    this.clearError();

    const params = new HttpParams().set('rut', rut);

    return this.http.get<IDoctor>(`${this.apiUrl}/search`, { params })
      .pipe(
        map((doctor) => {
          if (doctor && doctor.doctorId) {
            this.doctorsCache.set(doctor.doctorId, doctor);
            this.selectedDoctorSubject.next(doctor);
          }
          this.setLoading(false);
          return doctor;
        }),
        catchError((error) => {
          this.handleError('Error al buscar médico por RUT', error);
          return of(null);
        })
      );
  }

  /**
   * Obtiene médicos por especialidad
   */
  getDoctorsBySpecialty(specialty: string): Observable<IDoctor[]> {
    // Verificar cache de especialidad
    if (this.specialtyCache.has(specialty) && this.isCacheValid()) {
      return of(this.specialtyCache.get(specialty)!);
    }

    this.setLoading(true);
    this.clearError();

    const params = new HttpParams().set('especialidad', specialty);

    return this.http.get<IDoctor[]>(`${this.apiUrl}/specialty`, { params })
      .pipe(
        map((doctors) => {
          // Actualizar cache de especialidad y general
          this.specialtyCache.set(specialty, doctors);
          doctors.forEach(doctor => {
            this.doctorsCache.set(doctor.doctorId, doctor);
          });
          
          this.setLoading(false);
          return doctors;
        }),
        catchError((error) => {
          this.handleError('Error al obtener médicos por especialidad', error);
          return of([]);
        })
      );
  }

  /**
   * Crea un nuevo médico
   */
  createDoctor(doctorData: CreateDoctorData): Observable<IDoctor | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<IDoctor>(`${this.apiUrl}`, doctorData)
      .pipe(
        map((newDoctor) => {
          // Agregar al cache
          this.doctorsCache.set(newDoctor.doctorId, newDoctor);
          
          // Limpiar cache de especialidad
          this.specialtyCache.clear();
          
          // Actualizar lista de médicos
          const currentDoctors = this.doctorsSubject.value;
          this.doctorsSubject.next([newDoctor, ...currentDoctors]);
          
          this.selectedDoctorSubject.next(newDoctor);
          this.setLoading(false);
          return newDoctor;
        }),
        catchError((error) => {
          this.handleError('Error al crear médico', error);
          return of(null);
        })
      );
  }

  /**
   * Actualiza un médico existente
   */
  updateDoctor(
    id: string, 
    updates: UpdateDoctorData
  ): Observable<IDoctor | null> {
    this.setLoading(true);
    this.clearError();

    return this.http.put<IDoctor>(`${this.apiUrl}/${id}`, updates)
      .pipe(
        map((updatedDoctor) => {
          // Actualizar cache
          this.doctorsCache.set(id, updatedDoctor);
          
          // Limpiar cache de especialidad (puede haber cambiado)
          this.specialtyCache.clear();
          
          // Actualizar lista de médicos
          const currentDoctors = this.doctorsSubject.value;
          const updatedList = currentDoctors.map(d => 
            d.doctorId === id ? updatedDoctor : d
          );
          this.doctorsSubject.next(updatedList);
          
          // Actualizar médico seleccionado si es el mismo
          const currentSelected = this.selectedDoctorSubject.value;
          if (currentSelected && currentSelected.doctorId === id) {
            this.selectedDoctorSubject.next(updatedDoctor);
          }
          
          this.setLoading(false);
          return updatedDoctor;
        }),
        catchError((error) => {
          this.handleError('Error al actualizar médico', error);
          return of(null);
        })
      );
  }

  /**
   * Elimina un médico (marca como inactivo)
   */
  deleteDoctor(id: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => {
          // Remover del cache
          this.doctorsCache.delete(id);
          this.specialtyCache.clear(); // Limpiar cache de especialidades
          
          // Remover de la lista
          const currentDoctors = this.doctorsSubject.value;
          const filteredList = currentDoctors.filter(d => d.doctorId !== id);
          this.doctorsSubject.next(filteredList);
          
          // Limpiar selección si era el médico eliminado
          const currentSelected = this.selectedDoctorSubject.value;
          if (currentSelected && currentSelected.doctorId === id) {
            this.selectedDoctorSubject.next(null);
          }
          
          this.setLoading(false);
          return true;
        }),
        catchError((error) => {
          this.handleError('Error al eliminar médico', error);
          return of(false);
        })
      );
  }

  /**
   * Búsqueda avanzada de médicos
   */
  searchDoctors(query: string, filters?: DoctorFilters): Observable<IDoctor[]> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams().set('search', query);

    if (filters) {
      if (filters.especialidad && filters.especialidad.length > 0) {
        params = params.set('especialidad', filters.especialidad.join(','));
      }
      if (filters.centroMedico) {
        params = params.set('centroMedico', filters.centroMedico);
      }
      if (filters.activo !== undefined) {
        params = params.set('activo', filters.activo.toString());
      }
      if (filters.atencionPrivada !== undefined) {
        params = params.set('atencionPrivada', filters.atencionPrivada.toString());
      }
      if (filters.telemedicina !== undefined) {
        params = params.set('telemedicina', filters.telemedicina.toString());
      }
    }

    return this.http.get<IDoctor[]>(`${this.apiUrl}/search/advanced`, { params })
      .pipe(
        map((doctors) => {
          // Actualizar cache
          doctors.forEach(doctor => {
            this.doctorsCache.set(doctor.doctorId, doctor);
          });
          
          this.setLoading(false);
          return doctors;
        }),
        catchError((error) => {
          this.handleError('Error en búsqueda avanzada de médicos', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene estadísticas de médicos
   */
  getDoctorStats(): Observable<DoctorStats | null> {
    return this.http.get<DoctorStats>(`${this.apiUrl}/stats`)
      .pipe(
        catchError((error) => {
          this.handleError('Error al obtener estadísticas de médicos', error);
          return of(null);
        })
      );
  }

  /**
   * Obtiene la carga de trabajo de un médico
   */
  getDoctorWorkload(doctorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${doctorId}/workload`)
      .pipe(
        catchError((error) => {
          this.handleError('Error al obtener carga de trabajo', error);
          return of(null);
        })
      );
  }

  /**
   * Obtiene las especialidades disponibles
   */
  getAvailableSpecialties(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/specialties`)
      .pipe(
        catchError((error) => {
          this.handleError('Error al obtener especialidades', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene médicos disponibles para una fecha específica
   */
  getAvailableDoctors(date: Date, specialty?: string): Observable<IDoctor[]> {
    let params = new HttpParams().set('date', date.toISOString());
    
    if (specialty) {
      params = params.set('especialidad', specialty);
    }

    return this.http.get<IDoctor[]>(`${this.apiUrl}/available`, { params })
      .pipe(
        map((doctors) => {
          // No cachear estos resultados ya que dependen de la fecha
          this.setLoading(false);
          return doctors;
        }),
        catchError((error) => {
          this.handleError('Error al obtener médicos disponibles', error);
          return of([]);
        })
      );
  }

  /**
   * Verifica disponibilidad de un médico específico
   */
  checkDoctorAvailability(doctorId: string, date: Date): Observable<boolean> {
    const params = new HttpParams()
      .set('doctorId', doctorId)
      .set('date', date.toISOString());

    return this.http.get<{available: boolean}>(`${this.apiUrl}/availability`, { params })
      .pipe(
        map(response => response.available),
        catchError((error) => {
          this.handleError('Error al verificar disponibilidad', error);
          return of(false);
        })
      );
  }

  /**
   * Obtiene el horario de un médico
   */
  getDoctorSchedule(doctorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${doctorId}/schedule`)
      .pipe(
        catchError((error) => {
          this.handleError('Error al obtener horario del médico', error);
          return of(null);
        })
      );
  }

  /**
   * Selecciona un médico en el estado del servicio
   */
  selectDoctor(doctor: IDoctor | null): void {
    this.selectedDoctorSubject.next(doctor);
  }

  /**
   * Limpia el cache del servicio
   */
  clearCache(): void {
    this.doctorsCache.clear();
    this.specialtyCache.clear();
    this.lastCacheUpdate = 0;
    this.lastSearchFilter = null;
  }

  /**
   * Recarga los datos con el último filtro usado
   */
  refreshData(): Observable<DoctorListResponse> {
    this.clearCache();
    return this.getDoctors(1, 20, this.lastSearchFilter || undefined);
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
  get currentDoctors(): IDoctor[] {
    return this.doctorsSubject.value;
  }

  get currentSelectedDoctor(): IDoctor | null {
    return this.selectedDoctorSubject.value;
  }

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  get currentError(): string | null {
    return this.errorSubject.value;
  }
}