import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { COMMON_IMPORTS } from '../../../shared/common.imports';
import { FORM_IMPORTS } from '../../../shared/form.imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { noNumberValidator } from '../../../shared/validators/validators';
import { EmployeeService } from '../../../core/services/employeeService';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-employee-form',
  imports: [...COMMON_IMPORTS, ...FORM_IMPORTS],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.scss',
  standalone: true
})
export class EmployeeForm {
  
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);
  private toastService = inject(ToastService);

  // Detect if Add or Edit mode
  isEditMode = false;
  employeeId: number | null = null;

  @Input() set editId(id: number | null) {
  if(id) {
      this.isEditMode = true;
      this.employeeId = id;
      this.loadEmployee(id);
    }
  }

  @Output() formSubmitted = new EventEmitter<void>();

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
         this.toastService.show('Employee updated!', 'success');
       } else {
         this.employeeService.add(this.employeeForm.value);
         this.toastService.show('Employee saved!', 'success');
       }
       this.formSubmitted.emit();
      // Go back to employee list
    } else {
      this.employeeForm.markAllAsTouched();
      this.toastService.show('Please fill all required fields!', 'error');
    }
  }

  onCancel() {
    this.formSubmitted.emit();
  }
}

