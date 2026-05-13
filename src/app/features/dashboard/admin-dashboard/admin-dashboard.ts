import { AfterViewInit, Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { COMMON_IMPORTS } from '../../../shared/common.imports';
import { EmployeeService } from '../../../core/services/employeeService';
import { UserService } from '../../../core/services/user-service';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Auth } from '../../../core/services/auth';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { SalaryFormatPipe } from '../../../shared/pipes/salary-format-pipe';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Employee } from '../../../shared/models/employee';
import { EmployeeImportDTO } from '../../../shared/models/employeeImportDTO ';
import { ToastService } from '../../../core/services/toast';

Chart.register(...registerables); 
@Component({
  selector: 'app-admin-dashboard',
  imports: [COMMON_IMPORTS, Sidebar, SalaryFormatPipe ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
  standalone: true
})
export class AdminDashboard implements OnInit, AfterViewInit {
  private employeeService = inject(EmployeeService);
  private userService = inject(UserService);
  private authService = inject(Auth);
  private toastService = inject(ToastService);
  employees = this.employeeService.getAll();
  activeTab = 'dashboard';
  adminName = localStorage.getItem('email') || 'Admin';
  empSearchQuery = signal('');
  showDeleteModal = signal(false);
  deleteTargetId = signal<number | null>(null);
  users = signal<any[]>([]);
  currentPage = signal(1);
  pageSize = 5;
  totalEmployees = 0;
  totalAdmins = 0;
  totalUsers = 0;
  searchSubject = new Subject<string>();
  chartInstance: any;
  @ViewChild('deptChart') deptChart!: ElementRef;

  onTabChange(tab: string) {
    this.activeTab = tab;
    if(tab === 'employees') {
      this.employeeService.loadAll();
    }
    if(tab === 'users') {
      this.loadUsers();
    }
  }

  ngOnInit(): void {
    this.employeeService.loadAll();
    this.loadUsers();

     // debounceTime setup
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
          ).subscribe(query => {
            this.empSearchQuery.set(query);
            this.currentPage.set(1);
       });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if(this.activeTab === 'dashboard') {
        this.buildChart();
      }
    }, 1500);
  }

  loadUsers() {
    this.userService.getAll().subscribe(data => this.users.set(data));
  }

  makeEmployee(id: number) {
    this.userService.makeEmployee(id).subscribe( () => {
      this.loadUsers();
      this.employeeService.loadAll();
    });
  }

  changeRole(id: number, event: Event) {
    const role = (event.target as HTMLSelectElement).value;
    const emp = this.employees() .find(e => e.id == id);
    if(emp) {
      this.employeeService.update({...emp, role });
      setTimeout(() => this.employeeService.loadAll(), 500);
    }
  }

  logout() {
    this.authService.logout();
  }

  filteredEmployees = computed(() => {
    const query = this.empSearchQuery().toLowerCase();
    if(!query) return this.employees();
    return this.employees().filter(e =>
      e.name.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query) ||
      e.department.toLowerCase().includes(query)
    );
  });

  confirmDelete(id: number) {
    this.deleteTargetId.set(id);
    this.showDeleteModal.set(true);
  }

  onDeleteConfirmed() {
    const id = this.deleteTargetId();
    if(id) this.employeeService.delete(id);
    this.showDeleteModal.set(false);
    this.deleteTargetId.set(null);
  }

  onDeleteCancelled() {
    this.showDeleteModal.set(false);
    this.deleteTargetId.set(null);
  }

  paginatedEmployees = computed(() => {
    const start = (this.currentPage()-1)*this.pageSize;
    return this.filteredEmployees().slice(start, start+this.pageSize);
  });
  totalPages = computed(() => Math.ceil(this.filteredEmployees().length/ this.pageSize));

  getVisiblePages() {
    const current = this.currentPage();
    const total = this.totalPages();
    const start = Math.max(1, current - 1);
    const end = Math.min(total, start + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  buildChart() {
  const employees = this.employees();
  const departments = [...new Set(employees.map(e => e.department))];
  const counts = departments.map(d => 
    employees.filter(e => e.department === d).length
  );

  if(this.chartInstance) this.chartInstance.destroy();

  this.chartInstance = new Chart(this.deptChart.nativeElement, {
    type: 'bar',
    data: {
      labels: departments,
      datasets: [{
        label: 'Employees per Department',
        data: counts,
        backgroundColor: ['#0d6efd', '#198754', '#0dcaf0', '#ffc107', '#dc3545'],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 3
    } 
  });
 
}

  exportToExcel() {
    const data = this.employees().map(emp => ({
      ID: emp.id,
      Name: emp.name,
      Email: emp.email,
      Department: emp.department,
      Phone: emp.phone,
      Salary: emp.salary,
      Role: emp.role,
      JoinDate: emp.joinDate
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, 'employees.xlsx');
  }

  exportToPDF() {
    const doc = new jsPDF();
    
    doc.text('Employee List', 14, 10);
    
    autoTable(doc, {
      head: [['ID', 'Name', 'Email', 'Department', 'Phone', 'Salary', 'Role']],
      body: this.employees().map(emp => [
        emp.id, emp.name, emp.email, 
        emp.department, emp.phone, emp.salary, emp.role
      ])
    });
    
    doc.save('employees.pdf');
  }

   importFromExcel(event: any) {
    const file = event.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      try{
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const data: Employee[] = XLSX.utils.sheet_to_json(sheet);
          if(data.length == 0) {
            this.toastService.show("Excel file is empty.Please fill data in excel file", 'warning');
            return;          
          }     
            
          const employees:EmployeeImportDTO[] = (data as any[]).map(row => ({          
            name: row['name'],          
            email: row['email'],          
            phone: row['phone'],          
            department: row['department'],          
            salary: row['salary'],          
            role: row['role'],          
            joinDate: row['joinDate']          
          }));

          this.employeeService.bulkAdd(employees).subscribe({          
            next: (result: any) => {   
              this.toastService.show(`Saved: ${result.saved}, Skipped: ${result.skipped}`, result.skipped > 0 ? 'warning' : 'success');             
              this.employeeService.loadAll();            
            },          
            error: (err) => {                      
             if(err.status == 400) {
              const message = err.error?.message || 'Validation failed! Check required fields.';
              this.toastService.show(`❌ ${message}`, 'error');
            } else {
              this.toastService.show('❌ Import failed! Please close the Excel file and try again.', 'error');
            }            
            }          
          })        
      }catch(err) {
        this.toastService.show('❌ Error reading file! Make sure Excel file is closed.', 'error');
      }
    };

    reader.onerror = () =>  {
      this.toastService.show('❌ File read failed! Please close the Excel file and try again.', 'error');
    }
   reader.readAsArrayBuffer(file);
  
    // Reset Input  — again same file can import
    event.target.value = '';
  }

  toggleActive(id: number) {
    this.userService.toggleActive(id).subscribe(() => {
      this.loadUsers();
    });
  }
}
