
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
              <span>{sacramento.Nombre} {sacramento.PrimerApellido} {sacramento.SegundoApellido}</span>
            </div>
            <div className="details-row">
              <span className="label">Cédula:</span>
              <span>{sacramento.cedula}</span>
            </div>
            <div className="details-row">
              <span className="label">Fecha de Bautismo:</span>
              <span>{sacramento.FechaBautismo}</span>
            </div>
            <div className="details-row">
              <span className="label">Año de Bautismo:</span>
              <span>{sacramento.AnnioBautismo}</span>
            </div>
            <div className="details-row">
              <span className="label">Parroquia:</span>
              <span>{sacramento.NombreParroquia}</span>
            </div>
            <div className="details-row">
              <span className="label">Prebísptero:</span>
              <span>{sacramento.Prebispero}</span>
            </div>
            <div className="details-row">
              <span className="label">Fecha de Nacimiento:</span>
              <span>{sacramento.fechaNacimiento}</span>
            </div>
            <div className="details-row">
              <span className="label">Hora de Nacimiento:</span>
              <span>{sacramento.horaNacimiento}</span>
            </div>
            <div className="details-row">
              <span className="label">Abuelos Paternos:</span>
              <span>{sacramento.NombreAbuelosPaternos}</span>
            </div>
            <div className="details-row">
              <span className="label">Abuelos Maternos:</span>
              <span>{sacramento.NombreAbuelosMaternos}</span>
            </div>
          </div>
        );
      
      case 'Comunión':
        return (
          <div className="details-content">
            <h3>Acta de Primera Comunión</h3>
            <div className="details-row">
              <span className="label">Nombre:</span>
              <span>{sacramento.Nombre}</span>
            </div>
            <div className="details-row">
              <span className="label">Día de Comunión:</span>
              <span>{sacramento.DiaComunion}</span>
            </div>
            <div className="details-row">
              <span className="label">Mes de Comunión:</span>
              <span>{sacramento.MesComunion}</span>
            </div>
            <div className="details-row">
              <span className="label">Año de Comunión:</span>
              <span>{sacramento.AnnioComunion}</span>
            </div>
            <div className="details-row">
              <span className="label">Lugar:</span>
              <span>{sacramento.LugarComunion}</span>
            </div>
          </div>
        );
      
      case 'Confirmación':
        return (
          <div className="details-content">
            <h3>Acta de Confirmación</h3>
            <div className="details-row">
              <span className="label">Nombre:</span>
              <span>{sacramento.Nombre}</span>
            </div>
            <div className="details-row">
              <span className="label">Día de Confirmación:</span>
              <span>{sacramento.DiaConfirmacion}</span>
            </div>
            <div className="details-row">
              <span className="label">Mes de Confirmación:</span>
              <span>{sacramento.MesConfirmacion}</span>
            </div>
            <div className="details-row">
              <span className="label">Año de Confirmación:</span>
              <span>{sacramento.AnnioConfirmacion}</span>
            </div>
            <div className="details-row">
              <span className="label">Lugar:</span>
              <span>{sacramento.LugarConfirmacion}</span>
            </div>
          </div>
        );
      
      case 'Matrimonio':
        return (
          <div className="details-content">
            <h3>Acta de Matrimonio</h3>
            <div className="details-row">
              <span className="label">Contrayente 1:</span>
              <span>{sacramento.NombreContrayente}</span>
            </div>
            <div className="details-row">
              <span className="label">Contrayente 2:</span>
              <span>{sacramento.NombreContrayente2}</span>
            </div>
            <div className="details-row">
              <span className="label">Fecha de Matrimonio:</span>
              <span>{sacramento.DiaMatrimonio}/{sacramento.MesMatrimonio}/{sacramento.AnnioMatrimonio}</span>
            </div>
            <div className="details-row">
              <span className="label">Lugar:</span>
              <span>{sacramento.LugarMatrimonio}</span>
            </div>
            <div className="details-row">
              <span className="label">Tomo:</span>
              <span>{sacramento.Tomo}</span>
            </div>
            <div className="details-row">
              <span className="label">Folio:</span>
              <span>{sacramento.Folio}</span>
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
          {renderDetails()}
        </div>
      </div>
    </>
  );
};

export default DetailsDrawer;