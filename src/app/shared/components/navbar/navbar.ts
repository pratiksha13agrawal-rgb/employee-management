import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { COMMON_IMPORTS } from '../../common.imports';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  imports: [...COMMON_IMPORTS],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  standalone: true
})
export class Navbar {
  private router = inject(Router);
  private authService = inject(Auth);

  isLoggedIn = !!localStorage.getItem('isLoggedIn');
   
  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
  }

}
