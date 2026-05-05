import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Toast {
 message = signal('');
  cssClass = signal('');
  visible = signal(false);

  show(message: string, type: 'success' | 'error' = 'success') {
    this.message.set(message);
    this.cssClass.set(type === 'success' ? 'bg-success' : 'bg-danger');
    this.visible.set(true);
    setTimeout(() => this.visible.set(false), 3000);
  }
}
