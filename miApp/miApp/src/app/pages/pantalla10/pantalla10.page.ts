import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonButton
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pantalla10',
  standalone: true,
  templateUrl: './pantalla10.page.html',
  styleUrls: ['./pantalla10.page.scss'],
  imports: [
    CommonModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonButton
  ],
})
export class Pantalla10Page {}
