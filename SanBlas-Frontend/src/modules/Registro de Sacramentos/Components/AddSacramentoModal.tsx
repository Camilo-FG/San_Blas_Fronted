
import { useState } from 'react';
import './styles/AddSacramentoModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, tipo: string) => void;
}

const tiposSacramento = ['Bautismo', 'Comunión', 'Confirmación', 'Matrimonio'];

const convertirMesANumero = (mes: string): string => {
  const meses: { [key: string]: string } = {
    'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
    'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
    'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
  };
  return meses[mes.toLowerCase()] || '01';
};

const AddSacramentoModal = ({ isOpen, onClose, onSave }: Props) => {
  const [tipoActivo, setTipoActivo] = useState('Bautismo');
  const [formData, setFormData] = useState<any>({
    diaTemp: '',
    mesTemp: '',
    anioTemp: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear una copia sin los campos temporales
    const { diaTemp, mesTemp, anioTemp, ...datosParaGuardar } = formData;
    
    onSave(datosParaGuardar, tipoActivo);
    onClose();
    setFormData({ diaTemp: '', mesTemp: '', anioTemp: '' });
  };

  const actualizarFecha = (campo: 'dia' | 'mes' | 'anio', valor: string) => {
    const nuevosDatos = { ...formData };
    
    if (campo === 'dia') nuevosDatos.diaTemp = valor;
    if (campo === 'mes') nuevosDatos.mesTemp = valor;
    if (campo === 'anio') nuevosDatos.anioTemp = valor;
    
    // Si tenemos los tres campos, formateamos la fecha
    if (nuevosDatos.diaTemp && nuevosDatos.mesTemp && nuevosDatos.anioTemp) {
      const mesNumero = convertirMesANumero(nuevosDatos.mesTemp);
      nuevosDatos.FechaBautismo = `${nuevosDatos.anioTemp}-${mesNumero}-${nuevosDatos.diaTemp.padStart(2, '0')}`;
      nuevosDatos.AnnioBautismo = parseInt(nuevosDatos.anioTemp);
    }
    
    setFormData(nuevosDatos);
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
              <input type="text" placeholder="0-0000-0000" onChange={(e) => setFormData({...formData, cedula: parseInt(e.target.value) || 0})} />
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Día de celebración</label>
                <input 
                  type="text" 
                  placeholder="12" 
                  value={formData.diaTemp}
                  onChange={(e) => actualizarFecha('dia', e.target.value)} 
                />
              </div>
              <div className="modal-form-group">
                <label>Mes de celebración</label>
                <input 
                  type="text" 
                  placeholder="Mayo" 
                  value={formData.mesTemp}
                  onChange={(e) => actualizarFecha('mes', e.target.value)} 
                />
              </div>
              <div className="modal-form-group">
                <label>Año de celebración</label>
                <input 
                  type="text" 
                  placeholder="2026" 
                  value={formData.anioTemp}
                  onChange={(e) => actualizarFecha('anio', e.target.value)} 
                />
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
                <input type="number" placeholder="2026" onChange={(e) => setFormData({...formData, AnnioComunion: parseInt(e.target.value)})} />
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
                <input type="number" placeholder="2026" onChange={(e) => setFormData({...formData, AnnioConfirmacion: parseInt(e.target.value)})} />
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
                <input type="number" placeholder="2026" onChange={(e) => setFormData({...formData, AnnioMatrimonio: parseInt(e.target.value)})} />
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