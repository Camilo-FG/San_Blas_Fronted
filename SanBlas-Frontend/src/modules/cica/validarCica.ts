import type { EstadoCivilCica } from "./types";
import { SACRAMENTOS_CICA } from "./sacramentosCica";

export const MAX_NOMBRE_CICA = 25;
export const MAX_APELLIDO_CICA = 25;
export const MAX_DIRECCION_CICA = 100;
export const MAX_TEXTO_CICA = 200;
export const MIN_DIRECCION_CICA = 10;

export const CEDULA_CICA = /^\d{9}$/;
export const TELEFONO_CICA = /^\d{4}-\d{4}$/;
export const CORREO_CICA = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const LETRAS_CON_ESPACIO = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const LETRAS_SIN_ESPACIO = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/;

export const filtrarNombreCica = (valor: string) =>
  valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "").slice(0, MAX_NOMBRE_CICA);

export const filtrarApellidoCica = (valor: string) =>
  valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "").slice(0, MAX_APELLIDO_CICA);

export const filtrarTelefonoCica = (valor: string) => {
  const soloNumeros = valor.replace(/\D/g, "").slice(0, 8);
  return soloNumeros.length > 4
    ? `${soloNumeros.slice(0, 4)}-${soloNumeros.slice(4)}`
    : soloNumeros;
};

export type FormularioCica = {
  nombre: string;
  apellido1: string;
  apellido2: string;
  fechaNacimiento: string;
  cedula: string;
  nacionalidad: string;
  telefono: string;
  correo: string;
  estadoCivil: EstadoCivilCica | "";
  conyugeNombre: string;
  conyugeApellido1: string;
  conyugeApellido2: string;
  necesitaBautizo: boolean;
  necesitaPrimeraComunion: boolean;
  necesitaConfirmacion: boolean;
  padreNombre: string;
  padreApellido1: string;
  padreApellido2: string;
  madreNombre: string;
  madreApellido1: string;
  madreApellido2: string;
  direccionHogar: string;
  esCatolico: "" | "si" | "no";
  otraIglesia: string;
  observacion: string;
};

const mensajeNombre = (
  valor: string,
  etiqueta: string,
  obligatorio: boolean,
  espacios: boolean,
) => {
  const texto = valor.trim();
  const maximo = espacios ? MAX_NOMBRE_CICA : MAX_APELLIDO_CICA;
  if (!texto) return obligatorio ? `${etiqueta} es obligatorio.` : null;
  const patron = espacios ? LETRAS_CON_ESPACIO : LETRAS_SIN_ESPACIO;
  if (!patron.test(texto)) return `${etiqueta} solo puede contener letras.`;
  if (texto.length > maximo) {
    return `${etiqueta} no puede superar los ${maximo} caracteres.`;
  }
  return null;
};

export const mensajeFechaNacimientoCica = (valor: string): string | null => {
  if (!valor) return "La fecha de nacimiento es obligatoria.";
  const nacimiento = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) {
    return "La fecha de nacimiento no es válida.";
  }
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (nacimiento > hoy) return "La fecha de nacimiento no puede ser futura.";
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1;
  if (edad < 18) return "Debe tener al menos 18 años para inscribirse en CICA.";
  return null;
};

export const validarFormularioCica = (
  form: FormularioCica,
): Record<string, string> => {
  const errores: Record<string, string> = {};
  const poner = (campo: string, mensaje: string | null) => {
    if (mensaje) errores[campo] = mensaje;
  };

  poner("nombre", mensajeNombre(form.nombre, "El nombre", true, true));
  poner("apellido1", mensajeNombre(form.apellido1, "El primer apellido", true, false));
  poner("apellido2", mensajeNombre(form.apellido2, "El segundo apellido", false, false));
  poner("fechaNacimiento", mensajeFechaNacimientoCica(form.fechaNacimiento));

  if (!form.cedula.trim()) errores.cedula = "La cédula es obligatoria.";
  else if (!CEDULA_CICA.test(form.cedula.trim()))
    errores.cedula = "La cédula debe tener 9 dígitos.";

  poner(
    "nacionalidad",
    mensajeNombre(form.nacionalidad, "La nacionalidad", true, true)?.replace(
      "es obligatorio.",
      "es obligatoria.",
    ) ?? null,
  );

  if (!form.telefono.trim()) errores.telefono = "El teléfono es obligatorio.";
  else if (!TELEFONO_CICA.test(form.telefono.trim()))
    errores.telefono = "El formato debe ser 8888-8888.";

  if (!form.correo.trim()) errores.correo = "El correo es obligatorio.";
  else if (!CORREO_CICA.test(form.correo.trim()))
    errores.correo = "Ingrese un correo válido. Ej: nombre@dominio.com";

  if (!form.estadoCivil) errores.estadoCivil = "Seleccione el estado civil.";
  if (form.estadoCivil && form.estadoCivil !== "soltero") {
    poner(
      "conyugeNombre",
      mensajeNombre(
        form.conyugeNombre,
        "El nombre del cónyuge o compañero(a)",
        true,
        true,
      ),
    );
    poner(
      "conyugeApellido1",
      mensajeNombre(
        form.conyugeApellido1,
        "El primer apellido del cónyuge o compañero(a)",
        true,
        false,
      ),
    );
    poner(
      "conyugeApellido2",
      mensajeNombre(
        form.conyugeApellido2,
        "El segundo apellido del cónyuge o compañero(a)",
        false,
        false,
      ),
    );
  }

  const seleccionados = SACRAMENTOS_CICA.filter(
    (sacramento) => form[sacramento.clave],
  );
  if (seleccionados.length === 0) {
    errores.sacramentos = "Marque al menos un sacramento que necesite.";
  }

  poner("padreNombre", mensajeNombre(form.padreNombre, "El nombre del padre", true, true));
  poner(
    "padreApellido1",
    mensajeNombre(form.padreApellido1, "El primer apellido del padre", true, false),
  );
  poner(
    "padreApellido2",
    mensajeNombre(form.padreApellido2, "El segundo apellido del padre", false, false),
  );
  poner("madreNombre", mensajeNombre(form.madreNombre, "El nombre de la madre", true, true));
  poner(
    "madreApellido1",
    mensajeNombre(form.madreApellido1, "El primer apellido de la madre", true, false),
  );
  poner(
    "madreApellido2",
    mensajeNombre(form.madreApellido2, "El segundo apellido de la madre", false, false),
  );

  const direccion = form.direccionHogar.trim();
  if (!direccion) errores.direccionHogar = "La dirección del hogar es obligatoria.";
  else if (direccion.length < MIN_DIRECCION_CICA)
    errores.direccionHogar = "La dirección debe tener al menos 10 caracteres.";
  else if (direccion.length > MAX_DIRECCION_CICA)
    errores.direccionHogar = "La dirección no puede superar los 100 caracteres.";

  if (!form.esCatolico)
    errores.esCatolico = "Indique si es católico o de otra iglesia.";
  if (form.esCatolico === "no") {
    const iglesia = form.otraIglesia.trim();
    if (iglesia.length < 2) {
      errores.otraIglesia =
        "Indique el nombre de la otra iglesia. Debe tener al menos 2 caracteres.";
    } else if (!LETRAS_CON_ESPACIO.test(iglesia)) {
      errores.otraIglesia = "El nombre de la otra iglesia solo puede contener letras.";
    } else if (iglesia.length > MAX_NOMBRE_CICA) {
      errores.otraIglesia = "El nombre de la otra iglesia no puede superar los 25 caracteres.";
    }
  }

  if (form.observacion.trim().length > MAX_TEXTO_CICA)
    errores.observacion = "La observación no puede superar los 200 caracteres.";

  return errores;
};
