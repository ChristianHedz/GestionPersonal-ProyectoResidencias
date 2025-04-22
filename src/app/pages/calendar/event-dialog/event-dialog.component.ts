import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { EventType } from '../../../interfaces/event.interfaces';
import { EmployeeDTO } from '../../../auth/interfaces/EmployeeDTO';

@Component({
  selector: 'app-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.css']
})
export class EventDialogComponent implements OnInit {
  eventForm!: FormGroup;
  dialogTitle = signal('Create Event');
  submitButtonText = signal('Create');
  
  // Event type options
  eventTypes = Object.values(EventType);
  
  // Predefined color options
  colorOptions = [
    { name: 'Blue', value: '#2196f3' },
    { name: 'Green', value: '#4caf50' },
    { name: 'Red', value: '#f44336' },
    { name: 'Orange', value: '#ff9800' },
    { name: 'Purple', value: '#9c27b0' },
    { name: 'Teal', value: '#009688' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      mode: 'create' | 'edit';
      event?: any;
      start?: string;
      end?: string;
      allDay?: boolean;
      employees: EmployeeDTO[];
    }
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    if (this.data.mode === 'edit') {
      this.dialogTitle.set('Edit Event');
      this.submitButtonText.set('Update');
      this.populateForm();
    }
  }

  initializeForm(): void {
    let startDate = this.data.start ? new Date(this.data.start) : new Date();
    let endDate = this.data.end ? new Date(this.data.end) : new Date(startDate.getTime() + 60 * 60 * 1000);
    
    this.eventForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      startDate: [startDate, [Validators.required]],
      endDate: [endDate, [Validators.required]],
      allDay: [this.data.allDay || false],
      eventType: [EventType.MEETING, [Validators.required]],
      color: ['#2196f3', [Validators.required]],
      participantIds: [[]]
    });

    // When allDay changes, adjust the time of the dates
    this.eventForm.get('allDay')?.valueChanges.subscribe(isAllDay => {
      if (isAllDay) {
        const startDate = this.eventForm.get('startDate')?.value;
        const endDate = this.eventForm.get('endDate')?.value;
        
        if (startDate) {
          const newStartDate = new Date(startDate);
          newStartDate.setHours(0, 0, 0, 0);
          this.eventForm.get('startDate')?.setValue(newStartDate);
        }
        
        if (endDate) {
          const newEndDate = new Date(endDate);
          newEndDate.setHours(23, 59, 59, 999);
          this.eventForm.get('endDate')?.setValue(newEndDate);
        }
      }
    });
  }

  populateForm(): void {
    if (!this.data.event) return;
    
    const event = this.data.event;
    const participantIds = event.participants?.map((p: EmployeeDTO) => p.id) || [];
    
    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      allDay: event.allDay,
      eventType: event.eventType,
      color: event.color,
      participantIds
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      return;
    }
    
    const formValue = this.eventForm.value;
    
    // Format dates as ISO strings
    const startDate = formValue.startDate instanceof Date 
      ? formValue.startDate.toISOString()
      : new Date(formValue.startDate).toISOString();
      
    const endDate = formValue.endDate instanceof Date
      ? formValue.endDate.toISOString()
      : new Date(formValue.endDate).toISOString();
    
    const eventData = {
      ...formValue,
      startDate,
      endDate
    };
    
    this.dialogRef.close(eventData);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.dialogRef.close('delete');
    }
  }

  /**
   * Validates that end date is after start date
   */
  validateDateRange(): boolean {
    const startDate = this.eventForm.get('startDate')?.value;
    const endDate = this.eventForm.get('endDate')?.value;
    
    if (startDate && endDate) {
      return new Date(startDate) < new Date(endDate);
    }
    
    return true;
  }

  /**
   * Gets employee name by ID
   */
  getEmployeeName(id: number): string {
    const employee = this.data.employees.find(e => e.id === id);
    return employee?.fullName || 'Unknown';
  }
  
  /**
   * Removes a participant from the selection
   * @param id Employee ID to remove
   */
  removeParticipant(id: number): void {
    const currentIds = this.eventForm.get('participantIds')?.value || [];
    const updatedIds = currentIds.filter((participantId: number) => participantId !== id);
    this.eventForm.patchValue({ participantIds: updatedIds });
  }
}
