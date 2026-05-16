import { Component, computed, inject, Input, signal } from '@angular/core';
import { COMMON_IMPORTS } from '../../../shared/common.imports';
import { EmployeeService } from '../../../core/services/employeeService';
import { SalaryFormatPipe } from '../../../shared/pipes/salary-format-pipe';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { EmployeeForm } from '../employee-form/employee-form';

@Component({
  selector: 'app-employee-list',
  imports: [...COMMON_IMPORTS, SalaryFormatPipe, EmployeeForm],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss',
  standalone: true
})
export class EmployeeList {
  private employeeService = inject(EmployeeService);
  employees = this.employeeService.getAll();
  currentPage = signal(1);
  searchSubject = new Subject<string>();
  empSearchQuery = signal('');
  selectedEmployeeId = signal<number | null>(null);
  pageSize = 5;
  deleteTargetId = signal<number | null>(null);
  showDeleteModal = signal(false);
  @Input() activeSubTab = '';

  ngOnInit(): void {
    // debounceTime setup
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
        ).subscribe(query => {
          this.empSearchQuery.set(query);
          this.currentPage.set(1);
     });
   }

  changeRole(id: number, event: Event) {
    const role = (event.target as HTMLSelectElement).value;
    const emp = this.employees() .find(e => e.id == id);
    if(emp) {
      this.employeeService.update({...emp, role });
      setTimeout(() => this.employeeService.loadAll(), 500);
    }
  }

  paginatedEmployees = computed(() => {
    const start = (this.currentPage()-1)*this.pageSize;
    return this.filteredEmployees().slice(start, start+this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.filteredEmployees().length/ this.pageSize));
  
  getVisiblePages() {
    const current = this.currentPage();
    const total = this.totalPages();
    const start = Math.max(1, current - 1);
    const end = Math.min(total, start + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  filteredEmployees = computed(() => {
    const query = this.empSearchQuery().toLowerCase();
    if(!query) return this.employees();
    return this.employees().filter(e =>
      e.name.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query) ||
      e.department.toLowerCase().includes(query)
    );
  });

  editEmployee(id: number) {
    this.selectedEmployeeId.set(id);
    this.activeSubTab = 'edit';
  }

  confirmDelete(id: number) {
    this.deleteTargetId.set(id);
    this.showDeleteModal.set(true);
  }

  onDeleteConfirmed() {
    const id = this.deleteTargetId();
    if(id) this.employeeService.delete(id);
    this.showDeleteModal.set(false);
    this.deleteTargetId.set(null);
  }

  onDeleteCancelled() {
    this.showDeleteModal.set(false);
    this.deleteTargetId.set(null);
  }
}
