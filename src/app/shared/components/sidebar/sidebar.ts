import { Component, EventEmitter, Input, Output } from '@angular/core';
import { COMMON_IMPORTS } from '../../common.imports';

export interface SidebarItem {
  label: string;
  icon: string;
  tab: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [...COMMON_IMPORTS],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  standalone: true
})
export class Sidebar {
   @Input() items: SidebarItem[] = [];
   @Input() activeTab = '';
   @Input() userName = '';
   @Input() userRole = '';
   @Output() tabChange = new EventEmitter<string>();
   @Output() onLogout = new EventEmitter<void>();
 
   setTab(tab: string) {
     this.activeTab = tab;
     this.tabChange.emit(tab);
   }

  
}
