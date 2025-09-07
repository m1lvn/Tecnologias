import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-imagenologia',
  templateUrl: './imagenologia.page.html',
  styleUrls: ['./imagenologia.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ImagenologiaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
