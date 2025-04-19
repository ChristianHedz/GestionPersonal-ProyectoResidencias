/**
 * Configuración centralizada de endpoints de la API
 * Todos los endpoints deben definirse aquí para mantener consistencia
 */

export const API_ENDPOINTS = {
  // Endpoints de autenticación
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VALIDATE_TOKEN: '/auth/validate-token',
    REFRESH_TOKEN: '/auth/refresh-token'
  },
  
  // Endpoints de empleados
  EMPLOYEES: {
    LIST_ALL: '/employees',
    GET_BY_ID: '/employees', // + employeeId
    CREATE: '/employees',
    UPDATE: '/employees', // + employeeId
    DELETE: '/employees', // + employeeId
    UPLOAD_AVATAR: '/employees/avatar', // + employeeId
  },
  
  // Endpoints de asistencia de empleados
  ATTENDANCE: {
    GET_ALL: '/assist-details',
  }
};