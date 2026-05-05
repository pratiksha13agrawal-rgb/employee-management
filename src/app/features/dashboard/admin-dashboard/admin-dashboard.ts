import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { COMMON_IMPORTS } from '../../../shared/common.imports';
import { EmployeeService } from '../../../core/services/employeeService';
import { UserService } from '../../../core/services/user-service';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Auth } from '../../../core/services/auth';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  imports: [COMMON_IMPORTS, Sidebar],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
  standalone: true
})
export class AdminDashboard implements OnInit{
  private employeeService = inject(EmployeeService);
  private userService = inject(UserService);
  private authService = inject(Auth);
  employees = this.employeeService.getAll();
  activeTab = 'dashboard';
  adminName = localStorage.getItem('email') || 'Admin';
  empSearchQuery = signal('');
  showDeleteModal = signal(false);
  deleteTargetId = signal<number | null>(null);
  users = signal<any[]>([]);
  currentPage = signal(1);
  pageSize = 5;
  totalEmployees = 0;
  totalAdmins = 0;
  totalUsers = 0;
  searchSubject = new Subject<string>();

  onTabChange(tab: string) {
    this.activeTab = tab;
    if(tab === 'employees') {
      this.employeeService.loadAll();
    }
    if(tab === 'users') {
      this.loadUsers();
    }
  }

  ngOnInit(): void {
    this.employeeService.loadAll();
    this.loadUsers();

     // debounceTime setup
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
          ).subscribe(query => {
            this.empSearchQuery.set(query);
            this.currentPage.set(1);
          });
  }

  loadUsers() {
    this.userService.getAll().subscribe(data => this.users.set(data));
  }

  makeEmployee(id: number) {
    this.userService.makeEmployee(id).subscribe( () => {
      this.loadUsers();
      this.employeeService.loadAll();
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

  logout() {
    this.authService.logout();
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
}
