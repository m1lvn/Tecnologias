import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonButton, IonInput, IonDatetime,
  IonDatetimeButton, IonModal, IonIcon, IonBadge, IonNote,
  IonCheckbox, IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  alarmOutline, alarm, addOutline, trashOutline, 
  timeOutline, notificationsOutline, checkmarkCircle 
} from 'ionicons/icons';

type Recordatorio = {
  id: number;
  titulo: string;
  fechaHora: string; // ISO string
  completado: boolean;
  activo: boolean;
  createdAt: string;
};

const LS_KEY = 'app-recordatorios';
const APP_LS_EVENT = 'app-ls-updated';

@Component({
  selector: 'app-pantalla9',
  standalone: true,
  templateUrl: './pantalla9.page.html',
  styleUrls: ['./pantalla9.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonLabel, IonButton, IonInput, IonDatetime,
    IonDatetimeButton, IonModal, IonIcon, IonBadge, IonNote,
    IonCheckbox, IonToast
  ],
})
export class Pantalla9Page implements OnInit, OnDestroy {

  constructor() {
    addIcons({ 
      alarmOutline, alarm, addOutline, trashOutline, 
      timeOutline, notificationsOutline, checkmarkCircle 
    });
  }

  recordatorios: Recordatorio[] = [];
  
  // Para crear nuevo recordatorio
  nuevoTitulo = '';
  nuevaFechaHora: string | undefined;
  showToast = false;
  toastMessage = '';

  // Recordatorios filtrados
  recordatoriosHoy: Recordatorio[] = [];
  recordatoriosProximos: Recordatorio[] = [];
  recordatoriosPendientes: Recordatorio[] = [];

  // Fecha mínima para el datetime picker
  fechaMinima = new Date().toISOString();

  ngOnInit() {
    this.cargarDatos();
    this.organizarRecordatorios();
    
    // Escuchar cambios en localStorage
    window.addEventListener('storage', this.onStorageChange);
    window.addEventListener(APP_LS_EVENT, this.onAppLsEvent);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.onStorageChange);
    window.removeEventListener(APP_LS_EVENT, this.onAppLsEvent);
  }

  private onStorageChange = () => {
    this.cargarDatos();
    this.organizarRecordatorios();
  };

  private onAppLsEvent = () => {
    this.cargarDatos();
    this.organizarRecordatorios();
  };

  cargarDatos() {
    const data = localStorage.getItem(LS_KEY);
    this.recordatorios = data ? JSON.parse(data) : [];
  }

  guardarDatos() {
    localStorage.setItem(LS_KEY, JSON.stringify(this.recordatorios));
    window.dispatchEvent(new CustomEvent(APP_LS_EVENT));
  }

  organizarRecordatorios() {
    const ahora = new Date();
    const hoyInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const hoyFin = new Date(hoyInicio);
    hoyFin.setDate(hoyFin.getDate() + 1);

    this.recordatoriosHoy = this.recordatorios.filter(r => {
      const fecha = new Date(r.fechaHora);
      return fecha >= hoyInicio && fecha < hoyFin && r.activo && !r.completado;
    }).sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());

    this.recordatoriosProximos = this.recordatorios.filter(r => {
      const fecha = new Date(r.fechaHora);
      return fecha >= hoyFin && r.activo && !r.completado;
    }).sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());

    this.recordatoriosPendientes = this.recordatorios.filter(r => {
      const fecha = new Date(r.fechaHora);
      return fecha < ahora && r.activo && !r.completado;
    }).sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
  }

  agregarRecordatorio() {
    if (!this.nuevoTitulo.trim() || !this.nuevaFechaHora) {
      this.mostrarToast('Por favor completa título y fecha/hora');
      return;
    }

    const nuevoId = Date.now();
    const nuevo: Recordatorio = {
      id: nuevoId,
      titulo: this.nuevoTitulo.trim(),
      fechaHora: this.nuevaFechaHora,
      completado: false,
      activo: true,
      createdAt: new Date().toISOString()
    };

    this.recordatorios.push(nuevo);
    this.guardarDatos();
    this.organizarRecordatorios();

    // Limpiar formulario
    this.nuevoTitulo = '';
    this.nuevaFechaHora = undefined;

    this.mostrarToast('¡Recordatorio agregado!');
  }

  completarRecordatorio(recordatorio: Recordatorio) {
    recordatorio.completado = true;
    this.guardarDatos();
    this.organizarRecordatorios();
    this.mostrarToast('Recordatorio marcado como completado');
  }

  eliminarRecordatorio(recordatorio: Recordatorio) {
    const index = this.recordatorios.findIndex(r => r.id === recordatorio.id);
    if (index > -1) {
      this.recordatorios.splice(index, 1);
      this.guardarDatos();
      this.organizarRecordatorios();
      this.mostrarToast('Recordatorio eliminado');
    }
  }

  toggleActivo(recordatorio: Recordatorio) {
    recordatorio.activo = !recordatorio.activo;
    this.guardarDatos();
    this.organizarRecordatorios();
    const estado = recordatorio.activo ? 'activado' : 'desactivado';
    this.mostrarToast(`Recordatorio ${estado}`);
  }

  onFechaHoraChange(event: any) {
    this.nuevaFechaHora = event.detail.value;
  }

  estaProximoAVencer(recordatorio: Recordatorio): boolean {
    const ahora = new Date();
    const fechaRecordatorio = new Date(recordatorio.fechaHora);
    const diferencia = fechaRecordatorio.getTime() - ahora.getTime();
    const minutosHasta = diferencia / (1000 * 60);
    
    // Está próximo si faltan menos de 30 minutos y es futuro
    return minutosHasta > 0 && minutosHasta <= 30;
  }

  estaVencido(recordatorio: Recordatorio): boolean {
    const ahora = new Date();
    const fechaRecordatorio = new Date(recordatorio.fechaHora);
    return fechaRecordatorio < ahora;
  }

  formatearFechaHora(fechaHora: string): string {
    const fecha = new Date(fechaHora);
    const hoy = new Date();
    const esHoy = fecha.toDateString() === hoy.toDateString();
    
    if (esHoy) {
      return `Hoy ${fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return fecha.toLocaleString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }

  private mostrarToast(mensaje: string) {
    this.toastMessage = mensaje;
    this.showToast = true;
  }

  cargarDatosDemo() {
    const ahora = new Date();
    const demos: Recordatorio[] = [
      {
        id: Date.now() + 1,
        titulo: 'Tomar agua',
        fechaHora: new Date(ahora.getTime() + 15 * 60000).toISOString(), // En 15 min
        completado: false,
        activo: true,
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 2,
        titulo: 'Reunión equipo',
        fechaHora: new Date(ahora.getTime() + 2 * 3600000).toISOString(), // En 2 horas
        completado: false,
        activo: true,
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 3,
        titulo: 'Llamar al doctor',
        fechaHora: new Date(ahora.getTime() + 24 * 3600000).toISOString(), // Mañana
        completado: false,
        activo: true,
        createdAt: new Date().toISOString()
      }
    ];

    this.recordatorios = [...this.recordatorios, ...demos];
    this.guardarDatos();
    this.organizarRecordatorios();
    this.mostrarToast('Datos demo cargados');
  }

  limpiarTodos() {
    this.recordatorios = [];
    this.guardarDatos();
    this.organizarRecordatorios();
    this.mostrarToast('Todos los recordatorios eliminados');
  }
}
