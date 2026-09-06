export const NOMBRE_MIN = 2;
export const NOMBRE_MAX = 30;
export const CEDULA_DIGITOS = 9;

// ---- Filtros de entrada (aplicar en onChange) ----

// Solo letras (incluye acentos y ñ) y espacios.
export const soloLetras = (valor: string): string =>
  valor
    .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');

// Solo dígitos, con el primer carácter del 1 al 9 (no permite 0 ni letras).
export const soloNumeros = (valor: string, max = 20): string =>
  valor.replace(/[^0-9]/g, '').replace(/^0+/, '').slice(0, max);

// Solo dígitos para la cédula: no letras, primer dígito del 1 al 9, hasta 9 dígitos.
const soloCedulaDigitos = (valor: string): string => {
  const digitos = valor.replace(/\D/g, '');
  const sinCerosIniciales = digitos.replace(/^0+/, '');
  return sinCerosIniciales.slice(0, CEDULA_DIGITOS);
};

// Devuelve los dígitos de la cédula ya validados (el formateo lo hace la máscara CR).
export const cedulaDigitosValidos = (valor: string): string => soloCedulaDigitos(valor);

// ---- Validadores ----

export const soloLetrasValido = (valor: string): boolean => {
  const limpio = valor.trim();
  if (limpio === '') return true;
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/.test(limpio);
};

export const textoEnRango = (valor: string): boolean => {
  const largo = valor.trim().length;
  return largo >= NOMBRE_MIN && largo <= NOMBRE_MAX;
};

export const cedulaValida = (cedula: string): boolean => {
  const digitos = cedula.replace(/\D/g, '');
  if (digitos === '') return true; // la cédula es opcional para menores
  return /^[1-9]/.test(digitos) && digitos.length === CEDULA_DIGITOS;
};

export const numeroValido = (valor: string): boolean => {
  const limpio = valor.trim().replace(/\D/g, '');
  if (limpio === '') return true; // campo opcional
  return /^[1-9]\d*$/.test(limpio);
};
