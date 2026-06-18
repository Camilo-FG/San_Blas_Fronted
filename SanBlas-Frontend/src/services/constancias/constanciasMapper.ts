import type { FormSacramento } from "../../types/formSacramento";
import type {
  CrearConstanciaBackendRequest,
  EstadoConstancia,
  FormSacraBackend,
  TipoSacramentoBackend,
} from "./constanciasApiTypes";

const soloDigitos = (valor: string): string => valor.replace(/\D/g, "");

export const mapTipoSacramentoToBackend = (
  tipo: string,
): TipoSacramentoBackend => {
  const normalizado = tipo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalizado === "bautismo") return "Bautismo";
  if (normalizado === "confirmacion") return "Confirmacion";
  if (normalizado === "matrimonio") return "Matrimonio";

  return tipo as TipoSacramentoBackend;
};

export const mapTipoSacramentoToFrontend = (
  tipo: TipoSacramentoBackend | string,
): string => {
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
