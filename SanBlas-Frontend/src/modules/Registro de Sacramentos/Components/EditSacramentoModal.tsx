// src/modules/dashboard/components/EditSacramentoModal.tsx
import { useState, useEffect } from 'react';
import './styles/EditSacramentoModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, tipo: string) => void;
  sacramento: any;
  tipo: string;
}

const EditSacramentoModal = ({ isOpen, onClose, onSave, sacramento, tipo }: Props) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (sacramento) {
      setFormData(sacramento);
    }
  }, [sacramento]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, tipo);
    onClose();
  };

  const renderForm = () => {
    switch (tipo) {
      case 'Bautismo':
        return (
          <>
            <div className="modal-form-group">
              <label>Nombre del bautizado</label>
              <input type="text" value={formData.Nombre || ''} onChange={(e) => setFormData({...formData, Nombre: e.target.value})} />
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Primer Apellido</label>
                <input type="text" value={formData.PrimerApellido || ''} onChange={(e) => setFormData({...formData, PrimerApellido: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Segundo Apellido</label>
                <input type="text" value={formData.SegundoApellido || ''} onChange={(e) => setFormData({...formData, SegundoApellido: e.target.value})} />
              </div>
            </div>
            <div className="modal-form-group">
              <label>Cédula</label>
              <input type="text" value={formData.cedula || ''} onChange={(e) => setFormData({...formData, cedula: e.target.value})} />
            </div>
            <div className="modal-form-group">
              <label>Fecha de Bautismo</label>
              <input type="date" value={formData.FechaBautismo || ''} onChange={(e) => setFormData({...formData, FechaBautismo: e.target.value})} />
            </div>
            <div className="modal-form-group">
              <label>Año de Bautismo</label>
              <input type="number" value={formData.AnnioBautismo || ''} onChange={(e) => setFormData({...formData, AnnioBautismo: parseInt(e.target.value)})} />
            </div>
            <div className="modal-form-group">
              <label>Parroquia</label>
              <input type="text" value={formData.NombreParroquia || ''} onChange={(e) => setFormData({...formData, NombreParroquia: e.target.value})} />
            </div>
            <div className="modal-form-group">
              <label>Prebísptero</label>
              <input type="text" value={formData.Prebispero || ''} onChange={(e) => setFormData({...formData, Prebispero: e.target.value})} />
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Fecha de nacimiento</label>
                <input type="date" value={formData.fechaNacimiento || ''} onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Hora de nacimiento</label>
                <input type="time" value={formData.horaNacimiento || ''} onChange={(e) => setFormData({...formData, horaNacimiento: e.target.value})} />
              </div>
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Abuelos Paternos</label>
                <input type="text" value={formData.NombreAbuelosPaternos || ''} onChange={(e) => setFormData({...formData, NombreAbuelosPaternos: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Abuelos Maternos</label>
                <input type="text" value={formData.NombreAbuelosMaternos || ''} onChange={(e) => setFormData({...formData, NombreAbuelosMaternos: e.target.value})} />
              </div>
            </div>
          </>
        );
      
      case 'Comunión':
        return (
          <>
            <div className="modal-form-group">
              <label>Nombre del comulgante</label>
              <input type="text" value={formData.Nombre || ''} onChange={(e) => setFormData({...formData, Nombre: e.target.value})} />
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Día de Comunión</label>
                <input type="text" value={formData.DiaComunion || ''} onChange={(e) => setFormData({...formData, DiaComunion: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Mes de Comunión</label>
                <input type="text" value={formData.MesComunion || ''} onChange={(e) => setFormData({...formData, MesComunion: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Año de Comunión</label>
                <input type="number" value={formData.AnnioComunion || ''} onChange={(e) => setFormData({...formData, AnnioComunion: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="modal-form-group">
              <label>Lugar</label>
              <input type="text" value={formData.LugarComunion || ''} onChange={(e) => setFormData({...formData, LugarComunion: e.target.value})} />
            </div>
          </>
        );
      
      case 'Confirmación':
        return (
          <>
            <div className="modal-form-group">
              <label>Nombre del confirmando</label>
              <input type="text" value={formData.Nombre || ''} onChange={(e) => setFormData({...formData, Nombre: e.target.value})} />
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Día de Confirmación</label>
                <input type="text" value={formData.DiaConfirmacion || ''} onChange={(e) => setFormData({...formData, DiaConfirmacion: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Mes de Confirmación</label>
                <input type="text" value={formData.MesConfirmacion || ''} onChange={(e) => setFormData({...formData, MesConfirmacion: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Año de Confirmación</label>
                <input type="number" value={formData.AnnioConfirmacion || ''} onChange={(e) => setFormData({...formData, AnnioConfirmacion: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="modal-form-group">
              <label>Lugar</label>
              <input type="text" value={formData.LugarConfirmacion || ''} onChange={(e) => setFormData({...formData, LugarConfirmacion: e.target.value})} />
            </div>
          </>
        );
      
      case 'Matrimonio':
        return (
          <>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Contrayente 1</label>
                <input type="text" value={formData.NombreContrayente || ''} onChange={(e) => setFormData({...formData, NombreContrayente: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Contrayente 2</label>
                <input type="text" value={formData.NombreContrayente2 || ''} onChange={(e) => setFormData({...formData, NombreContrayente2: e.target.value})} />
              </div>
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Día de Matrimonio</label>
                <input type="text" value={formData.DiaMatrimonio || ''} onChange={(e) => setFormData({...formData, DiaMatrimonio: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Mes de Matrimonio</label>
                <input type="text" value={formData.MesMatrimonio || ''} onChange={(e) => setFormData({...formData, MesMatrimonio: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Año de Matrimonio</label>
                <input type="number" value={formData.AnnioMatrimonio || ''} onChange={(e) => setFormData({...formData, AnnioMatrimonio: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="modal-form-group">
              <label>Lugar</label>
              <input type="text" value={formData.LugarMatrimonio || ''} onChange={(e) => setFormData({...formData, LugarMatrimonio: e.target.value})} />
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Tomo</label>
                <input type="number" value={formData.Tomo || ''} onChange={(e) => setFormData({...formData, Tomo: parseInt(e.target.value)})} />
              </div>
              <div className="modal-form-group">
                <label>Folio</label>
                <input type="number" value={formData.Folio || ''} onChange={(e) => setFormData({...formData, Folio: parseInt(e.target.value)})} />
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>EDITAR {tipo.toUpperCase()}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {renderForm()}
          </div>

          <div className="modal-footer">
            <button type="button" className="modal-btn modal-btn--secondary" onClick={onClose}>
              CANCELAR
            </button>
            <button type="submit" className="modal-btn modal-btn--primary">
              GUARDAR CAMBIOS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSacramentoModal;