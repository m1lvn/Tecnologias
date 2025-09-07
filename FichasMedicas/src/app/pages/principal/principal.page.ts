import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { NgFor } from '@angular/common';
import {
  IonHeader, IonToolbar, IonButtons, IonTitle, IonContent,
  IonButton, IonIcon, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonSearchbar, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shareOutline, cloudDownloadOutline, searchOutline } from 'ionicons/icons';

declare const Chart:any;

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [
    NgFor,
    IonHeader, IonToolbar, IonButtons, IonTitle, IonContent,
    IonButton, IonIcon, IonGrid, IonRow, IonCol,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonSearchbar, IonBadge
  ],
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss']
})
export class PrincipalPage implements AfterViewInit {
  constructor(){ addIcons({shareOutline, cloudDownloadOutline, searchOutline}); }

  // Resumen de alertas (columna derecha)
  resumen = [
    { color: '#e5242a', titulo: 'Hipertensión', sub: 'Hospital del Sur' },
    { color: '#f0b000', titulo: 'Alergia a penicilina', sub: 'Clínica Norte' },
    { color: '#0070ff', titulo: 'ECG anormal', sub: 'Hospital Central' },
  ];

  // Encuentros (listado inferior)
  encuentros = [
    { icon: 'med', titulo: 'Consulta de medicina interna', lugar: 'Hospital Central', fecha: '15 Mar 2024' },
    { icon: 'urg', titulo: 'Atención de urgencia', lugar: 'Clínica Norte', fecha: '10 Mar 2024' },
    { icon: 'card', titulo: 'Consulta de cardiología', lugar: 'Mar de Sur', fecha: '5 Mar 2024' },
  ];

  @ViewChild('vitales') vitalsCanvas!:ElementRef<HTMLCanvasElement>;
  ngAfterViewInit(){
    new Chart(this.vitalsCanvas.nativeElement,{
      type:'line',
      data:{
        labels:['Mar.','12','abr.','24 abr','50'],
        datasets:[{
          label:'FC',
          data:[130,135,125,140,145],
          borderColor:'#184C7A',
          pointRadius:4, tension:.35
        }]
      },
      options:{
        responsive:true,
        plugins:{ legend:{display:false} },
        scales:{
          x:{ grid:{display:false} },
          y:{ min:80, max:150, ticks:{ stepSize:25 } }
        }
      }
    });
  }
}
