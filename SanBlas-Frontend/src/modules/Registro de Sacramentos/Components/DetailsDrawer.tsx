interface DetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sacramento: any;
  tipo: string;
}

const formatearHora = (hora: any): string => {
  if (!hora) return '';
  if (typeof hora === 'string') return hora;
  const horas = String(hora.hours ?? hora.Hours ?? hora.hour ?? '00').padStart(2, '0');
  const minutos = String(hora.minutes ?? hora.Minutes ?? hora.minute ?? '00').padStart(2, '0');
  return `${horas}:${minutos}`;
};

const value = (sacramento: any, keys: string[]): string => {
  for (const key of keys) {
    const v = sacramento?.[key];
    if (v !== undefined && v !== null && v !== '') return String(v);
  }
  return '';
};

const DetailsDrawer = ({ isOpen, onClose, sacramento, tipo }: DetailsDrawerProps) => {
  if (!isOpen) return null;

  const nombre = value(sacramento, ['Nombre', 'nombre']);
  const primerApellido = value(sacramento, ['PrimerApellido', 'primerApellido']);
  const segundoApellido = value(sacramento, ['SegundoApellido', 'segundoApellido']);
  const cedula = value(sacramento, ['cedula', 'Cedula']);

  // Línea punteada para un dato vacío dentro del texto del acta.
  const Line = ({ children }: { children?: React.ReactNode }) => (
    <span className="mx-1 inline-block min-w-[3rem] border-b border-slate-400 text-slate-900">
      {children}
    </span>
  );

  return (
    <>
      <div
        className="fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-[2px]"
        onClick={onClose}
        role="presentation"
      />
      <div
        className="fixed top-0 right-0 bottom-0 left-0 z-[1301] flex h-full w-full max-w-full flex-col bg-slate-100 sm:left-auto sm:w-[min(560px,100vw)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-sacramento-title"
      >
        {/* Encabezado */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border-strong bg-white px-5 py-4 shadow-sm">
          <div>
            <h2 id="drawer-sacramento-title" className="m-0 text-[1.1rem] font-bold leading-snug break-words text-royal-blue">
              Detalle del sacramento
            </h2>
            <p className="m-0 mt-0.5 text-[0.82rem] text-slate-500">Acta de vida sacramental</p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-slate-100 text-xl leading-none text-slate-700 hover:bg-slate-200 focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
            onClick={onClose}
            aria-label="Cerrar detalles"
          >
            ×
          </button>
        </div>

        {/* Cuerpo: el acta en papel */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 sm:px-4">
          {sacramento ? (
            <div className="mx-auto max-w-[520px] bg-white shadow-[0_1px_6px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
              <div className="px-5 py-5 font-serif text-[0.9rem] leading-relaxed text-slate-800">
                {/* Datos personales */}
                <div className="mb-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-3">
                  <div className="flex items-baseline">
                    <span className="mr-1 text-slate-500">Nombre</span>
                    <Line>{nombre}</Line>
                  </div>
                  <div className="flex items-baseline">
                    <span className="mr-1 text-slate-500">Primer Apellido</span>
                    <Line>{primerApellido}</Line>
                  </div>
                  <div className="flex items-baseline">
                    <span className="mr-1 text-slate-500">Segundo Apellido</span>
                    <Line>{segundoApellido}</Line>
                  </div>
                </div>

                {/* Bautismo */}
                <div className={`mb-4 rounded-sm border-2 px-4 py-3 ${tipo === 'Bautismo' ? 'border-slate-400' : 'border-slate-200'}`}>
                  <h4 className={`mb-3 text-center text-[0.95rem] font-bold tracking-wide uppercase ${tipo === 'Bautismo' ? 'text-slate-800' : 'text-slate-400'}`}>
                    Bautismo
                  </h4>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Fecha de Bautismo:</span>
                      <Line>{value(sacramento, ['FechaBautismo', 'fechaBautismo'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Año:</span>
                      <Line>{value(sacramento, ['AnnioBautismo', 'annioBautismo'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Fecha de nacimiento:</span>
                      <Line>{value(sacramento, ['fechaNacimiento', 'FechaNacimiento'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Hora de nacimiento:</span>
                      <Line>{formatearHora(sacramento?.horaNacimiento || sacramento?.HoraNacimiento)}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Parroquia:</span>
                      <Line>{value(sacramento, ['NombreParroquia', 'nombreParroquia'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Presbítero:</span>
                      <Line>{value(sacramento, ['Prebispero', 'prebispero'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Cédula:</span>
                      <Line>{cedula}</Line>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div>
                      <span className="mr-1 text-slate-500">Abuelos Paternos:</span>
                      <Line>{value(sacramento, ['NombreAbuelosPaternos', 'nombreAbuelosPaternos'])}</Line>
                    </div>
                    <div>
                      <span className="mr-1 text-slate-500">Abuelos Maternos:</span>
                      <Line>{value(sacramento, ['NombreAbuelosMaternos', 'nombreAbuelosMaternos'])}</Line>
                    </div>
                  </div>
                </div>

                {/* Primera Comunión */}
                <div className={`mb-4 rounded-sm border-2 px-4 py-3 ${tipo === 'Comunión' ? 'border-slate-400' : 'border-slate-200'}`}>
                  <h4 className={`mb-3 text-center text-[0.95rem] font-bold tracking-wide uppercase ${tipo === 'Comunión' ? 'text-slate-800' : 'text-slate-400'}`}>
                    Primera Comunión
                  </h4>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Día:</span>
                      <Line>{value(sacramento, ['DiaComunion', 'diaComunion'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Mes:</span>
                      <Line>{value(sacramento, ['MesComunion', 'mesComunion'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Año:</span>
                      <Line>{value(sacramento, ['AnnioComunion', 'annioComunion'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Lugar:</span>
                      <Line>{value(sacramento, ['LugarComunion', 'lugarComunion'])}</Line>
                    </div>
                  </div>
                </div>

                {/* Confirmación */}
                <div className={`mb-4 rounded-sm border-2 px-4 py-3 ${tipo === 'Confirmación' ? 'border-slate-400' : 'border-slate-200'}`}>
                  <h4 className={`mb-3 text-center text-[0.95rem] font-bold tracking-wide uppercase ${tipo === 'Confirmación' ? 'text-slate-800' : 'text-slate-400'}`}>
                    Confirmación
                  </h4>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Día:</span>
                      <Line>{value(sacramento, ['DiaConfirmacion', 'diaConfirmacion'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Mes:</span>
                      <Line>{value(sacramento, ['MesConfirmacion', 'mesConfirmacion'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Año:</span>
                      <Line>{value(sacramento, ['AnnioConfirmacion', 'annioConfirmacion'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Lugar:</span>
                      <Line>{value(sacramento, ['LugarConfirmacion', 'lugarConfirmacion'])}</Line>
                    </div>
                  </div>
                </div>

                {/* Matrimonio */}
                <div className={`mb-4 rounded-sm border-2 px-4 py-3 ${tipo === 'Matrimonio' ? 'border-slate-400' : 'border-slate-200'}`}>
                  <h4 className={`mb-3 text-center text-[0.95rem] font-bold tracking-wide uppercase ${tipo === 'Matrimonio' ? 'text-slate-800' : 'text-slate-400'}`}>
                    Matrimonio
                  </h4>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Contrayente 1:</span>
                      <Line>{value(sacramento, ['NombreContrayente', 'nombreContrayente'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Contrayente 2:</span>
                      <Line>{value(sacramento, ['NombreContrayente2', 'nombreContrayente2'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Día:</span>
                      <Line>{value(sacramento, ['DiaMatrimonio', 'diaMatrimonio'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Mes:</span>
                      <Line>{value(sacramento, ['MesMatrimonio', 'mesMatrimonio'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Año:</span>
                      <Line>{value(sacramento, ['AnnioMatrimonio', 'annioMatrimonio'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Lugar:</span>
                      <Line>{value(sacramento, ['LugarMatrimonio', 'lugarMatrimonio'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Tomo:</span>
                      <Line>{value(sacramento, ['Tomo', 'tomo'])}</Line>
                    </div>
                    <div className="flex items-baseline">
                      <span className="mr-1 text-slate-500">Folio:</span>
                      <Line>{value(sacramento, ['Folio', 'folio'])}</Line>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                <div className="mb-5 rounded-sm border-2 border-slate-200 px-4 py-3">
                  <h4 className="mb-2 text-center text-[0.95rem] font-bold tracking-wide uppercase text-slate-500">
                    Observaciones
                  </h4>
                  <div className="space-y-2">
                    <div className="h-5 border-b border-slate-300" />
                    <div className="h-5 border-b border-slate-300" />
                    <div className="h-5 border-b border-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="px-4 py-8 text-center text-slate-500">Cargando detalles...</p>
          )}
        </div>
      </div>
    </>
  );
};

export default DetailsDrawer;
