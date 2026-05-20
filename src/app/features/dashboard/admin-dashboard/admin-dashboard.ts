import { AfterViewInit, Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { COMMON_IMPORTS } from '../../../shared/common.imports';
import { EmployeeService } from '../../../core/services/employeeService';
import { UserService } from '../../../core/services/user-service';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Auth } from '../../../core/services/auth';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Employee } from '../../../shared/models/employee';
import { EmployeeImportDTO } from '../../../shared/models/employeeImportDTO ';
import { ToastService } from '../../../core/services/toast';
import { EmployeeForm } from '../../employees/employee-form/employee-form';
import { EmployeeList } from '../../employees/employee-list/employee-list';
import { User } from '../../../shared/models/user';

Chart.register(...registerables); 
@Component({
  selector: 'app-admin-dashboard',
  imports: [COMMON_IMPORTS, Sidebar, EmployeeForm, EmployeeList ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
  standalone: true
})
export class AdminDashboard implements OnInit, AfterViewInit {
 
  private employeeService = inject(EmployeeService);
  private userService = inject(UserService);
  private authService = inject(Auth);
  private toastService = inject(ToastService);

  users = signal<User[]>([]); 
  chartInstance: any;
  activeTab = 'dashboard';
  activeSubTab = 'view';
  employees = this.employeeService.getAll();  
  adminName = localStorage.getItem('email') || 'Admin';
  @ViewChild('deptChart') deptChart!: ElementRef;
  
  adminSidebarItems = [
    { label: 'Dashboard', icon: 'bi-speedometer2', tab: 'dashboard' },
    { label: 'Employees', icon: 'bi-people', tab: 'employees' },
    { label: 'Users', icon: 'bi-person-lines-fill', tab: 'users' }
  ];

  ngOnInit(): void {
    this.employeeService.loadAll();
    this.loadUsers();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if(this.activeTab === 'dashboard') {
        this.buildChart();
      }
    }, 1500);
  }

  onTabChange(tab: string) {  
    this.activeTab = tab;
    if(tab === 'employees') {
      this.employeeService.loadAll();
    }
    if(tab === 'users') {
      this.loadUsers();
    }
  }

  loadUsers() {
    this.userService.getAll().subscribe(data => {
      this.users.set(data);
    });
  }

  makeEmployee(id: number) {
    this.userService.makeEmployee(id).subscribe( (res) => {      
      this.loadUsers();
      this.employeeService.loadAll();
    });
  }

  logout() {
    this.authService.logout();
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
          borderRadius: 0,
          barThickness: 40,       // FIXED BAR WIDTH
          maxBarThickness: 50,    // Prevent extra wide bars 
          categoryPercentage: 0.6,
          barPercentage: 0.7
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
