import {
  AdminPagination,
  AdminPaginationButton,
  AdminTable,
  AdminTableCell,
  AdminTableFooter,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTablePanel,
  AdminTableRow,
  Skeleton,
} from '../../../shared/ui';

// Tamaños simulados para que las filas tengan variación realista como los datos reales
const FILAS_ESQUELETO = [
  { nombreWidth: 'w-48', cedulaWidth: 'w-24', fechaWidth: 'w-20', filialWidth: 'w-36' },
  { nombreWidth: 'w-56', cedulaWidth: 'w-24', fechaWidth: 'w-20', filialWidth: 'w-28' },
  { nombreWidth: 'w-40', cedulaWidth: 'w-24', fechaWidth: 'w-20', filialWidth: 'w-40' },
  { nombreWidth: 'w-60', cedulaWidth: 'w-24', fechaWidth: 'w-20', filialWidth: 'w-32' },
  { nombreWidth: 'w-44', cedulaWidth: 'w-24', fechaWidth: 'w-20', filialWidth: 'w-36' },
  { nombreWidth: 'w-52', cedulaWidth: 'w-24', fechaWidth: 'w-20', filialWidth: 'w-30' },
];

const TARJETAS_MOVIL_ESQUELETO = [
  { tituloWidth: 'w-48', filialWidth: 'w-32' },
  { tituloWidth: 'w-56', filialWidth: 'w-28' },
  { tituloWidth: 'w-40', filialWidth: 'w-36' },
];

export const SacramentTableSkeleton = () => {
  return (
    <div role="status" aria-label="Cargando registros sacramentales..." className="w-full">
      <span className="sr-only">Cargando registros sacramentales...</span>

      {/* Vista de escritorio: tabla réplica de SacramentTable */}
      <AdminTablePanel className="hidden md:block">
        <AdminTable className="min-w-[700px] [&_td]:py-2! [&_th]:py-2.5!">
          <AdminTableHead>
            <AdminTableRow>
              <AdminTableHeaderCell>Nombre del fiel</AdminTableHeaderCell>
              <AdminTableHeaderCell>Cédula</AdminTableHeaderCell>
              <AdminTableHeaderCell>Fecha</AdminTableHeaderCell>
              <AdminTableHeaderCell>Filial</AdminTableHeaderCell>
              <AdminTableHeaderCell>Acciones</AdminTableHeaderCell>
            </AdminTableRow>
          </AdminTableHead>
          <tbody>
            {FILAS_ESQUELETO.map((fila, i) => (
              <AdminTableRow
                key={i}
                className={i % 2 === 1 ? 'bg-surface-muted/50' : undefined}
              >
                {/* Nombre */}
                <AdminTableCell>
                  <Skeleton className={`h-4.5 ${fila.nombreWidth} rounded`} />
                </AdminTableCell>

                {/* Cédula */}
                <AdminTableCell>
                  <Skeleton className={`h-4.5 ${fila.cedulaWidth} rounded`} />
                </AdminTableCell>

                {/* Fecha */}
                <AdminTableCell>
                  <Skeleton className={`h-4.5 ${fila.fechaWidth} rounded`} />
                </AdminTableCell>

                {/* Filial */}
                <AdminTableCell>
                  <Skeleton className={`h-4.5 ${fila.filialWidth} rounded`} />
                </AdminTableCell>

                {/* Acciones: 3 botones cuadrados simulados */}
                <AdminTableCell>
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-7 w-7 rounded-lg" />
                    <Skeleton className="h-7 w-7 rounded-lg" />
                    <Skeleton className="h-7 w-7 rounded-lg" />
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </tbody>
        </AdminTable>
      </AdminTablePanel>

      {/* Vista móvil: tarjetas réplica de AdminRecordCard */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {TARJETAS_MOVIL_ESQUELETO.map((card, i) => (
          <article
            key={i}
            className="flex flex-col gap-2.5 rounded-2xl border border-border-strong bg-surface px-3.5 py-3.5 shadow-[0_4px_14px_rgba(15,23,42,0.04)] dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-none"
          >
            {/* Cabecera de la tarjeta: Icono + Código + Título + Subtítulo */}
            <div className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-2.5">
              <Skeleton className="h-[42px] w-[42px] shrink-0 rounded-xl" />
              <div className="min-w-0">
                <Skeleton className="mb-1.5 h-3 w-14 rounded" />
                <Skeleton className={`h-5 ${card.tituloWidth} max-w-full rounded`} />
                <Skeleton className={`mt-1.5 h-3.5 ${card.filialWidth} max-w-full rounded`} />
              </div>
            </div>

            {/* Metadatos en 2 columnas: Fecha y Cédula */}
            <div className="m-0 grid grid-cols-2 gap-x-2.5 gap-y-2 rounded-xl border border-[#eef2f7] bg-surface-muted px-2.5 py-2.5 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33]">
              <div className="min-w-0">
                <Skeleton className="h-2.5 w-12 rounded" />
                <Skeleton className="mt-1 h-4 w-20 rounded" />
              </div>
              <div className="min-w-0">
                <Skeleton className="h-2.5 w-12 rounded" />
                <Skeleton className="mt-1 h-4 w-24 rounded" />
              </div>
            </div>

            {/* 3 Botones de acción inferiores */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="min-h-10 flex-1 rounded-[10px]" />
              <Skeleton className="min-h-10 flex-1 rounded-[10px]" />
              <Skeleton className="min-h-10 flex-1 rounded-[10px]" />
            </div>
          </article>
        ))}
      </div>

      {/* Paginación / Pie de tabla en carga */}
      <AdminTableFooter pegadoAbajo className="dark:border-[rgba(220,230,242,0.12)] dark:bg-[#040b16]/95 dark:text-[#b7c3d4]">
        <Skeleton className="h-4 w-44 rounded" />
        <AdminPagination>
          <div className="mr-1 flex items-center gap-2">
            <Skeleton className="h-3.5 w-32 rounded" />
            <Skeleton className="h-10 w-16 rounded-xl" />
          </div>
          <AdminPaginationButton type="button" disabled aria-label="Página anterior" className="opacity-50">
            <Skeleton className="h-4 w-4 rounded" />
          </AdminPaginationButton>
          <Skeleton className="h-4 w-20 rounded" />
          <AdminPaginationButton type="button" disabled aria-label="Página siguiente" className="opacity-50">
            <Skeleton className="h-4 w-4 rounded" />
          </AdminPaginationButton>
        </AdminPagination>
      </AdminTableFooter>
    </div>
  );
};

export default SacramentTableSkeleton;
