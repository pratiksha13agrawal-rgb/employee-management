import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Loading } from './core/services/loading';
import { COMMON_IMPORTS } from './shared/common.imports';
import { ToastService } from './core/services/toast';


@Component({
  selector: 'app-root',
  imports: [...COMMON_IMPORTS,RouterOutlet],
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
