import type { FormSacramento } from "../../types/formSacramento";
import type {
  CrearConstanciaBackendRequest,
  EstadoConstancia,
  FormSacraBackend,
} from "./constanciasApiTypes";

const soloDigitos = (valor: string): string => valor.replace(/\D/g, "");

const normalizarTipoSacramento = (tipo: string): string =>
  tipo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const mapTipoSacramentoToBackend = (tipo: string): string => {
  const normalizado = normalizarTipoSacramento(tipo);

  if (normalizado === "bautismo") return "Bautismo";
  if (normalizado === "confirmacion") return "Confirmación";
  if (normalizado === "matrimonio") return "Matrimonio";

  return "Bautismo";
};

export const mapTipoSacramentoToFrontend = (tipo: string): string => {
  if (tipo === "Confirmación") return "Confirmación";
  if (tipo === "Matrimonio") return "Matrimonio";
  return "Bautismo";
};

export const mapFormToBackendRequest = (
  form: Omit<FormSacramento, "id" | "Estado">,
): CrearConstanciaBackendRequest => ({
  Nombre: form.Nombre.trim(),
  PrimerApellido: form.PrimerApellido.trim(),
  SegundoApellido: form.SegundoApellido.trim(),
  Cedula: Number(soloDigitos(String(form.Cedula)).slice(0, 9)),
  Correo: form.Correo.trim(),
  Telefono: Number(soloDigitos(String(form.Telefono)).slice(0, 8)),
  TipoSacramento: mapTipoSacramentoToBackend(form.TipoSacramento),
  Motivo: form.Motivo.trim(),
});

export const mapBackendToFormSacramento = (
  solicitud: FormSacraBackend,
): FormSacramento => ({
  id: solicitud.id,
  Nombre: solicitud.Nombre,
  PrimerApellido: solicitud.PrimerApellido,
  SegundoApellido: solicitud.SegundoApellido,
  Cedula: solicitud.Cedula,
  Correo: solicitud.Correo,
  Telefono: solicitud.Telefono,
  TipoSacramento: mapTipoSacramentoToFrontend(solicitud.TipoSacramento),
  Motivo: solicitud.Motivo,
  Estado: solicitud.Estado ?? "pendiente",
});
