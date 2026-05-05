import { Component, Inject, inject, OnInit } from '@angular/core';
import { COMMON_IMPORTS } from '../../../shared/common.imports';
import { FORM_IMPORTS } from '../../../shared/form.imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee } from '../../../shared/models/employee';
import { noNumberValidator } from '../../../shared/validators/validators';
import { EmployeeService } from '../../../core/services/employeeService';

@Component({
  selector: 'app-employee-form',
  imports: [...COMMON_IMPORTS, ...FORM_IMPORTS],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.scss',
  standalone: true
})
export class EmployeeForm implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);

  // Detect if Add or Edit mode
  isEditMode = false;
  employeeId: number | null = null;

  employeeForm: FormGroup = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.minLength(3),
      noNumberValidator
    ]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    department: ['', Validators.required],
    salary: ['', [Validators.required, Validators.min(1000)]],
    role: ['user', Validators.required],
    joinDate: ['', Validators.required]
  });

  // Easy access to form fields
  get name() { return this.employeeForm.get('name'); }
  get email() { return this.employeeForm.get('email'); }
  get phone() { return this.employeeForm.get('phone'); }
  get department() { return this.employeeForm.get('department'); }
  get salary() { return this.employeeForm.get('salary'); }
  get role() { return this.employeeForm.get('role'); }
  get joinDate() { return this.employeeForm.get('joinDate'); }

  ngOnInit() {
    // Get id from URL — check edit mode
    this.employeeId = +this.route.snapshot.paramMap.get('id')!;
    if (this.employeeId) {
      this.isEditMode = true;
      this.loadEmployee(this.employeeId);
    }
  }

  loadEmployee(id: number) {
    // Find employee by ID
   const employee = this.employeeService.getById(id);
    if (employee) {
      this.employeeForm.patchValue(employee);
    }
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      if (this.isEditMode) {
       this.employeeService.update({ ...this.employeeForm.value, id: this.employeeId });
       } else {
         this.employeeService.add(this.employeeForm.value);
       }
      // Go back to employee list
      this.router.navigate(['/dashboard/admin']);
    } else {
      this.employeeForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/dashboard/admin']);
  }
}

