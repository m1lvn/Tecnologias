import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonItem, IonLabel, IonTextarea, IonInput, IonButton,
  IonList, IonModal, IonIcon, IonFooter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, pencil, save, close } from 'ionicons/icons';

type LegacyNote = { id: number; body: string; date: string };
type Note = { id: number; title: string; body: string; date: string };

@Component({
  selector: 'app-pantalla4',
  standalone: true,
  templateUrl: './pantalla4.page.html',
  styleUrls: ['./pantalla4.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonItem, IonLabel, IonTextarea, IonInput, IonButton,
    IonList, IonModal, IonIcon, IonFooter
  ],
})
export class Pantalla4Page implements OnInit {
  // formulario nueva nota
  title = '';
  body = '';

  // listado
  notas: Note[] = [];

  // modal
  modalOpen = false;
  editing = false;
  current: Note | null = null;
  draft: Note | null = null;

  constructor() {
    addIcons({ trash, pencil, save, close });
  }

  ngOnInit(): void { this.load(); }
  ionViewWillEnter(): void { this.load(); }

  // -------- persistencia --------
  private load() {
    try {
      const raw = localStorage.getItem('notas');
      const parsed = raw ? JSON.parse(raw) : [];
      this.notas = (parsed as (LegacyNote | Note)[]).map((n: any) => {
        if (typeof n.title === 'string') return n as Note;
        const t = (n.body || '').trim().replace(/\s+/g, ' ');
        const title = t ? (t.length > 40 ? t.slice(0, 40) + '…' : t) : '(Sin título)';
        return { id: n.id, title, body: n.body ?? '', date: n.date ?? new Date().toISOString() };
      });
    } catch { this.notas = []; }
  }
  private save() {
    localStorage.setItem('notas', JSON.stringify(this.notas));
  }

  // -------- crear --------
  addNote() {
    const t = (this.title || '').trim();
    const b = (this.body || '').trim();
    if (!t && !b) return;
    const note: Note = { id: Date.now(), title: t || '(Sin título)', body: b, date: new Date().toISOString() };
    this.notas.unshift(note);
    this.save();
    this.title = '';
    this.body = '';
  }

  // -------- eliminar (lista) --------
  deleteNote(id: number) {
    this.notas = this.notas.filter(n => n.id !== id);
    this.save();
    if (this.current?.id === id) this.closeModal();
  }

  deleteAll() {
    this.notas = [];
    this.save();
    this.closeModal();
  }

  // -------- modal --------
  openNote(n: Note) {
    this.current = n;
    this.draft = { ...n };
    this.editing = false;
    // si no tiene contenido, entra directo en edición (opcional)
    // this.editing = !(n.body && n.body.trim().length);
    setTimeout(() => this.modalOpen = true, 0);
  }

  startEdit() { if (this.draft) this.editing = true; }

  saveEdit() {
    if (!this.current || !this.draft) return;
    const idx = this.notas.findIndex(x => x.id === this.current!.id);
    if (idx >= 0) {
      this.notas[idx] = {
        ...this.notas[idx],
        title: (this.draft.title || '').trim() || '(Sin título)',
        body: (this.draft.body || '').trim()
      };
      this.save();
      this.current = this.notas[idx];
      this.draft = { ...this.current };
      this.editing = false;
    }
  }

  deleteCurrent() {
    if (!this.current) return;
    this.deleteNote(this.current.id);
  }

  closeModal() {
    this.modalOpen = false;
    this.editing = false;
    this.current = null;
    this.draft = null;
  }

  titlePreview(n: Note) { return (n.title || '(Sin título)').trim(); }
}
