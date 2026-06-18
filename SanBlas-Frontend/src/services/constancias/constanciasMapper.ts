import type { FormSacramento } from "../../types/formSacramento";
import type {
  CrearConstanciaBackendRequest,
  EstadoConstancia,
  FormSacraBackend,
  TipoSacramentoBackend,
  TipoSacramentoBackendCode,
} from "./constanciasApiTypes";

const soloDigitos = (valor: string): string => valor.replace(/\D/g, "");

const normalizarTipoSacramento = (tipo: string): string =>
  tipo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const mapTipoSacramentoToBackend = (
  tipo: string,
): TipoSacramentoBackendCode => {
  const normalizado = normalizarTipoSacramento(tipo);

  if (normalizado === "bautismo") return 0;
  if (normalizado === "confirmacion") return 1;
  if (normalizado === "matrimonio") return 2;

  return 0;
};

export const mapTipoSacramentoToFrontend = (
  tipo: TipoSacramentoBackend | TipoSacramentoBackendCode,
): string => {
  if (typeof tipo === "number") {
    if (tipo === 1) return "Confirmación";
    if (tipo === 2) return "Matrimonio";
    return "Bautismo";
  }

  if (tipo === "Confirmacion") return "Confirmación";
  return tipo;
};

export const mapFormToBackendRequest = (
  form: Omit<FormSacramento, "id" | "Estado">,
): CrearConstanciaBackendRequest => ({
  nombre: form.Nombre.trim(),
  primerApellido: form.PrimerApellido.trim(),
  segundoApellido: form.SegundoApellido.trim(),
  cedula: soloDigitos(String(form.Cedula)).slice(0, 9),
  correo: form.Correo.trim(),
  telefono: soloDigitos(String(form.Telefono)).slice(0, 8),
  tipoSacramento: mapTipoSacramentoToBackend(form.TipoSacramento),
  motivo: form.Motivo.trim(),
});

export const mapBackendToFormSacramento = (
  solicitud: FormSacraBackend,
): FormSacramento => ({
  id: solicitud.id,
  Nombre: solicitud.nombre,
  PrimerApellido: solicitud.primerApellido,
  SegundoApellido: solicitud.segundoApellido,
  Cedula: Number(solicitud.cedula) || solicitud.cedula,
  Correo: solicitud.correo,
  Telefono: Number(solicitud.telefono) || solicitud.telefono,
  TipoSacramento: mapTipoSacramentoToFrontend(solicitud.tipoSacramento),
  Motivo: solicitud.motivo,
  Estado: (solicitud.estado as EstadoConstancia) ?? "Pendiente",
});
