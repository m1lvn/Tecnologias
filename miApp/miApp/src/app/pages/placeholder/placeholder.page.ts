import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  templateUrl: './placeholder.page.html',
  styleUrls: ['./placeholder.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton
  ],
})
export class PlaceholderPage {
  constructor(private router: Router) {}
  goHome() { this.router.navigateByUrl('/principal'); }
}
