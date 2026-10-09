import type { ReactNode } from "react";
import { ExternalLink, Image as ImageIcon } from "lucide-react";

import { resolveUploadedFileUrl } from "../../../utils/files";

// Muestra "—" cuando el valor viene vacío o nulo del backend, para que el detalle nunca quede con huecos en blanco.
export const valorOGuion = (valor?: string | number | null) => {
  if (valor === 0) return "0";
  if (valor === null || valor === undefined) return "—";
  const texto = String(valor).trim();
  return texto || "—";
};

// Fondos alternados de las tarjetas del detalle: la clara para secciones primarias, la "oscura" para las informativas.
export const claseTarjetaClara =
  "flex flex-col gap-4 rounded-2xl bg-[#f1f5fa] p-5 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33]";
export const claseTarjeta =
  "flex flex-col gap-4 rounded-2xl bg-[#e4eaf3] p-5 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33]";

// Título de cada sección del detalle, con la barrita vertical que le da identidad visual al sheet.
export function TituloSeccion({ children }: { children: ReactNode }) {
  return (
    <h4 className="m-0 flex items-center gap-2.5 text-sm font-bold text-royal-blue dark:text-[#f3f6fa]">
      <span className="h-4 w-1 rounded-full bg-[#94a3b8] dark:bg-[#d9a928]" aria-hidden="true" />
      {children}
    </h4>
  );
}

// Línea divisoria suave entre campos dentro de una misma tarjeta.
export function Separador() {
  return <div className="h-px w-full bg-[#16243c]/10 dark:bg-white/10" />;
}

// Campo del detalle: icono circular + label + valor. Así todos los módulos ven los datos igual.
export function Campo({
  label,
  value,
  icon,
  tabular = false,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tabular?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon ? (
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#aa7323] dark:bg-white/5 dark:text-[#d9a928]">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 pt-0.5">
        <p className="m-0 text-xs font-medium text-slate-500 dark:text-[#7f8da3]">{label}</p>
        <p
          className={`m-0 mt-0.5 break-words text-[0.95rem] font-semibold leading-snug text-[#16243c] dark:text-[#f3f6fa] ${
            tabular ? "tabular-nums" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// Enlace para abrir archivos adjuntos (fe de bautismo, comprobantes). Si no hay archivo, avisa en lugar de romper.
export function EnlaceArchivo({
  archivo,
  label,
}: {
  archivo?: File | string | null;
  label: string;
}) {
  const href =
    typeof archivo === "string" ? resolveUploadedFileUrl(archivo) : null;

  if (!href) {
    return (
      <p className="m-0 text-sm text-[#16243c]/70 dark:text-[#b7c3d4]">
        No se adjuntó ningún archivo.
      </p>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-xl border-2 border-solid border-royal-blue px-4 py-2.5 font-[Arial,Helvetica,sans-serif] text-sm font-bold text-royal-blue no-underline transition-colors duration-200 ease-out hover:border-royal-blue hover:bg-royal-blue hover:text-white focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-focus-ring focus-visible:outline-none dark:border-[#d9a928] dark:text-[#f3f6fa] dark:hover:border-[#d9a928] dark:hover:bg-[#d9a928] dark:hover:text-[#040b16] dark:focus-visible:ring-[#d9a928]"
    >
      <ImageIcon size={16} strokeWidth={2} className="shrink-0" />
      {label}
      <ExternalLink size={14} strokeWidth={2} className="shrink-0 opacity-70" />
    </a>
  );
}
