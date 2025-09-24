import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonBadge, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel,
  IonTextarea, IonTabs, IonTabButton
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Modelos de datos para la ficha médica
interface DatosPersonales {
  nombre: string;
  rut: string;
  edad: number;
  tipoSanguineo: string;
  direccion: string;
  contacto: string;
  emergencia: string;
}

interface AlertaMedica {
  tipo: 'alergia' | 'condicion';
  descripcion: string;
  criticidad: 'alta' | 'media' | 'baja';
}

interface SignosVitales {
  presionArterial: string;
  frecuenciaCardiaca: number;
  temperatura: number;
  peso: number;
}

interface ConsultaMedica {
  fecha: string;
  hora: string;
  medico: string;
  especialidad: string;
  motivo: string;
  observaciones: string;
  signosVitales: SignosVitales;
}

interface ExamenMedico {
  nombre: string;
  fecha: string;
  resultado: string;
  estado: 'normal' | 'atencion' | 'critico';
  valorReferencia?: string;
}

interface FichaMedica {
  datosPersonales: DatosPersonales;
  alertasMedicas: AlertaMedica[];
  evoluciones: ConsultaMedica[];
  examenes: ExamenMedico[];
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonBadge, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel,
    IonTextarea, IonTabs, IonTabButton, CommonModule, FormsModule
  ],
})
export class Tab3Page implements OnInit {
  
  // Variable para las notas rápidas
  nuevaNota: string = '';
  
  ficha: FichaMedica = {
    datosPersonales: {
      nombre: 'Ignacia Castilo',
      rut: '12.345.678-9',
      edad: 45,
      tipoSanguineo: 'O+',
      direccion: 'Av. Providencia 1234, Santiago',
      contacto: '+56 9 8765 4321',
      emergencia: 'Pedro González - +56 9 1111 2222'
    },
    alertasMedicas: [
      { tipo: 'alergia', descripcion: 'Penicilina', criticidad: 'alta' },
      { tipo: 'alergia', descripcion: 'Mariscos', criticidad: 'media' },
      { tipo: 'condicion', descripcion: 'Hipertensión arterial', criticidad: 'alta' },
      { tipo: 'condicion', descripcion: 'Diabetes tipo 2', criticidad: 'alta' }
    ],
    examenes: [
      {
        nombre: 'Hemograma completo',
        fecha: '2024-01-20',
        resultado: 'Valores normales',
        estado: 'normal'
      },
      {
        nombre: 'Hemoglobina glicosilada',
        fecha: '2024-01-15',
        resultado: '6.8% (Normal <7%)',
        estado: 'normal'
      },
      {
        nombre: 'Perfil lipídico',
        fecha: '2024-01-10',
        resultado: 'Colesterol elevado: 245 mg/dL',
        estado: 'atencion'
      }
    ],
    evoluciones: [
      {
        fecha: '2024-01-21',
        hora: '14:30',
        medico: 'Dr. Luis Martínez',
        especialidad: 'Cardiología',
        motivo: 'Control rutinario',
        observaciones: 'Paciente acude por control rutinario. Presión arterial controlada con medicación actual. Se mantiene tratamiento.',
        signosVitales: {
          presionArterial: '125/80 mmHg',
          frecuenciaCardiaca: 72,
          temperatura: 36.5,
          peso: 68
        }
      },
      {
        fecha: '2024-01-15',
        hora: '10:15',
        medico: 'Dra. Carmen Silva',
        especialidad: 'Medicina Interna',
        motivo: 'Evaluación diabetes',
        observaciones: 'Evaluación de diabetes. Hemoglobina glicosilada en rangos normales. Paciente adherente al tratamiento.',
        signosVitales: {
          presionArterial: '130/85 mmHg',
          frecuenciaCardiaca: 75,
          temperatura: 36.7,
          peso: 69
        }
      },
      {
        fecha: '2024-01-08',
        hora: '16:45',
        medico: 'Dr. José Fernández',
        especialidad: 'Endocrinología',
        motivo: 'Control diabetológico',
        observaciones: 'Control diabetológico trimestral. Ajuste de dosis de metformina. Cita de control en 3 meses.',
        signosVitales: {
          presionArterial: '128/82 mmHg',
          frecuenciaCardiaca: 74,
          temperatura: 36.6,
          peso: 69
        }
      }
    ]
  };

  constructor(private router: Router) {}

  ngOnInit() {}

  goBack() {
    this.router.navigateByUrl('/tabs/tab2');
  }

  getBadgeColor(criticidad: string): string {
    switch(criticidad) {
      case 'alta': return 'danger';
      case 'media': return 'warning';
      case 'baja': return 'medium';
      default: return 'medium';
    }
  }

  getExamenBadgeColor(estado: string): string {
    switch(estado) {
      case 'normal': return 'success';
      case 'atencion': return 'warning';
      case 'critico': return 'danger';
      default: return 'medium';
    }
  }

  getExamenBadgeText(estado: string): string {
    switch(estado) {
      case 'normal': return 'Normal';
      case 'atencion': return 'Atención';
      case 'critico': return 'Crítico';
      default: return 'Pendiente';
    }
  }

  getAlertIcon(tipo: string): string {
    return tipo === 'alergia' ? 'warning' : 'medical';
  }

  formatDate(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatDateShort(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES');
  }

  agregarNota() {
    if (this.nuevaNota.trim()) {
      // En una aplicación real, aquí guardarías la nota en el backend
      console.log('Nueva nota agregada:', this.nuevaNota);
      
      // Limpiar el campo de texto
      this.nuevaNota = '';
      
      // Mostrar confirmación (opcional)
      // En una implementación real podrías usar un toast o alert
    }
  }

  verMedicacion() {
    this.router.navigate(['/tabs/tab4']);
  }
}
