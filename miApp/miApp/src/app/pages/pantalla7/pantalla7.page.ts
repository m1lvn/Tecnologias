import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonDatetime, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonInput, IonButton
} from '@ionic/angular/standalone';

type EventsMap = Record<string, string[]>; // yyyy-mm-dd -> eventos

@Component({
  selector: 'app-pantalla7',
  standalone: true,
  templateUrl: './pantalla7.page.html',
  styleUrls: ['./pantalla7.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonDatetime, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonButton
  ]
})
export class Pantalla7Page implements OnInit, AfterViewInit {
  @ViewChild(IonDatetime) datetime?: IonDatetime;

  selectedDateISO: string | null = null;
  newEvent = '';

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // dar tiempo a que pinte el shadowRoot
    setTimeout(() => {
      this.decorateDots();
      this.attachLightClickListener();
    }, 0);
  }

  // --------- Getters de UI ----------
  get selectedKey(): string | null {
    return this.selectedDateISO ? this.keyFromISO(this.selectedDateISO) : null;
  }

  get prettyDate(): string {
    if (!this.selectedDateISO) return '';
    const d = new Date(this.selectedDateISO);
    return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  get dayEvents(): string[] {
    if (!this.selectedKey) return [];
    const map = this.readEvents();
    return map[this.selectedKey] ?? [];
  }

  canAddEvent(): boolean {
    return !!this.selectedKey && !!this.newEvent.trim() && this.dayEvents.length < 3;
  }

  // --------- Acciones ----------
  onDateChange(ev: CustomEvent) {
    const value = (ev.detail as any)?.value as string;
    this.selectedDateISO = value || null;
    // Redibujar puntos por si el usuario cambió de mes/día
    setTimeout(() => this.decorateDots(), 0);
  }

  addEvent() {
    if (!this.canAddEvent() || !this.selectedKey) return;
    const map = this.readEvents();
    const arr = map[this.selectedKey] ?? [];
    arr.push(this.newEvent.trim());
    map[this.selectedKey] = arr;
    this.writeEvents(map);
    this.newEvent = '';
    this.decorateDots(); // refrescar puntos
  }

  removeEvent(i: number) {
    if (!this.selectedKey) return;
    const map = this.readEvents();
    const arr = map[this.selectedKey] ?? [];
    arr.splice(i, 1);
    if (arr.length) map[this.selectedKey] = arr; else delete map[this.selectedKey];
    this.writeEvents(map);
    this.decorateDots(); // refrescar puntos
  }

  // --------- Dots (sin observer, sin loops) ----------
  private decorateDots() {
    const shadow = this.getShadow();
    if (!shadow) return;

    const events = this.readEvents();
    const host = shadow.querySelector('[part="calendar-body"]') || shadow;
    const days = host.querySelectorAll<HTMLButtonElement>('button[part="calendar-day"]');

    days.forEach(btn => {
      // limpiar
      btn.removeAttribute('data-dots');

      // número del día
      const num = Number(btn.textContent?.trim() || NaN);
      if (Number.isNaN(num)) return;

      // intentar parsear a fecha con aria-label (estilo "Monday, September 9, 2025")
      const label = btn.getAttribute('aria-label') || '';
      const d = new Date(label);
      if (isNaN(d.getTime())) return;

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(num).padStart(2, '0');
      const key = `${y}-${m}-${dd}`;

      const cnt = Math.min(3, (events[key]?.length || 0));
      if (cnt > 0) btn.setAttribute('data-dots', String(cnt));
    });
  }

  /** Un único listener “ligero” (con debounce) en el shadowRoot:
   *  cuando el usuario toque flechas de mes u otros controles del calendario,
   *  decoramos de nuevo los puntos. Sin observer, sin bucles. */
  private attachLightClickListener() {
    const shadow = this.getShadow();
    if (!shadow) return;

    let t: any;
    shadow.addEventListener('click', () => {
      clearTimeout(t);
      t = setTimeout(() => this.decorateDots(), 60); // debounce corto
    }, { capture: true });
  }

  private getShadow(): ShadowRoot | null {
    const el = (this.datetime as any)?.el || (this.datetime as any);
    return el?.shadowRoot ?? null;
    // Si devuelve null, IonDatetime aún no montó: por eso siempre llamamos
    // a decorateDots() dentro de setTimeout/ionChange.
  }

  // --------- storage helpers ----------
  private keyFromISO(iso: string) { return new Date(iso).toISOString().slice(0, 10); }
  private readEvents(): Record<string, string[]> {
    try { return JSON.parse(localStorage.getItem('calendarEvents') || '{}'); }
    catch { return {}; }
  }
  private writeEvents(map: Record<string, string[]>) {
    localStorage.setItem('calendarEvents', JSON.stringify(map));
  }
}
