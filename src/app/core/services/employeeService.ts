import { inject, Injectable, signal } from '@angular/core';
import { Employee } from '../../shared/models/employee';
import { HttpClient } from '@angular/common/http';
import { EmployeeImportDTO } from '../../shared/models/employeeImportDTO ';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;
  private http = inject(HttpClient);
  private employees = signal<Employee[]>([]);
  
  loadAll() {
    this.http.get<Employee[]> (this.apiUrl).subscribe( data => {
      this.employees.set(data);
    });
  }

  getAll() {
    return this.employees.asReadonly();
  }

  getById(id: number) {
    return this.employees().find(e => e.id == id);
  }

  add(emp: Employee) {
    this.http.post<Employee>(this.apiUrl, emp).subscribe( () => this.loadAll());
  }

  update(emp : Employee) {
    this.http.put<Employee>(`${this.apiUrl}/${emp.id}`, emp).subscribe(() => this.loadAll());
  }
  
  delete(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => this.loadAll());
  }

  getByEmail(email: string) {
    return this.http.get<Employee>(`${this.apiUrl}/by-email/${email}`);
  }

  bulkAdd(employees: EmployeeImportDTO[]) {
    return this.http.post<Employee[]>(`${this.apiUrl}/bulk`, employees);
  }
}
