import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonBadge, IonButton, 
  IonIcon, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonModal, 
  IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, create, ban, calendar, time, medical, person, warning, checkmarkCircle } from 'ionicons/icons';

export interface Medicamento {
  id: number;
  nombre: string;
  dosis: string;
  frecuencia: string;
  via: string;
  indicacion: string;
  medicoPrescriptor: string;
  fechaInicio: string;
  estado: 'Activo' | 'Suspendido' | 'Finalizado';
}

export interface InteraccionMedicamentosa {
  id: number;
  medicamentos: string[];
  tipo: 'menor' | 'moderada' | 'mayor';
  descripcion: string;
  recomendacion: string;
}

export interface IndicacionMedica {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: 'Dieta' | 'Seguimiento' | 'Reposo' | 'Ejercicio' | 'Control';
  estado: 'Vigente' | 'Completado' | 'Pendiente';
  fecha: string;
  fechaVencimiento?: string;
}

export interface HistorialMedicamento {
  id: number;
  nombre: string;
  dosis: string;
  frecuencia: string;
  periodo: string;
  medicoPrescriptor: string;
  estado: 'Suspendido' | 'Completado';
  motivo: string;
}

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonBadge, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonItem, IonLabel, 
    IonModal, IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime
  ],
})
export class Tab4Page {

  medicamentosActuales: Medicamento[] = [
    {
      id: 1,
      nombre: 'Metformina',
      dosis: '850 mg',
      frecuencia: '2 veces al día',
      via: 'Oral',
      indicacion: 'Control de diabetes mellitus tipo 2',
      medicoPrescriptor: 'Dr. José Fernández',
      fechaInicio: '2024-01-10',
      estado: 'Activo'
    },
    {
      id: 2,
      nombre: 'Enalapril',
      dosis: '10 mg',
      frecuencia: '1 vez al día',
      via: 'Oral',
      indicacion: 'Control de hipertensión arterial',
      medicoPrescriptor: 'Dr. Luis Martínez',
      fechaInicio: '2023-12-15',
      estado: 'Activo'
    },
    {
      id: 3,
      nombre: 'Atorvastatina',
      dosis: '20 mg',
      frecuencia: '1 vez al día (noche)',
      via: 'Oral',
      indicacion: 'Control de colesterol elevado',
      medicoPrescriptor: 'Dra. Carmen Silva',
      fechaInicio: '2024-01-12',
      estado: 'Activo'
    }
  ];

  // Alertas de Interacciones
  alertasInteracciones: InteraccionMedicamentosa[] = [
    {
      id: 1,
      medicamentos: ['Metformina', 'Enalapril'],
      tipo: 'menor',
      descripcion: 'Interacción menor. Monitorear función renal.',
      recomendacion: 'Controlar creatinina sérica regularmente'
    }
  ];

  // Indicaciones Médicas
  indicacionesMedicas: IndicacionMedica[] = [
    {
      id: 1,
      titulo: 'Dieta hipocalórica',
      descripcion: '1500 kcal/día. Restricción de carbohidratos simples.',
      tipo: 'Dieta',
      estado: 'Vigente',
      fecha: '2024-01-15'
    },
    {
      id: 2,
      titulo: 'Control cardiológico',
      descripcion: 'Control cardiológico en 3 meses. Traer electrocardiograma de control.',
      tipo: 'Seguimiento',
      estado: 'Vigente',
      fecha: '2024-01-20'
    },
    {
      id: 3,
      titulo: 'Reposo relativo',
      descripcion: 'Reposo relativo. Evitar esfuerzos físicos intensos por 2 semanas.',
      tipo: 'Reposo',
      estado: 'Vigente',
      fecha: '2024-01-18'
    }
  ];

  // Historial de Medicación
  historialMedicacion: HistorialMedicamento[] = [
    {
      id: 1,
      nombre: 'Losartán',
      dosis: '50 mg',
      frecuencia: '1 vez al día',
      periodo: '2023-10-01 - 2023-12-14',
      medicoPrescriptor: 'Dr. Luis Martínez',
      estado: 'Suspendido',
      motivo: 'Reemplazado por Enalapril por mejor tolerancia'
    },
    {
      id: 2,
      nombre: 'Paracetamol',
      dosis: '500 mg',
      frecuencia: 'Cada 8 horas',
      periodo: '2024-01-05 - 2024-01-10',
      medicoPrescriptor: 'Dra. Carmen Silva',
      estado: 'Completado',
      motivo: 'Manejo de dolor post-procedimiento'
    }
  ];

  // Variables para el modal de nuevo medicamento
  isModalOpen = false;
  isModalIndicacionOpen = false;
  nuevoMedicamento: Medicamento = {
    id: 0,
    nombre: '',
    dosis: '',
    frecuencia: '',
    via: 'Oral',
    indicacion: '',
    medicoPrescriptor: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    estado: 'Activo'
  };

  nuevaIndicacion: IndicacionMedica = {
    id: 0,
    titulo: '',
    descripcion: '',
    tipo: 'Dieta',
    estado: 'Vigente',
    fecha: new Date().toISOString().split('T')[0]
  };

  constructor(private router: Router) {
    addIcons({ add, create, ban, calendar, time, medical, person, warning, checkmarkCircle });
  }

  abrirModalNuevoMedicamento() {
    this.nuevoMedicamento = {
      id: 0,
      nombre: '',
      dosis: '',
      frecuencia: '',
      via: 'Oral',
      indicacion: '',
      medicoPrescriptor: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      estado: 'Activo'
    };
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
  }

  agregarMedicamento() {
    if (this.nuevoMedicamento.nombre && this.nuevoMedicamento.dosis && 
        this.nuevoMedicamento.frecuencia && this.nuevoMedicamento.indicacion) {
      
      const nuevoId = Math.max(...this.medicamentosActuales.map(m => m.id)) + 1;
      this.nuevoMedicamento.id = nuevoId;
      
      this.medicamentosActuales.push({ ...this.nuevoMedicamento });
      this.cerrarModal();
    }
  }

  modificarMedicamento(medicamento: Medicamento) {
    // Aquí se implementaría la lógica para modificar
    console.log('Modificar medicamento:', medicamento);
  }

  suspenderMedicamento(medicamento: Medicamento) {
    medicamento.estado = 'Suspendido';
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Activo':
      case 'Vigente':
        return 'success';
      case 'Suspendido':
        return 'danger';
      case 'Finalizado':
      case 'Completado':
        return 'medium';
      case 'Pendiente':
        return 'warning';
      default:
        return 'medium';
    }
  }

  getTipoInteraccionColor(tipo: string): string {
    switch (tipo) {
      case 'menor':
        return 'warning';
      case 'moderada':
        return 'warning';
      case 'mayor':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getTipoIndicacionColor(tipo: string): string {
    switch (tipo) {
      case 'Dieta':
        return 'success';
      case 'Seguimiento':
        return 'primary';
      case 'Reposo':
        return 'warning';
      case 'Ejercicio':
        return 'secondary';
      case 'Control':
        return 'tertiary';
      default:
        return 'medium';
    }
  }

  // Modal de nueva indicación
  abrirModalNuevaIndicacion() {
    this.nuevaIndicacion = {
      id: 0,
      titulo: '',
      descripcion: '',
      tipo: 'Dieta',
      estado: 'Vigente',
      fecha: new Date().toISOString().split('T')[0]
    };
    this.isModalIndicacionOpen = true;
  }

  cerrarModalIndicacion() {
    this.isModalIndicacionOpen = false;
  }

  agregarIndicacion() {
    if (this.nuevaIndicacion.titulo && this.nuevaIndicacion.descripcion) {
      const nuevoId = Math.max(...this.indicacionesMedicas.map(i => i.id)) + 1;
      this.nuevaIndicacion.id = nuevoId;
      
      this.indicacionesMedicas.push({ ...this.nuevaIndicacion });
      this.cerrarModalIndicacion();
    }
  }

  completarIndicacion(indicacion: IndicacionMedica) {
    indicacion.estado = 'Completado';
  }

  volverAFicha() {
    this.router.navigate(['/tabs/tab3']);
  }
}
