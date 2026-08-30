import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useObtenerSacramentosPersona } from '../hooks/hooksNuevos/useObtenerSacramentosPersona';
import {
  DetalleBautismo,
  PersonaDetalle,
  PersonaSacramental,
  TIPO_SACRAMENTO_LABEL,
} from '../../../types/sacramentosNuevos';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cedula: string | null;
}

const nombreCompleto = (persona: PersonaDetalle | null | undefined): string => {
  if (!persona) return '';
  return [persona.nombre, persona.primerApellido, persona.segundoApellido]
    .filter(Boolean)
    .join(' ')
    .trim();
};

const nombrePresbitero = (
  p: { nombre: string; primerApellido: string; segundoApellido: string | null } | null,
): string => {
  if (!p) return '';
  return [p.nombre, p.primerApellido, p.segundoApellido].filter(Boolean).join(' ').trim();
};

const nombreActa = (s: PersonaSacramental): string => {
  if (s.bautismo) return 'Acta de Bautismo';
  if (s.comunion) return 'Acta de Comunión';
  if (s.confirmacion) return 'Acta de Confirmación';
  if (s.matrimonio) return 'Acta de Matrimonio';
  return 'Acta de vida sacramental';
};

// Línea punteada para un dato vacío dentro del texto del acta (estilo original).
const Line = ({ children }: { children?: React.ReactNode }) => (
  <span className="inline-flex min-w-0 min-w-0 flex-1 items-baseline border-b border-slate-400 px-1 text-slate-900">
    <span className="min-w-0 break-words">{children}</span>
  </span>
);

const Fila = ({ label, valor }: { label: string; valor?: React.ReactNode }) => (
  <div className="flex items-baseline">
    <span className="mr-1 text-slate-500">{label}</span>
    <Line>{valor ?? ''}</Line>
  </div>
);

const renderBautismo = (detalle: DetalleBautismo) => (
  <>
    <Fila label="Bautizado:" valor={nombreCompleto(detalle.bautizado)} />
    <Fila label="Padre:" valor={nombreCompleto(detalle.padre)} />
    <Fila label="Madre:" valor={nombreCompleto(detalle.madre)} />
    <Fila label="Padrino:" valor={nombreCompleto(detalle.padrino)} />
    <Fila label="Madrina:" valor={nombreCompleto(detalle.madrina)} />
    <Fila label="Fecha de nacimiento:" valor={detalle.fechaNacimiento} />
    <Fila label="Hora de nacimiento:" valor={detalle.horaNacimiento} />
    <Fila label="Lugar de nacimiento:" valor={detalle.lugarNacimiento} />
    <Fila label="Libro:" valor={detalle.libro} />
    <Fila label="Tomo:" valor={detalle.tomo} />
    <Fila label="Folio:" valor={detalle.folio} />
    <Fila label="Asiento:" valor={detalle.asiento} />
    {detalle.abuelos.length > 0 &&
      detalle.abuelos.map((abuelo) => {
        const titulo = abuelo.parentesco
          .replaceAll('_', ' ')
          .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
        return <Fila key={`${abuelo.id}-${abuelo.parentesco}`} label={`${titulo}:`} valor={nombreCompleto(abuelo)} />;
      })}
  </>
);

const DetailsDrawer = ({ isOpen, onClose, cedula }: Props) => {
  const { data, isPending, error } = useObtenerSacramentosPersona(cedula);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const sacramental: PersonaSacramental | undefined = data;
  const persona = sacramental?.persona;

  return (

    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            role="presentation"
          />
          <motion.div
        className="fixed top-0 right-0 bottom-0 left-0 z-[1301] flex h-full w-full max-w-full flex-col bg-white shadow-[-8px_0_24px_rgba(15,23,42,0.15)] sm:left-auto sm:w-[min(700px,100vw)]"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del sacramento"
      >
        {/* Encabezado */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border-strong bg-white px-5 py-4 shadow-sm">
          <div>
            <h2 className="m-0 text-[1.1rem] font-bold leading-snug break-words text-royal-blue">
              Detalle del sacramento
            </h2>
            <p className="m-0 mt-0.5 text-[0.82rem] text-slate-500">
              {sacramental ? nombreActa(sacramental) : 'Acta de vida sacramental'}
            </p>
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
          {isPending && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Loader2 size={28} className="animate-spin text-text-muted" />
              <p className="m-0 text-sm text-text-secondary">Cargando detalles...</p>
            </div>
          )}

          {!isPending && error && (
            <p className="px-4 py-8 text-center text-slate-500">
              No se encontró una persona con esa cédula o no se pudo cargar la ficha.
            </p>
          )}

          {!isPending && !error && sacramental && (
            <div className="mx-auto max-w-[640px] bg-white shadow-[0_1px_6px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
              <div className="px-5 py-5 font-serif text-[0.9rem] leading-relaxed text-slate-800">
                {/* Datos personales */}
                <div className="mb-4 grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
                  <div className="flex min-w-0 items-baseline">
                    <span className="mr-1 shrink-0 text-slate-500">Nombre</span>
                    <Line>{persona?.nombre ?? ''}</Line>
                  </div>
                  <div className="flex min-w-0 items-baseline">
                    <span className="mr-1 shrink-0 text-slate-500">Primer Apellido</span>
                    <Line>{persona?.primerApellido ?? ''}</Line>
                  </div>
                  <div className="flex min-w-0 items-baseline">
                    <span className="mr-1 shrink-0 text-slate-500">Segundo Apellido</span>
                    <Line>{persona?.segundoApellido ?? ''}</Line>
                  </div>
                  <div className="flex min-w-0 items-baseline">
                    <span className="mr-1 shrink-0 text-slate-500">Cédula</span>
                    <Line>{persona?.cedula ?? ''}</Line>
                  </div>
                </div>

                {/* Bautismo */}
                <div
                  className={`mb-4 rounded-sm border-2 px-4 py-3 ${
                    sacramental.bautismo ? 'border-slate-400' : 'border-slate-200'
                  }`}
                >
                  <h4
                    className={`mb-3 text-center text-[0.95rem] font-bold tracking-wide uppercase ${
                      sacramental.bautismo ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {TIPO_SACRAMENTO_LABEL.bautismo}
                  </h4>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    {sacramental.bautismo ? (
                      renderBautismo(sacramental.bautismo.detalle as DetalleBautismo)
                    ) : (
                      <>
                        <Fila label="Bautizado:" />
                        <Fila label="Padre:" />
                        <Fila label="Madre:" />
                        <Fila label="Padrino:" />
                        <Fila label="Madrina:" />
                        <Fila label="Fecha:" />
                      </>
                    )}
                  </div>
                  {sacramental.bautismo && (
                    <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                      <Fila label="Parroquia:" valor={sacramental.bautismo.parroquia.nombre} />
                      <Fila label="Presbítero:" valor={nombrePresbitero(sacramental.bautismo.presbitero)} />
                      <Fila label="Fecha:" valor={sacramental.bautismo.fechaSacramento} />
                    </div>
                  )}
                </div>

                {/* Primera Comunión */}
                <div
                  className={`mb-4 rounded-sm border-2 px-4 py-3 ${
                    sacramental.comunion ? 'border-slate-400' : 'border-slate-200'
                  }`}
                >
                  <h4
                    className={`mb-3 text-center text-[0.95rem] font-bold tracking-wide uppercase ${
                      sacramental.comunion ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {TIPO_SACRAMENTO_LABEL.comunion}
                  </h4>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    <Fila
                      label="Persona:"
                      valor={
                        sacramental.comunion
                          ? nombreCompleto((sacramental.comunion.detalle as { persona: PersonaDetalle }).persona)
                          : ''
                      }
                    />
                    <Fila
                      label="Parroquia:"
                      valor={sacramental.comunion?.parroquia.nombre}
                    />
                    <Fila
                      label="Presbítero:"
                      valor={nombrePresbitero(sacramental.comunion?.presbitero ?? null)}
                    />
                    <Fila label="Fecha:" valor={sacramental.comunion?.fechaSacramento} />
                  </div>
                </div>

                {/* Confirmación */}
                <div
                  className={`mb-4 rounded-sm border-2 px-4 py-3 ${
                    sacramental.confirmacion ? 'border-slate-400' : 'border-slate-200'
                  }`}
                >
                  <h4
                    className={`mb-3 text-center text-[0.95rem] font-bold tracking-wide uppercase ${
                      sacramental.confirmacion ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {TIPO_SACRAMENTO_LABEL.confirmacion}
                  </h4>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    <Fila
                      label="Persona:"
                      valor={
                        sacramental.confirmacion
                          ? nombreCompleto((sacramental.confirmacion.detalle as { persona: PersonaDetalle }).persona)
                          : ''
                      }
                    />
                    <Fila
                      label="Parroquia:"
                      valor={sacramental.confirmacion?.parroquia.nombre}
                    />
                    <Fila
                      label="Presbítero:"
                      valor={nombrePresbitero(sacramental.confirmacion?.presbitero ?? null)}
                    />
                    <Fila label="Fecha:" valor={sacramental.confirmacion?.fechaSacramento} />
                  </div>
                </div>

                {/* Matrimonio */}
                <div
                  className={`mb-4 rounded-sm border-2 px-4 py-3 ${
                    sacramental.matrimonio ? 'border-slate-400' : 'border-slate-200'
                  }`}
                >
                  <h4
                    className={`mb-3 text-center text-[0.95rem] font-bold tracking-wide uppercase ${
                      sacramental.matrimonio ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {TIPO_SACRAMENTO_LABEL.matrimonio}
                  </h4>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    <Fila
                      label="Contrayente 1:"
                      valor={
                        sacramental.matrimonio
                          ? nombreCompleto((sacramental.matrimonio.detalle as { contrayente1: PersonaDetalle }).contrayente1)
                          : ''
                      }
                    />
                    <Fila
                      label="Contrayente 2:"
                      valor={
                        sacramental.matrimonio
                          ? nombreCompleto((sacramental.matrimonio.detalle as { contrayente2: PersonaDetalle }).contrayente2)
                          : ''
                      }
                    />
                    <Fila
                      label="Libro:"
                      valor={(sacramental.matrimonio?.detalle as { libro: string | null } | undefined)?.libro}
                    />
                    <Fila
                      label="Tomo:"
                      valor={(sacramental.matrimonio?.detalle as { tomo: string | null } | undefined)?.tomo}
                    />
                    <Fila
                      label="Folio:"
                      valor={(sacramental.matrimonio?.detalle as { folio: string | null } | undefined)?.folio}
                    />
                    <Fila label="Parroquia:" valor={sacramental.matrimonio?.parroquia.nombre} />
                    <Fila
                      label="Presbítero:"
                      valor={nombrePresbitero(sacramental.matrimonio?.presbitero ?? null)}
                    />
                    <Fila label="Fecha:" valor={sacramental.matrimonio?.fechaSacramento} />
                  </div>
                </div>

                {/* Observaciones */}
                <div className="mb-5 rounded-sm border-2 border-slate-200 px-4 py-3">
                  <h4 className="mb-2 text-center text-[0.95rem] font-bold tracking-wide uppercase text-slate-500">
                    Observaciones
                  </h4>
                  <div className="min-h-[9.5rem] overflow-hidden rounded-sm bg-white px-1 pt-1 [background-image:repeating-linear-gradient(to_bottom,transparent,transparent_1.9rem,#cbd5e1_1.9rem,#cbd5e1_1.95rem)]">
                    <p className="m-0 whitespace-pre-wrap break-words text-slate-900 [line-height:1.9rem] [overflow-wrap:anywhere]">
                      {sacramental.bautismo?.observaciones?.trim() || '\u00A0'}
                    </p>
                  </div>
                  <Fila label="Observaciones:" valor={sacramental.bautismo?.observaciones ?? ''} />
                </div>
              </div>
            </div>
          )}
        </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DetailsDrawer;