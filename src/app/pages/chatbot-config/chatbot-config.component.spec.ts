import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotConfigComponent } from './chatbot-config.component';

describe('ChatbotConfigComponent', () => {
  let component: ChatbotConfigComponent;
  let fixture: ComponentFixture<ChatbotConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
