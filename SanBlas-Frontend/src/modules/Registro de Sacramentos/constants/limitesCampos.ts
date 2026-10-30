// Límites de caracteres compartidos por la inscripción y la edición de actas.
// Se usan tanto en maxLength como en el contador visible de cada campo.
import { CEDULA_DIGITOS } from '../../../shared/utils/formValidation';

// Cédula nacional: 9 dígitos + 2 guiones del formato 0-0000-0000.
// (DIMEX ya no aplica: la máscara limita a 9 dígitos.)
export const MAX_CEDULA_NACIONAL = CEDULA_DIGITOS + 2;
export const MAX_NOMBRE_PERSONA = 30;
export const MAX_LUGAR_NACIMIENTO = 60;
export const MAX_LIBRO = 6;
export const MAX_OBSERVACIONES = 500;
