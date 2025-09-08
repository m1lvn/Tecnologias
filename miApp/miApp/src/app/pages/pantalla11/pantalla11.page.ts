import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonButton
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pantalla11',
  standalone: true,
  templateUrl: './pantalla11.page.html',
  styleUrls: ['./pantalla11.page.scss'],
  imports: [
    CommonModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonButton
  ],
})
export class Pantalla11Page {}
