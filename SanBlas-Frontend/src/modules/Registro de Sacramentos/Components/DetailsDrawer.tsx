import './styles/DetailsDrawer.css';

interface DetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sacramento: any;
  tipo: string;
}

const DetailsDrawer = ({ isOpen, onClose, sacramento, tipo }: DetailsDrawerProps) => {
  if (!isOpen) return null;

  const renderDetails = () => {
    switch (tipo) {
      case 'Bautismo':
        return (
          <div className="details-content">
            <h3>Acta de Bautismo</h3>
            <div className="details-row">
              <span className="label">Nombre:</span>
              <span>{sacramento?.Nombre || sacramento?.nombre || ''} {sacramento?.PrimerApellido || sacramento?.primerApellido || ''} {sacramento?.SegundoApellido || sacramento?.segundoApellido || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Cédula:</span>
              <span>{sacramento?.cedula || sacramento?.Cedula || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Fecha de Bautismo:</span>
              <span>{sacramento?.FechaBautismo || sacramento?.fechaBautismo || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Año de Bautismo:</span>
              <span>{sacramento?.AnnioBautismo || sacramento?.annioBautismo || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Parroquia:</span>
              <span>{sacramento?.NombreParroquia || sacramento?.nombreParroquia || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Prebísptero:</span>
              <span>{sacramento?.Prebispero || sacramento?.prebispero || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Fecha de Nacimiento:</span>
              <span>{sacramento?.fechaNacimiento || sacramento?.FechaNacimiento || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Hora de Nacimiento:</span>
              <span>{sacramento?.horaNacimiento || sacramento?.HoraNacimiento || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Abuelos Paternos:</span>
              <span>{sacramento?.NombreAbuelosPaternos || sacramento?.nombreAbuelosPaternos || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Abuelos Maternos:</span>
              <span>{sacramento?.NombreAbuelosMaternos || sacramento?.nombreAbuelosMaternos || ''}</span>
            </div>
          </div>
        );
      
      case 'Comunión':
        return (
          <div className="details-content">
            <h3>Acta de Primera Comunión</h3>
            <div className="details-row">
              <span className="label">Nombre:</span>
              <span>{sacramento?.Nombre || sacramento?.nombre || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Día de Comunión:</span>
              <span>{sacramento?.DiaComunion || sacramento?.diaComunion || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Mes de Comunión:</span>
              <span>{sacramento?.MesComunion || sacramento?.mesComunion || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Año de Comunión:</span>
              <span>{sacramento?.AnnioComunion || sacramento?.annioComunion || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Lugar:</span>
              <span>{sacramento?.LugarComunion || sacramento?.lugarComunion || ''}</span>
            </div>
          </div>
        );
      
      case 'Confirmación':
        return (
          <div className="details-content">
            <h3>Acta de Confirmación</h3>
            <div className="details-row">
              <span className="label">Nombre:</span>
              <span>{sacramento?.Nombre || sacramento?.nombre || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Día de Confirmación:</span>
              <span>{sacramento?.DiaConfirmacion || sacramento?.diaConfirmacion || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Mes de Confirmación:</span>
              <span>{sacramento?.MesConfirmacion || sacramento?.mesConfirmacion || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Año de Confirmación:</span>
              <span>{sacramento?.AnnioConfirmacion || sacramento?.annioConfirmacion || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Lugar:</span>
              <span>{sacramento?.LugarConfirmacion || sacramento?.lugarConfirmacion || ''}</span>
            </div>
          </div>
        );
      
      case 'Matrimonio':
        return (
          <div className="details-content">
            <h3>Acta de Matrimonio</h3>
            <div className="details-row">
              <span className="label">Contrayente 1:</span>
              <span>{sacramento?.NombreContrayente || sacramento?.nombreContrayente || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Contrayente 2:</span>
              <span>{sacramento?.NombreContrayente2 || sacramento?.nombreContrayente2 || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Fecha de Matrimonio:</span>
              <span>{sacramento?.DiaMatrimonio || sacramento?.diaMatrimonio || ''}/{sacramento?.MesMatrimonio || sacramento?.mesMatrimonio || ''}/{sacramento?.AnnioMatrimonio || sacramento?.annioMatrimonio || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Lugar:</span>
              <span>{sacramento?.LugarMatrimonio || sacramento?.lugarMatrimonio || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Tomo:</span>
              <span>{sacramento?.Tomo || sacramento?.tomo || ''}</span>
            </div>
            <div className="details-row">
              <span className="label">Folio:</span>
              <span>{sacramento?.Folio || sacramento?.folio || ''}</span>
            </div>
          </div>
        );
      
      default:
        return <p>No hay detalles disponibles</p>;
    }
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <h2>Detalles del Sacramento</h2>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        <div className="drawer-body">
          {sacramento ? renderDetails() : <p>Cargando detalles...</p>}
        </div>
      </div>
    </>
  );
};

export default DetailsDrawer;