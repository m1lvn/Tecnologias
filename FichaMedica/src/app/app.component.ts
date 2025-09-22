import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterOutlet } from '@angular/router';

// 👇 Importar registro de íconos
import { addIcons } from 'ionicons';
import {
  addOutline, downloadOutline, peopleOutline, arrowBackOutline, optionsOutline,
  idCardOutline, calendarNumberOutline, locationOutline, bandageOutline,
  callOutline, timeOutline, saveOutline, pulseOutline, closeOutline,
  eyeOutline, searchOutline, documentTextOutline, heartOutline, thermometerOutline,
  bedOutline, alertCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule, RouterOutlet],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    // 👇 Registrar todos los íconos globales de la app
    addIcons({
      addOutline,
      downloadOutline,
      peopleOutline,
      arrowBackOutline,
      optionsOutline,
      idCardOutline,
      calendarNumberOutline,
      locationOutline,
      bandageOutline,
      callOutline,
      timeOutline,
      saveOutline,
      pulseOutline,
      closeOutline,
      eyeOutline,
      searchOutline,
      documentTextOutline,
      heartOutline,
      thermometerOutline,
      bedOutline,
      alertCircleOutline,
    });
  }
}
