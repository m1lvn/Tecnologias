import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, throwError, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalPacientes: number;
  pacientesActivos: number;
  consultasHoy: number;
  examenesAtendidos: number;
  medicamentosActivos: number;
  alertasCriticas: number;
  boxesDisponibles: string;
  boxesOcupados: number;
}

export interface DashboardStatsCard {
  title: string;
  value: number | string;
  sub: string;
  icon: string;
}

export interface Alert {
  id: string;
  type: 'critico' | 'moderado' | 'info';
  title: string;
  message: string;
  patientId?: string;
  patientName?: string;
  timestamp: Date;
  read: boolean;
}

export interface DashboardResponse {
  success: boolean;
  stats: DashboardStatsCard[];
  resumen: DashboardStats;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;
  
  // Estado reactivo
  private statsSubject = new BehaviorSubject<DashboardStatsCard[]>([]);
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public stats$ = this.statsSubject.asObservable();
  public alerts$ = this.alertsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtener estadísticas del dashboard
   */
  getDashboardStats(): Observable<DashboardResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<DashboardResponse>(`${this.apiUrl}/stats`).pipe(
      map((response: DashboardResponse) => {
        this.loadingSubject.next(false);
        this.statsSubject.next(response.stats);
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
   * Obtener alertas activas
   */
  getDashboardAlerts(): Observable<Alert[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<{success: boolean, alerts: Alert[]}>(`${this.apiUrl}/alerts`).pipe(
      map((response: {success: boolean, alerts: Alert[]}) => {
        this.loadingSubject.next(false);
        this.alertsSubject.next(response.alerts);
        return response.alerts;
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
   * Refrescar datos del dashboard
   */
  refreshDashboard(): Observable<{stats: DashboardResponse, alerts: Alert[]}> {
    this.loadingSubject.next(true);
    
    return new Observable(observer => {
      Promise.all([
        this.getDashboardStats().toPromise(),
        this.getDashboardAlerts().toPromise()
      ]).then(([stats, alerts]) => {
        if (stats) {
          this.statsSubject.next(stats.stats);
        }
        if (alerts) {
          this.alertsSubject.next(alerts);
        }
        this.loadingSubject.next(false);
        observer.next({ stats: stats!, alerts: alerts! });
        observer.complete();
      }).catch(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next(error.message);
        observer.error(error);
      });
    });
  }

  /**
   * Marcar alerta como leída
   */
  markAlertAsRead(alertId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/alerts/${alertId}/read`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Obtener estadísticas específicas para gráficos
   */
  getChartData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/charts`).pipe(
      catchError((error: HttpErrorResponse) => {
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
      // Error del lado del cliente
      errorMessage = `Error de conectividad: ${error.error.message}`;
    } else if (error.status === 0) {
      // Error de conectividad
      errorMessage = 'No se puede conectar con el servidor. Verifique su conexión.';
    } else {
      // Error del servidor
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Solicitud inválida';
          break;
        case 401:
          errorMessage = 'No autorizado para acceder a esta información';
          break;
        case 403:
          errorMessage = 'No tiene permisos para realizar esta acción';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }
    
    console.error('Dashboard Service Error:', error);
    return errorMessage;
  }

  /**
   * Limpiar estado del servicio
   */
  clearState(): void {
    this.statsSubject.next([]);
    this.alertsSubject.next([]);
    this.errorSubject.next(null);
    this.loadingSubject.next(false);
  }
}