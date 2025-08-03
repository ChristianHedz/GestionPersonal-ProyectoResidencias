import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeToolbarComponent } from './employee-toolbar.component';

describe('EmployeeToolbarComponent', () => {
  let component: EmployeeToolbarComponent;
  let fixture: ComponentFixture<EmployeeToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
