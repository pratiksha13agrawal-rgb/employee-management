import { Component, inject } from '@angular/core';
import { COMMON_IMPORTS } from '../../../shared/common.imports';
import { FORM_IMPORTS } from '../../../shared/form.imports';
import { FormBuilder, Validators } from '@angular/forms';
import { noNumberValidator, passwordMatchValidator } from '../../../shared/validators/validators';
import { Auth } from '../../../core/services/auth';
import { Router } from '@angular/router';
import { Toast } from '../../../core/services/toast';

@Component({
  selector: 'app-register',
  imports: [...COMMON_IMPORTS, ...FORM_IMPORTS],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  standalone: true
})
export class Register {
  private authService = inject(Auth);
  private router = inject(Router);
  private fb= inject(FormBuilder);
  toastService = inject(Toast);

  registerForm = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(3), noNumberValidator]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },{ validators: passwordMatchValidator }
  );

  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  onSubmit() {
    if (this.registerForm.valid) {
    const { confirmPassword, ...userData } = this.registerForm.value;
		this.authService.register(userData).subscribe({
		  next: () => {
			this.toastService.show('Registered successfully!', 'success');
			this.router.navigate(['/auth/login']);
		  },
		  error: () => {
			this.toastService.show('Registration failed!', 'error');
		  }
		});
	  } else {
		this.registerForm.markAllAsTouched();
	  }
  }
}
