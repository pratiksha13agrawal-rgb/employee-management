import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Loading } from './core/services/loading';
import { Navbar } from './shared/components/navbar/navbar';
import { COMMON_IMPORTS } from './shared/common.imports';
import { ToastService } from './core/services/toast';


@Component({
  selector: 'app-root',
  imports: [...COMMON_IMPORTS,RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class App {
  loadingService = inject(Loading);
  router = inject(Router);
  protected readonly title = signal('employee-management');
  toastService = inject(ToastService);
}
