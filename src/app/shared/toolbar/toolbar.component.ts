import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/service/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatMenuModule, MatButtonModule, RouterModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    //preguntar si esta seguro de cerrar sesion
    Swal.fire({
      title: "Estas seguro de Cerrar sesion?",
      text: "Se cerrara la sesion actual",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout().subscribe({
          next: () => {
            this.router.navigateByUrl('/login');
            Swal.fire({
              title: "Sesion cerrada",
              text: "Sesion cerrada correctamente",
              icon: "success"
            });
          }
        }) 
      }
    });
  }      
}
