import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

// Los componentes compartidos son standalone y se importan directamente

// Importar pipes - Los pipes son standalone, no se declaran aquí
// import { AverageHoursPipe, MaxHoursPipe, MinHoursPipe } from './pipes/hours-stats.pipe';

@NgModule({
  declarations: [
    // Todos los componentes son standalone, no se declaran aquí
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatDialogModule,
    MatCardModule
  ],
  exports: [
    // Los componentes standalone se importan directamente donde se necesiten
    // Exportar módulos de Angular Material
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatDialogModule,
    MatCardModule
  ]
})
export class SharedModule { }