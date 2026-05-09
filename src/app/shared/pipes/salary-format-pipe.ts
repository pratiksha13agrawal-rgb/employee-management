import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'salaryFormat',
})
export class SalaryFormatPipe implements PipeTransform {
  transform(value: number): string {
    if(value >= 100000) {
      return `₹${(value/100000).toFixed(1)}L`;
    }
    return `₹${(value/1000).toFixed(0)}K`;
  }
}
