import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonButton, IonBadge } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonButton, IonBadge, CommonModule]
})
export class Tab5Page {
  constructor(private router: Router) {}

  volverFicha() {
    this.router.navigate(['/tabs/tab3']);
  }
  examenes = [
    {
      nombre: 'Hemograma completo',
      fecha: '2024-01-20',
      resultado: 'Valores normales',
      estado: 'normal',
      detalle: 'Todos los valores dentro de rango.'
    },
    {
      nombre: 'Hemoglobina glicosilada',
      fecha: '2024-01-15',
      resultado: '6.8% (Normal <7%)',
      estado: 'normal',
      detalle: 'Control adecuado de glicemia.'
    },
    {
      nombre: 'Perfil lipídico',
      fecha: '2024-01-10',
      resultado: 'Colesterol elevado: 245 mg/dL',
      estado: 'atencion',
      detalle: 'Colesterol total elevado, requiere seguimiento.'
    }
  ];

  getBadgeColor(estado: string): string {
    switch(estado) {
      case 'normal': return 'success';
      case 'atencion': return 'warning';
      case 'critico': return 'danger';
      default: return 'medium';
    }
  }

  getBadgeText(estado: string): string {
    switch(estado) {
      case 'normal': return 'Normal';
      case 'atencion': return 'Atención';
      case 'critico': return 'Crítico';
      default: return 'Pendiente';
    }
  }
}
