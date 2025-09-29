import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonIcon, IonAvatar, IonButton, IonSpinner, IonToast
} from '@ionic/angular/standalone';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { DashboardService, DashboardStatsCard, Alert } from '../services/dashboard.service';
import { ExamService } from '../services/exam.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [
    IonContent, IonGrid, IonRow, IonCol,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonIcon, IonAvatar, IonButton, IonSpinner, IonToast,
    NgFor, NgClass, NgIf
  ],
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {
  // Estados del componente
  stats: DashboardStatsCard[] = [];
  alertas: Alert[] = [];
  isLoading = false;
  error: string | null = null;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private examService: ExamService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Configurar suscripciones reactivas
   */
  private setupSubscriptions() {
    // Suscribirse a los estados del servicio
    this.subscriptions.push(
      this.dashboardService.loading$.subscribe(loading => {
        this.isLoading = loading;
      }),
      
      this.dashboardService.error$.subscribe(error => {
        this.error = error;
      }),
      
      this.dashboardService.stats$.subscribe(stats => {
        this.stats = stats;
      }),
      
      this.dashboardService.alerts$.subscribe(alerts => {
        this.alertas = alerts;
      })
    );
  }

  /**
   * Cargar datos del dashboard desde el backend
   */
  loadDashboardData() {
    this.isLoading = true;
    this.error = null;

    // Cargar estadísticas del dashboard
    this.subscriptions.push(
      this.dashboardService.getDashboardStats().subscribe({
        next: (response) => {
          this.stats = response.stats;
          console.log('Dashboard stats loaded:', response);
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
          this.error = 'Error al cargar las estadísticas del dashboard';
          this.isLoading = false;
        }
      })
    );

    // Cargar alertas del dashboard
    this.subscriptions.push(
      this.dashboardService.getDashboardAlerts().subscribe({
        next: (alerts) => {
          this.alertas = alerts;
          console.log('Dashboard alerts loaded:', alerts);
        },
        error: (error) => {
          console.error('Error loading dashboard alerts:', error);
        }
      })
    );
  }

  /**
   * Refrescar datos del dashboard
   */
  refreshDashboard() {
    this.subscriptions.push(
      this.dashboardService.refreshDashboard().subscribe({
        next: (data) => {
          console.log('Dashboard refreshed:', data);
        },
        error: (error) => {
          console.error('Error refreshing dashboard:', error);
          this.error = 'Error al actualizar el dashboard';
        }
      })
    );
  }

  /**
   * Navegar a la gestión de pacientes
   */
  goToPatients() {
    this.router.navigateByUrl('/tabs/tab2');
  }

  /**
   * Ver exámenes de un paciente específico
   */
  verExamenesPaciente(pacienteId: string) {
    this.router.navigate(['/tabs/tab5'], { 
      queryParams: { patientId: pacienteId } 
    });
  }

  /**
   * Ver ficha médica de un paciente
   */
  verFichaPaciente(pacienteId: string) {
    this.router.navigate(['/tabs/tab3'], { 
      queryParams: { patientId: pacienteId } 
    });
  }

  /**
   * Manejar click en una alerta
   */
  onAlertClick(alerta: Alert) {
    if (alerta.patientId) {
      this.verFichaPaciente(alerta.patientId);
    }
    
    // Marcar alerta como leída
    if (!alerta.read) {
      this.subscriptions.push(
        this.dashboardService.markAlertAsRead(alerta.id).subscribe({
          next: () => {
            // Actualizar el estado local
            alerta.read = true;
          },
          error: (error) => {
            console.error('Error marking alert as read:', error);
          }
        })
      );
    }
  }

  /**
   * Obtener color para las alertas según tipo
   */
  getAlertColor(tipo: string): string {
    switch (tipo) {
      case 'critico': return 'danger';
      case 'moderado': return 'warning';
      case 'info': return 'primary';
      default: return 'medium';
    }
  }

  /**
   * Obtener icono para las alertas según tipo
   */
  getAlertIcon(tipo: string): string {
    switch (tipo) {
      case 'critico': return 'warning';
      case 'moderado': return 'alert-circle';
      case 'info': return 'information-circle';
      default: return 'notifications';
    }
  }

  /**
   * Obtener alertas de exámenes críticos
   */
  getAlertasExamenes() {
    return this.alertas.filter(alerta => 
      alerta.type === 'critico' || alerta.type === 'moderado'
    );
  }

  /**
   * Limpiar error
   */
  clearError() {
    this.error = null;
  }
}
