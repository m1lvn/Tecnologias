import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTabs,
  IonRouterOutlet,
  IonIcon,
} from '@ionic/angular/standalone';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  // ⬇️ IMPORTA AQUÍ TODOS LOS WEB COMPONENTS/DIRECTIVAS QUE USAS EN EL HTML
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonTabs,
    IonRouterOutlet,
    IonIcon,
    RouterLink,
    RouterLinkActive,
    NgIf,
  ],
})
export class TabsPage {}
