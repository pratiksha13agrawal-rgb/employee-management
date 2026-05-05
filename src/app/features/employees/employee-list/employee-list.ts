import { Component, computed, inject, signal } from '@angular/core';
import { Employee } from '../../../shared/models/employee';
import { COMMON_IMPORTS } from '../../../shared/common.imports';
import { EmployeeService } from '../../../core/services/employeeService';

@Component({
  selector: 'app-employee-list',
  imports: [...COMMON_IMPORTS],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss',
  standalone: true
})
export class EmployeeList {
  private employeeService = inject(EmployeeService);
  employees = this.employeeService.getAll(); // reactive signal!
  selectedEmployee = signal<Employee | null>(null);
  showDeleteModal = signal(false);
  deleteTargetId = signal<number | null>(null);
  role = localStorage.getItem('role');
  searchQuery = signal('');

  ngOnInit() {
    this.employeeService.loadAll();
  }

  deleteEmployee(id: number) {
    this.employeeService.delete(id);
  }

  confirmDelete(id: number) {
    this.deleteTargetId.set(id);
    this.showDeleteModal.set(true); 
  }

  onDeleteConfirmed() {
    const id = this.deleteTargetId();
    if (id) this.deleteEmployee(id);
    this.showDeleteModal.set(false);
    this.deleteTargetId.set(null);
  }
  
  onDeleteCancelled() {
    this.showDeleteModal.set(false);
    this.deleteTargetId.set(null);
  }

  onEdit(emp: Employee) {
    this.selectedEmployee.set(emp);
  }

  onAdd(emp: Employee) {
    this.employeeService.add(emp);
  }

  onUpdate(emp: Employee) {
    this.employeeService.update(emp);
    this.selectedEmployee.set(null);
  }

  filteredEmployees = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if(!query) return this.employees();
    return this.employees().filter(e =>
      e.name.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query) ||
      e.department.toLowerCase().includes(query)
    );
  });
}
