import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab6',
  templateUrl: './tab6.page.html',
  styleUrls: ['./tab6.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon]
})
export class Tab6Page {
  constructor(private router: Router) {}

  goToTab1() {
    this.router.navigateByUrl('/tabs/tab1');
  }
}
