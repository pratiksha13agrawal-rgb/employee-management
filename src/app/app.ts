import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Loading } from './core/services/loading';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class App {
  loadingService = inject(Loading);
  protected readonly title = signal('employee-management');
}
