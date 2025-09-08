import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonButton
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pantalla6',
  standalone: true,
  templateUrl: './pantalla6.page.html',
  styleUrls: ['./pantalla6.page.scss'],
  imports: [
    CommonModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonButton
  ],
})
export class Pantalla6Page {}
