import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<any[]>(this.apiUrl);
  }

  makeEmployee(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/make-employee`, {});
  }
}

