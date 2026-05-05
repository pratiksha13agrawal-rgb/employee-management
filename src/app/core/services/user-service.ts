import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = "http://localhost:8080/api/users";
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<any[]>(this.apiUrl);
  }

  makeEmployee(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/make-employee`, {});
  }
}

