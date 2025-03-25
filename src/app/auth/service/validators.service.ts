import { Injectable } from '@angular/core';
import { FormControl, ValidationErrors, FormGroup, AbstractControl } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ValidatorsService {

  public firstNameAndLastnamePattern: string = '^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+([ ][a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)+$';
  public emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  public phonePattern: string = '^[0-9]{10}$';

  public isValidField( form: FormGroup, field: string ) {
    return form.controls[field].errors && form.controls[field].touched;
  }

  getFieldError(form: FormGroup, field: string): string | null {
    const control = form.get(field);
    
    if (!control || !control.errors || !control.touched) return null;
    
    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['pattern']) {
      if (field === 'email') return 'Ingresa un correo electrónico válido';
      return 'El formato ingresado no es válido';
    }
    return 'Campo inválido';
  }


  public isFieldOneEqualFieldTwo( field1: string, field2: string ) {

    return ( formGroup: AbstractControl ): ValidationErrors | null => {

      const fieldValue1 = formGroup.get(field1)?.value;
      const fieldValue2 = formGroup.get(field2)?.value;

      if ( fieldValue1 !== fieldValue2 ) {
        formGroup.get(field2)?.setErrors({ notEqual: true });
        return { notEqual: true }
      }

      formGroup.get(field2)?.setErrors(null);
      return null;
    }

  }


}