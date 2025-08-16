export interface EmployeeDTO {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    photo: string;
    status: string;
    password?: string; // Campo opcional para editar contraseña
}