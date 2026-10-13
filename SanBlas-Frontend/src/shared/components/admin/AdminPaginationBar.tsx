import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  AdminPagination,
  AdminPaginationButton,
  AdminTableFooter,
} from "../../ui";

// Tamaños por defecto; catequesis usa estos mismos y el historial pasa los suyos por prop.
export const TAMANOS_PAGINA_ADMIN = [10, 25, 50] as const;

interface AdminPaginationBarProps {
  desde: number;
  hasta: number;
  total: number;
  pagina: number;
  totalPaginas: number;
  registrosPorPagina: number;
  tamanosPagina?: readonly number[];
  puedeAnterior: boolean;
  puedeSiguiente: boolean;
  onAnterior: () => void;
  onSiguiente: () => void;
  onCambiarRegistrosPorPagina: (nuevo: number) => void;
  pegadoAbajo?: boolean;
  // Se reenvía al AdminTableFooter por si la página necesita ajustar dark-mode o z-index.
  className?: string;
}

// Barra de paginación con la misma pinta que la de catequesis: "Mostrando X-Y de Z registros",
// selector de registros por página y chevrons. Componente tonto: solo recibe valores y callbacks,
// así las tres páginas de catequesis comparten UI sin duplicar JSX.
export function AdminPaginationBar({
  desde,
  hasta,
  total,
  pagina,
  totalPaginas,
  registrosPorPagina,
  tamanosPagina = TAMANOS_PAGINA_ADMIN,
  puedeAnterior,
  puedeSiguiente,
  onAnterior,
  onSiguiente,
  onCambiarRegistrosPorPagina,
  pegadoAbajo = false,
  className,
}: AdminPaginationBarProps) {
  return (
    <AdminTableFooter pegadoAbajo={pegadoAbajo} className={className}>
      <span className="text-sm text-text-muted dark:text-[#7f8da3]">
        Mostrando{" "}
        <strong className="text-text tabular-nums dark:text-[#f3f6fa]">
          {desde}-{hasta}
        </strong>{" "}
        de <strong className="text-text tabular-nums dark:text-[#f3f6fa]">{total}</strong>{" "}
        registros
      </span>
      <AdminPagination>
        <label className="mr-1 flex items-center gap-2 text-sm text-text-muted dark:text-[#7f8da3]">
          Registros por página
          <select
            value={registrosPorPagina}
            onChange={(event) =>
              onCambiarRegistrosPorPagina(Number(event.target.value))
            }
            className="min-h-10 cursor-pointer rounded-xl border border-border-strong bg-surface-muted px-2.5 text-sm tabular-nums text-slate-900 transition-colors duration-150 ease-out hover:bg-slate-200 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33] dark:text-[#f3f6fa] dark:placeholder:text-[#7f8da3] dark:hover:bg-white/[0.035] dark:focus:border-[#d9a928] dark:focus-visible:bg-[#0f1d33]"
            aria-label="Cantidad de registros por página"
          >
            {tamanosPagina.map((tamano) => (
              <option key={tamano} value={tamano}>
                {tamano}
              </option>
            ))}
          </select>
        </label>
        <AdminPaginationButton
          type="button"
          onClick={onAnterior}
          disabled={!puedeAnterior}
          aria-label="Página anterior"
          className="dark:border dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33] dark:text-[#f3f6fa] dark:hover:bg-white/[0.035] dark:hover:text-[#d9a928] dark:disabled:bg-white/5 dark:disabled:text-[#7f8da3]"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </AdminPaginationButton>
        <span className="text-sm whitespace-nowrap text-text-muted dark:text-[#7f8da3]">
          Página{" "}
          <strong className="text-text tabular-nums dark:text-[#f3f6fa]">{pagina}</strong> de{" "}
          <strong className="text-text tabular-nums dark:text-[#f3f6fa]">
            {totalPaginas || 1}
          </strong>
        </span>
        <AdminPaginationButton
          type="button"
          onClick={onSiguiente}
          disabled={!puedeSiguiente}
          aria-label="Página siguiente"
          className="dark:border dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33] dark:text-[#f3f6fa] dark:hover:bg-white/[0.035] dark:hover:text-[#d9a928] dark:disabled:bg-white/5 dark:disabled:text-[#7f8da3]"
        >
          <ChevronRight size={16} strokeWidth={2} />
        </AdminPaginationButton>
      </AdminPagination>
    </AdminTableFooter>
  );
}
