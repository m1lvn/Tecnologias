import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Exam {
  id: string;
  examId: string;
  patientId: string;
  nombre: string;
  tipo: 'laboratorio' | 'imagen' | 'funcional' | 'biopsia' | 'otros';
  fecha: Date;
  fechaSolicitud?: Date;
  fechaRealizacion?: Date;
  resultado: string;
  estado: 'normal' | 'atencion' | 'critico' | 'pendiente';
  valorReferencia: string;
  detalle: string;
  observaciones?: string;
  laboratorio: string;
  medico: string;
  solicitadoPor?: string;
  tipoExamen: string;
  archivo?: string;
  urgente: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface CreateExamRequest {
  patientId: string;
  nombre: string;
  tipo: 'laboratorio' | 'imagen' | 'funcional' | 'biopsia' | 'otros';
  fechaSolicitud?: string;
  fechaRealizacion?: string;
  solicitadoPor: string;
  laboratorio?: string;
  observaciones?: string;
  urgente?: boolean;
  estado: 'normal' | 'atencion' | 'critico' | 'pendiente';
  resultado?: string;
  valorReferencia?: string;
  detalle?: string;
}

export interface UpdateExamRequest {
  nombre?: string;
  resultado?: string;
  estado?: 'normal' | 'atencion' | 'critico' | 'pendiente';
  valorReferencia?: string;
  detalle?: string;
  observaciones?: string;
  fechaRealizacion?: string;
  laboratorio?: string;
  archivo?: string;
}

export interface ExamListResponse {
  success: boolean;
  examenes: Exam[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ExamResponse {
  success: boolean;
  message: string;
  examen: Exam;
}

export interface ExamFilters {
  tipo?: string;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  laboratorio?: string;
  urgente?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private readonly apiUrl = `${environment.apiUrl}`;
  
  // Estado reactivo
  private examsSubject = new BehaviorSubject<Exam[]>([]);
  private selectedExamSubject = new BehaviorSubject<Exam | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public exams$ = this.examsSubject.asObservable();
  public selectedExam$ = this.selectedExamSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtener exámenes de un paciente
   */
  getPatientExams(patientId: string, filters?: ExamFilters): Observable<ExamListResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ExamListResponse>(`${this.apiUrl}/patients/${patientId}/examenes`, { params }).pipe(
      map((response: ExamListResponse) => {
        this.loadingSubject.next(false);
        this.examsSubject.next(response.examenes);
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Obtener un examen específico por ID
   */
  getExamById(examId: string): Observable<Exam> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<ExamResponse>(`${this.apiUrl}/examenes/${examId}`).pipe(
      map((response: ExamResponse) => {
        this.loadingSubject.next(false);
        this.selectedExamSubject.next(response.examen);
        return response.examen;
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Crear un nuevo examen para un paciente
   */
  createExam(patientId: string, examData: CreateExamRequest): Observable<Exam> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<ExamResponse>(`${this.apiUrl}/patients/${patientId}/examenes`, examData).pipe(
      map((response: ExamResponse) => {
        this.loadingSubject.next(false);
        
        // Actualizar la lista local de exámenes
        const currentExams = this.examsSubject.value;
        this.examsSubject.next([response.examen, ...currentExams]);
        
        return response.examen;
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Actualizar un examen existente
   */
  updateExam(examId: string, updates: UpdateExamRequest): Observable<Exam> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.put<ExamResponse>(`${this.apiUrl}/examenes/${examId}`, updates).pipe(
      map((response: ExamResponse) => {
        this.loadingSubject.next(false);
        
        // Actualizar en la lista local
        const currentExams = this.examsSubject.value;
        const updatedExams = currentExams.map(exam => 
          exam.id === examId ? response.examen : exam
        );
        this.examsSubject.next(updatedExams);
        
        // Actualizar examen seleccionado si es el mismo
        if (this.selectedExamSubject.value?.id === examId) {
          this.selectedExamSubject.next(response.examen);
        }
        
        return response.examen;
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Eliminar un examen
   */
  deleteExam(examId: string): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete<{success: boolean, message: string}>(`${this.apiUrl}/examenes/${examId}`).pipe(
      map(() => {
        this.loadingSubject.next(false);
        
        // Remover de la lista local
        const currentExams = this.examsSubject.value;
        const filteredExams = currentExams.filter(exam => exam.id !== examId);
        this.examsSubject.next(filteredExams);
        
        // Limpiar examen seleccionado si es el mismo
        if (this.selectedExamSubject.value?.id === examId) {
          this.selectedExamSubject.next(null);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Obtener exámenes por estado
   */
  getExamsByStatus(estado: 'normal' | 'atencion' | 'critico' | 'pendiente'): Observable<Exam[]> {
    const filters: ExamFilters = { estado };
    return this.http.get<ExamListResponse>(`${this.apiUrl}/examenes`, { 
      params: new HttpParams().set('estado', estado) 
    }).pipe(
      map(response => response.examenes),
      catchError((error: HttpErrorResponse) => {
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Obtener exámenes críticos (alertas)
   */
  getCriticalExams(): Observable<Exam[]> {
    return this.getExamsByStatus('critico');
  }

  /**
   * Subir archivo de resultado
   */
  uploadExamFile(examId: string, file: File): Observable<{success: boolean, fileUrl: string}> {
    this.loadingSubject.next(true);
    
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{success: boolean, fileUrl: string}>(
      `${this.apiUrl}/examenes/${examId}/upload`, 
      formData
    ).pipe(
      map(response => {
        this.loadingSubject.next(false);
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: HttpErrorResponse): string {
    let errorMessage = 'Error desconocido en el servidor';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error de conectividad: ${error.error.message}`;
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor. Verifique su conexión.';
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Datos del examen inválidos';
          break;
        case 401:
          errorMessage = 'No autorizado para gestionar exámenes';
          break;
        case 403:
          errorMessage = 'No tiene permisos para esta acción';
          break;
        case 404:
          errorMessage = 'Examen no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }
    
    console.error('Exam Service Error:', error);
    return errorMessage;
  }

  /**
   * Limpiar estado del servicio
   */
  clearState(): void {
    this.examsSubject.next([]);
    this.selectedExamSubject.next(null);
    this.errorSubject.next(null);
    this.loadingSubject.next(false);
  }

  /**
   * Seleccionar un examen
   */
  selectExam(exam: Exam): void {
    this.selectedExamSubject.next(exam);
  }

  /**
   * Limpiar examen seleccionado
   */
  clearSelectedExam(): void {
    this.selectedExamSubject.next(null);
  }
}