import { Component, EventEmitter, Input, Output } from '@angular/core';
import { COMMON_IMPORTS } from '../../common.imports';

@Component({
  selector: 'app-sidebar',
  imports: [...COMMON_IMPORTS],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  standalone: true
})
export class Sidebar {
  @Input() activeTab = 'dashboard';
  @Output() tabChange = new EventEmitter<string>();

  setTab(tab: string) {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }
}
