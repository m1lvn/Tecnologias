import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Ionic standalone
import {
  IonApp, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet
} from '@ionic/angular/standalone';

// Angular router directives para activar item seleccionado
import { RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    CommonModule, RouterLinkActive,
    // Ionic
    IonApp, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet
  ],
})
export class AppComponent {

  constructor(private router: Router) {}

  appPages = [
    { title: 'Principal',  url: '/principal',  icon: 'home-outline' },
    { title: 'Pantalla 1', url: '/pantalla1',  icon: 'checkbox-outline' },
    { title: 'Pantalla 2', url: '/pantalla2',  icon: 'add-circle-outline' },
    { title: 'Pantalla 3', url: '/pantalla3',  icon: 'checkmark-done-outline' },
    { title: 'Pantalla 4', url: '/pantalla4',  icon: 'document-text-outline' },
    { title: 'Pantalla 5', url: '/pantalla5',  icon: 'create-outline' },
    { title: 'Pantalla 6', url: '/pantalla6',  icon: 'images-outline' },
    { title: 'Pantalla 7', url: '/pantalla7',  icon: 'medkit-outline' },
    { title: 'Pantalla 8', url: '/pantalla8',  icon: 'shield-checkmark-outline' },
    { title: 'Pantalla 9', url: '/pantalla9',  icon: 'calendar-outline' },
    { title: 'Pantalla 10', url: '/pantalla10', icon: 'people-outline' },
    { title: 'Pantalla 11', url: '/pantalla11', icon: 'stats-chart-outline' },
    { title: 'Pantalla 12', url: '/pantalla12', icon: 'settings-outline' },
  ];

  // Navegación programática (sin refresh)
  go(url: string) {
    this.router.navigateByUrl(url, { replaceUrl: false });
  }
}
