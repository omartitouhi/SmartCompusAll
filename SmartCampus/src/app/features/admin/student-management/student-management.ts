import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface StudentActionCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-student-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-management.html',
  styleUrl: './student-management.scss',
})
export class StudentManagement {
  actionCards: StudentActionCard[] = [
    {
      title: 'Créer un Étudiant',
      description: 'Ajouter un nouvel étudiant au système',
      icon: '👤➕',
      route: '/admin/students/create',
      color: '#4CAF50'
    },
    {
      title: 'Rechercher un Étudiant',
      description: 'Rechercher, modifier ou supprimer un étudiant',
      icon: '🔍',
      route: '/admin/students/search',
      color: '#2196F3'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
