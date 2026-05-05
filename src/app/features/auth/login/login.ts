import { Component, inject } from '@angular/core';
import { COMMON_IMPORTS } from '../../../shared/common.imports';
import { FORM_IMPORTS } from '../../../shared/form.imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { Toast } from '../../../core/services/toast';

@Component({
  selector: 'app-login',
  imports: [...COMMON_IMPORTS, ...FORM_IMPORTS],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true
})
export class Login {

  private fb = inject(FormBuilder);
  private router = inject(Router); 
  private authService = inject(Auth);
  toastService = inject(Toast);
  
  loginForm = this.fb.group(
    {
      email: ['', [ Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    }
  );
 
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
    if (this.loginForm.valid) {
        this.authService.login(this.loginForm.value.email!, this.loginForm.value.password!)
          .subscribe({
            next: (res) => {
              localStorage.setItem('token', res.token);
              localStorage.setItem('role', res.role);
              localStorage.setItem('email', this.loginForm.value.email!);
              localStorage.setItem('isLoggedIn', 'true');
              this.toastService.show('Login successful!', 'success');
              if(res.role == 'admin') {
                this.router.navigate(['/dashboard/admin']);
              }else {
                this.router.navigate(['/dashboard/user']);
              }              
            },
            error: () => {
              this.toastService.show('Invalid credentials!', 'error');
            }
          });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
