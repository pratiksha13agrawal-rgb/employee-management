// This interface used for Import excel file
export interface EmployeeImportDTO {
  id?: number;  // optional
  name: string;
  email: string; 
  department: string;
  salary: number;
  phone: string;
  role: string;
  joinDate: string;
}