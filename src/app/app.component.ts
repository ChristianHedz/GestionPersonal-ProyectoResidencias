import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AnimatedBackgroundComponent } from './shared/animated-background/animated-background.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule,AnimatedBackgroundComponent],  // Removed AnimatedBackgroundComponent
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'gestionpersonal-frontend';
}