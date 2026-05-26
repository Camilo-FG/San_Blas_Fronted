// src/modules/Registro de Sacramentos/Components/AddSacramentoModal.tsx
import { useState } from 'react';
import './styles/AddSacramentoModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, tipo: string) => void;
}

const tiposSacramento = ['Bautismo', 'Comunión', 'Confirmación', 'Matrimonio'];

const AddSacramentoModal = ({ isOpen, onClose, onSave }: Props) => {
  const [tipoActivo, setTipoActivo] = useState('Bautismo');
  const [formData, setFormData] = useState<any>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, tipoActivo);
    onClose();
    setFormData({});
  };

  const renderForm = () => {
    switch (tipoActivo) {
      case 'Bautismo':
        return (
          <>
            <div className="modal-form-group">
              <label>Nombre del bautizado</label>
              <input type="text" placeholder="Nombre completo" onChange={(e) => setFormData({...formData, Nombre: e.target.value})} />
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Primer Apellido</label>
                <input type="text" onChange={(e) => setFormData({...formData, PrimerApellido: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Segundo Apellido</label>
                <input type="text" onChange={(e) => setFormData({...formData, SegundoApellido: e.target.value})} />
              </div>
            </div>
            <div className="modal-form-group">
              <label>Cédula</label>
              <input type="text" placeholder="0-0000-0000" onChange={(e) => setFormData({...formData, cedula: e.target.value})} />
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Día de celebración</label>
                <input type="text" placeholder="12" onChange={(e) => setFormData({...formData, FechaBautismo: `${e.target.value}/??/????`})} />
              </div>
              <div className="modal-form-group">
                <label>Mes de celebración</label>
                <input type="text" placeholder="Mayo" onChange={(e) => setFormData({...formData, Mes: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Año de celebración</label>
                <input type="text" placeholder="2026" onChange={(e) => setFormData({...formData, AnnioBautismo: e.target.value})} />
              </div>
            </div>
            <div className="modal-form-group">
              <label>Lugar de celebración sacramental</label>
              <input type="text" placeholder="Santuario San Blas de Nicoya" onChange={(e) => setFormData({...formData, NombreParroquia: e.target.value})} />
            </div>
            <div className="modal-form-group">
              <label>Prebísptero</label>
              <input type="text" onChange={(e) => setFormData({...formData, Prebispero: e.target.value})} />
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Fecha de nacimiento</label>
                <input type="date" onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Hora de nacimiento</label>
                <input type="time" onChange={(e) => setFormData({...formData, horaNacimiento: e.target.value})} />
              </div>
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Nombre abuelos paternos</label>
                <input type="text" onChange={(e) => setFormData({...formData, NombreAbuelosPaternos: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Nombre abuelos maternos</label>
                <input type="text" onChange={(e) => setFormData({...formData, NombreAbuelosMaternos: e.target.value})} />
              </div>
            </div>
          </>
        );
      
      case 'Comunión':
        return (
          <>
            <div className="modal-form-group">
              <label>Nombre del comulgante</label>
              <input type="text" placeholder="Nombre completo" onChange={(e) => setFormData({...formData, Nombre: e.target.value})} />
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Día de Comunión</label>
                <input type="text" placeholder="15" onChange={(e) => setFormData({...formData, DiaComunion: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Mes de Comunión</label>
                <input type="text" placeholder="Junio" onChange={(e) => setFormData({...formData, MesComunion: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Año de Comunión</label>
                <input type="text" placeholder="2026" onChange={(e) => setFormData({...formData, AnnioComunion: e.target.value})} />
              </div>
            </div>
            <div className="modal-form-group">
              <label>Lugar de celebración</label>
              <input type="text" placeholder="Capilla Curime" onChange={(e) => setFormData({...formData, LugarComunion: e.target.value})} />
            </div>
          </>
        );
      
      case 'Confirmación':
        return (
          <>
            <div className="modal-form-group">
              <label>Nombre del confirmando</label>
              <input type="text" placeholder="Nombre completo" onChange={(e) => setFormData({...formData, Nombre: e.target.value})} />
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Día de Confirmación</label>
                <input type="text" placeholder="22" onChange={(e) => setFormData({...formData, DiaConfirmacion: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Mes de Confirmación</label>
                <input type="text" placeholder="Noviembre" onChange={(e) => setFormData({...formData, MesConfirmacion: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Año de Confirmación</label>
                <input type="text" placeholder="2026" onChange={(e) => setFormData({...formData, AnnioConfirmacion: e.target.value})} />
              </div>
            </div>
            <div className="modal-form-group">
              <label>Lugar de celebración</label>
              <input type="text" placeholder="Catedral Metropolitana" onChange={(e) => setFormData({...formData, LugarConfirmacion: e.target.value})} />
            </div>
          </>
        );
      
      case 'Matrimonio':
        return (
          <>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Nombre del contrayente 1</label>
                <input type="text" placeholder="Nombre completo" onChange={(e) => setFormData({...formData, NombreContrayente: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Nombre del contrayente 2</label>
                <input type="text" placeholder="Nombre completo" onChange={(e) => setFormData({...formData, NombreContrayente2: e.target.value})} />
              </div>
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Día de Matrimonio</label>
                <input type="text" placeholder="10" onChange={(e) => setFormData({...formData, DiaMatrimonio: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Mes de Matrimonio</label>
                <input type="text" placeholder="Diciembre" onChange={(e) => setFormData({...formData, MesMatrimonio: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>Año de Matrimonio</label>
                <input type="text" placeholder="2026" onChange={(e) => setFormData({...formData, AnnioMatrimonio: e.target.value})} />
              </div>
            </div>
            <div className="modal-form-group">
              <label>Lugar de celebración</label>
              <input type="text" placeholder="Iglesia Santa Ana" onChange={(e) => setFormData({...formData, LugarMatrimonio: e.target.value})} />
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Tomo</label>
                <input type="number" onChange={(e) => setFormData({...formData, Tomo: parseInt(e.target.value)})} />
              </div>
              <div className="modal-form-group">
                <label>Folio</label>
                <input type="number" onChange={(e) => setFormData({...formData, Folio: parseInt(e.target.value)})} />
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
          <h2>INSCRIPCIÓN SACRAMENTAL</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          {tiposSacramento.map((tipo) => (
            <button
              key={tipo}
              className={`modal-tab ${tipoActivo === tipo ? 'modal-tab--active' : ''}`}
              onClick={() => setTipoActivo(tipo)}
            >
              {tipo.toUpperCase()}
            </button>
          ))}
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
              INSCRIBIR ACTA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSacramentoModal;