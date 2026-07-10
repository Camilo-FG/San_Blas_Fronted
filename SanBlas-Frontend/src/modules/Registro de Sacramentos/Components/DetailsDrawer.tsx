interface DetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sacramento: any;
  tipo: string;
}

const DetailsDrawer = ({ isOpen, onClose, sacramento, tipo }: DetailsDrawerProps) => {
  if (!isOpen) return null;

  const rowClass =
    "mb-3.5 flex flex-col gap-0.5 border-b border-slate-100 pb-3 sm:flex-row sm:items-start sm:gap-3";
  const labelClass =
    "text-xs font-bold tracking-wide text-text-muted uppercase sm:w-[150px] sm:shrink-0 sm:text-sm sm:normal-case sm:text-slate-600";
  const valueClass = "break-words text-[0.92rem] leading-snug text-slate-900 sm:flex-1";

  const renderDetails = () => {
    switch (tipo) {
      case 'Bautismo':
        return (
          <div>
            <h3 className="mb-4 text-base font-extrabold text-royal-blue">Acta de Bautismo</h3>
            <div className={rowClass}>
              <span className={labelClass}>Nombre:</span>
              <span className={valueClass}>{sacramento?.Nombre || sacramento?.nombre || ''} {sacramento?.PrimerApellido || sacramento?.primerApellido || ''} {sacramento?.SegundoApellido || sacramento?.segundoApellido || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Cédula:</span>
              <span className={valueClass}>{sacramento?.cedula || sacramento?.Cedula || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Fecha de Bautismo:</span>
              <span className={valueClass}>{sacramento?.FechaBautismo || sacramento?.fechaBautismo || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Año de Bautismo:</span>
              <span className={valueClass}>{sacramento?.AnnioBautismo || sacramento?.annioBautismo || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Parroquia:</span>
              <span className={valueClass}>{sacramento?.NombreParroquia || sacramento?.nombreParroquia || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Prebísptero:</span>
              <span className={valueClass}>{sacramento?.Prebispero || sacramento?.prebispero || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Fecha de Nacimiento:</span>
              <span className={valueClass}>{sacramento?.fechaNacimiento || sacramento?.FechaNacimiento || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Hora de Nacimiento:</span>
              <span className={valueClass}>{sacramento?.horaNacimiento || sacramento?.HoraNacimiento || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Abuelos Paternos:</span>
              <span className={valueClass}>{sacramento?.NombreAbuelosPaternos || sacramento?.nombreAbuelosPaternos || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Abuelos Maternos:</span>
              <span className={valueClass}>{sacramento?.NombreAbuelosMaternos || sacramento?.nombreAbuelosMaternos || ''}</span>
            </div>
          </div>
        );
      
      case 'Comunión':
        return (
          <div>
            <h3 className="mb-4 text-base font-extrabold text-royal-blue">Acta de Primera Comunión</h3>
            <div className={rowClass}>
              <span className={labelClass}>Nombre:</span>
              <span className={valueClass}>{sacramento?.Nombre || sacramento?.nombre || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Día de Comunión:</span>
              <span className={valueClass}>{sacramento?.DiaComunion || sacramento?.diaComunion || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Mes de Comunión:</span>
              <span className={valueClass}>{sacramento?.MesComunion || sacramento?.mesComunion || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Año de Comunión:</span>
              <span className={valueClass}>{sacramento?.AnnioComunion || sacramento?.annioComunion || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Lugar:</span>
              <span className={valueClass}>{sacramento?.LugarComunion || sacramento?.lugarComunion || ''}</span>
            </div>
          </div>
        );
      
      case 'Confirmación':
        return (
          <div>
            <h3 className="mb-4 text-base font-extrabold text-royal-blue">Acta de Confirmación</h3>
            <div className={rowClass}>
              <span className={labelClass}>Nombre:</span>
              <span className={valueClass}>{sacramento?.Nombre || sacramento?.nombre || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Día de Confirmación:</span>
              <span className={valueClass}>{sacramento?.DiaConfirmacion || sacramento?.diaConfirmacion || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Mes de Confirmación:</span>
              <span className={valueClass}>{sacramento?.MesConfirmacion || sacramento?.mesConfirmacion || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Año de Confirmación:</span>
              <span className={valueClass}>{sacramento?.AnnioConfirmacion || sacramento?.annioConfirmacion || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Lugar:</span>
              <span className={valueClass}>{sacramento?.LugarConfirmacion || sacramento?.lugarConfirmacion || ''}</span>
            </div>
          </div>
        );
      
      case 'Matrimonio':
        return (
          <div>
            <h3 className="mb-4 text-base font-extrabold text-royal-blue">Acta de Matrimonio</h3>
            <div className={rowClass}>
              <span className={labelClass}>Contrayente 1:</span>
              <span className={valueClass}>{sacramento?.NombreContrayente || sacramento?.nombreContrayente || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Contrayente 2:</span>
              <span className={valueClass}>{sacramento?.NombreContrayente2 || sacramento?.nombreContrayente2 || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Fecha de Matrimonio:</span>
              <span className={valueClass}>{sacramento?.DiaMatrimonio || sacramento?.diaMatrimonio || ''}/{sacramento?.MesMatrimonio || sacramento?.mesMatrimonio || ''}/{sacramento?.AnnioMatrimonio || sacramento?.annioMatrimonio || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Lugar:</span>
              <span className={valueClass}>{sacramento?.LugarMatrimonio || sacramento?.lugarMatrimonio || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Tomo:</span>
              <span className={valueClass}>{sacramento?.Tomo || sacramento?.tomo || ''}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Folio:</span>
              <span className={valueClass}>{sacramento?.Folio || sacramento?.folio || ''}</span>
            </div>
          </div>
        );
      
      default:
        return <p>No hay detalles disponibles</p>;
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[1300] bg-slate-900/55"
        onClick={onClose}
        role="presentation"
      />
      <div
        className="fixed top-auto right-0 bottom-0 left-0 z-[1301] flex h-auto max-h-[92vh] w-full max-w-full animate-drawer-slide-up flex-col rounded-t-[18px] bg-white shadow-[-8px_0_24px_rgba(15,23,42,0.12)] sm:top-0 sm:right-0 sm:bottom-auto sm:left-auto sm:h-full sm:h-dvh sm:max-h-none sm:w-[min(500px,100vw)] sm:animate-drawer-slide-in sm:rounded-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-sacramento-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border-strong bg-surface-muted px-4 py-4 sm:px-5">
          <h2 id="drawer-sacramento-title" className="m-0 text-[1.05rem] leading-snug break-words text-royal-blue">
            Detalles del sacramento
          </h2>
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-slate-100 text-xl leading-none text-slate-700 hover:bg-slate-200 focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none"
            onClick={onClose}
            aria-label="Cerrar detalles"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-4 sm:px-5 sm:pb-5">
          {sacramento ? renderDetails() : <p>Cargando detalles...</p>}
        </div>
      </div>
    </>
  );
};

export default DetailsDrawer;
