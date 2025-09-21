import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Role = 'doctor' | 'patient';

interface Post {
  id: string;
  authorName: string;
  authorRole: Role;
  text: string;
  createdAt: Date;
  likes: number;
  liked?: boolean;
  comments: CommentItem[];
}

interface CommentItem {
  id: string;
  authorName: string;
  text: string;
  createdAt: Date;
}

@Component({
  selector: 'app-tab2',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})
export class Tab2Page {
  // Composer
  postText = '';

  // Feed (demo en memoria)
  posts: Post[] = [
    {
      id: 'p1',
      authorName: 'Dra. Valentina Ríos',
      authorRole: 'doctor',
      text: 'Alta ambulatoria. Control en 7 días.',
      createdAt: new Date(Date.now() - 3600_000),
      likes: 3,
      comments: [
        { id: 'c1', authorName: 'Enf. Camila', text: '¡Excelente!', createdAt: new Date() },
      ],
    },
    {
      id: 'p2',
      authorName: 'Juan Pérez',
      authorRole: 'patient',
      text: 'Hoy completé todas mis tomas de medicamento 💊',
      createdAt: new Date(Date.now() - 5 * 3600_000),
      likes: 1,
      comments: [],
    },
  ];

  // Modal simple (sin componente aparte)
  showCommentsFor: Post | null = null;
  newCommentText = '';

  publish() {
    const text = this.postText.trim();
    if (!text) return;

    const post: Post = {
      id: crypto.randomUUID(),
      authorName: 'Tú',
      authorRole: 'doctor',
      text,
      createdAt: new Date(),
      likes: 0,
      comments: [],
    };
    this.posts.unshift(post);
    this.postText = '';
  }

  toggleLike(p: Post) {
    p.liked = !p.liked;
    p.likes += p.liked ? 1 : -1;
  }

  openComments(p: Post) {
    this.showCommentsFor = p;
    this.newCommentText = '';
  }

  closeComments() {
    this.showCommentsFor = null;
    this.newCommentText = '';
  }

  addComment() {
    if (!this.showCommentsFor) return;
    const txt = this.newCommentText.trim();
    if (!txt) return;
    this.showCommentsFor.comments.push({
      id: crypto.randomUUID(),
      authorName: 'Tú',
      text: txt,
      createdAt: new Date(),
    });
    this.newCommentText = '';
  }

  trackByPost = (_: number, p: Post) => p.id;
  trackByComment = (_: number, c: CommentItem) => c.id;
}
