import type { FormSacramento } from "../../types/formSacramento";
import type {
  CrearConstanciaBackendRequest,
  FormSacraBackend,
} from "./constanciasApiTypes";

const soloDigitos = (valor: string): string => valor.replace(/\D/g, "");

const normalizarTipoSacramento = (tipo: string | undefined): string =>
  (tipo ?? "")
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

export const mapTipoSacramentoToFrontend = (tipo?: string): string => {
  if (tipo === "Confirmación") return "Confirmación";
  if (tipo === "Matrimonio") return "Matrimonio";
  return "Bautismo";
};

const partirNombre = (
  nombre: string,
): { PrimerNombre: string; SegundoNombre?: string } => {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  const PrimerNombre = (partes[0] ?? "").slice(0, 50);
  const segundo = partes.slice(1).join(" ").slice(0, 50);
  return segundo ? { PrimerNombre, SegundoNombre: segundo } : { PrimerNombre };
};

const nombreDesdeBackend = (solicitud: FormSacraBackend): string => {
  if (solicitud.Nombre?.trim()) {
    return solicitud.Nombre.trim();
  }

  return [solicitud.PrimerNombre, solicitud.SegundoNombre]
    .filter((parte): parte is string => Boolean(parte?.trim()))
    .join(" ");
};

export const mapFormToBackendRequest = (
  form: Omit<FormSacramento, "id" | "Estado">,
): CrearConstanciaBackendRequest => ({
  ...partirNombre(form.Nombre),
  PrimerApellido: form.PrimerApellido.trim(),
  SegundoApellido: form.SegundoApellido.trim(),
  Cedula: Number(soloDigitos(String(form.Cedula)).slice(0, 9)),
  Correo: form.Correo.trim(),
  Telefono: Number(soloDigitos(String(form.Telefono)).slice(0, 8)),
  Motivo: form.Motivo.trim(),
});

export const mapBackendToFormSacramento = (
  solicitud: FormSacraBackend,
): FormSacramento => ({
  id: solicitud.id,
  Nombre: nombreDesdeBackend(solicitud),
  PrimerApellido: solicitud.PrimerApellido,
  SegundoApellido: solicitud.SegundoApellido,
  Cedula: solicitud.Cedula,
  Correo: solicitud.Correo,
  Telefono: solicitud.Telefono,
  TipoSacramento: mapTipoSacramentoToFrontend(solicitud.TipoSacramento),
Motivo: solicitud.Motivo,
  Estado: solicitud.Estado ?? "pendiente",
  Fecha: solicitud.FechaSolicitud,
});
