import { Component, inject, OnInit, signal } from '@angular/core';
import { COMMON_IMPORTS } from '../../../shared/common.imports';
import { FORM_IMPORTS } from '../../../shared/form.imports';
import { EmployeeService } from '../../../core/services/employeeService';
import { Employee } from '../../../shared/models/employee';
import { ToastService } from '../../../core/services/toast';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-user-dashboard',
  imports: [...COMMON_IMPORTS, ...FORM_IMPORTS, Sidebar],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss',
  standalone: true
})
export class UserDashboard implements OnInit {

  private employeeService = inject(EmployeeService);
  private toastService = inject(ToastService);
  private authService = inject(Auth);

  activeTab = 'profile';  
  profile = signal<Employee | null>(null);
  isEditMode = false;

  userSidebarItems = [
    { label: 'Dashboard', icon: 'bi-speedometer2', tab: 'dashboard' },
    { label: 'My Profile', icon: 'bi-person-circle', tab: 'profile' }
  ];

  ngOnInit(): void {
    const email = localStorage.getItem('email');
    if(email) {
      this.employeeService.getByEmail(email).subscribe(emp => {
        this.profile.set(emp);
      });
    }
  }

  updateProfile() {    
    if(this.profile()) {
      this.employeeService.update(this.profile()!).subscribe({
        next: () => {
          this.toastService.show('Profile updated successfully!', 'success');
          this.activeTab = 'dashboard';
        },
        error: (err) => {
          const msg = err.error?.message || 'Update failed! Try again.';
          this.toastService.show(msg, 'error');
        }
      });
    } 
  }
  
  logout() {
    this.authService.logout();
  }
}
