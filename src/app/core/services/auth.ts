import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth { 
  private apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);
  private router = inject(Router);

  login(email: string, password: string) {    
    return this.http.post<{token: string, role: string}>(`${this.apiUrl}/login`, {email, password});
  }

  register(user: any) {    
    return this.http.post(`${this.apiUrl}/register`, user, { responseType: 'text'});
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['auth/login']);
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  getRole() {
    return localStorage.getItem('role');
  }
}
