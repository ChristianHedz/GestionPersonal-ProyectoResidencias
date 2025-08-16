import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EmployeeEditDialogComponent } from './employee-edit-dialog.component';
import { EmployeesService } from '../../../../core/services/employees.service';
import { of } from 'rxjs';

describe('EmployeeEditDialogComponent', () => {
  let component: EmployeeEditDialogComponent;
  let fixture: ComponentFixture<EmployeeEditDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<EmployeeEditDialogComponent>>;
  let mockEmployeesService: jasmine.SpyObj<EmployeesService>;

  const mockEmployee = {
    id: 1,
    fullName: 'Test Employee',
    email: 'test@example.com',
    phone: '1234567890',
    photo: '',
    status: 'ACTIVO'
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockEmployeesService = jasmine.createSpyObj('EmployeesService', ['updateEmployee']);
    mockEmployeesService.updateEmployee.and.returnValue(of(mockEmployee));

    await TestBed.configureTestingModule({
      imports: [EmployeeEditDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { employee: mockEmployee } },
        { provide: EmployeesService, useValue: mockEmployeesService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with employee data', () => {
    expect(component.editForm.get('fullName')?.value).toBe(mockEmployee.fullName);
    expect(component.editForm.get('email')?.value).toBe(mockEmployee.email);
    expect(component.editForm.get('phone')?.value).toBe(mockEmployee.phone);
  });

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
