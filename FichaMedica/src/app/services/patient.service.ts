import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, of } from 'rxjs';
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
          pagination: {
            page: 1,
            limit: limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
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