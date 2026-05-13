import { Component, inject, OnInit, signal } from '@angular/core';
import { COMMON_IMPORTS } from '../../../shared/common.imports';
import { FORM_IMPORTS } from '../../../shared/form.imports';
import { EmployeeService } from '../../../core/services/employeeService';
import { Employee } from '../../../shared/models/employee';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-user-dashboard',
  imports: [...COMMON_IMPORTS, ...FORM_IMPORTS],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss',
  standalone: true
})
export class UserDashboard implements OnInit {
  private employeeService = inject(EmployeeService);
  private toastService = inject(ToastService);
  
  profile = signal<Employee | null>(null);
  isEditMode = false;
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
       this.employeeService.update(this.profile()!);
       this.isEditMode = false;
       this.toastService.show('Profile updated!', 'success');
    }
   
  }
}
