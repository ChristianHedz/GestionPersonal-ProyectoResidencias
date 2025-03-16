import { Component } from '@angular/core';
import { ToolbarComponent } from "../../shared/toolbar/toolbar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info',
  imports: [ToolbarComponent,CommonModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css',
})
export class InfoComponent {
}
