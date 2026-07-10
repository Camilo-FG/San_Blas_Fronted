
import { useState } from 'react';
import { Button, cn, Input, Label } from '../../../shared/ui';

const modalInputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm transition-colors focus:border-blue-600 focus:outline-none";

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
            <div className="mb-5">
              <Label>Nombre del bautizado</Label>
              <Input type="text" placeholder="Nombre completo" className={modalInputClass} onChange={(e) => setFormData({...formData, Nombre: e.target.value})} />
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Primer Apellido</Label>
                <Input type="text" className={modalInputClass} onChange={(e) => setFormData({...formData, PrimerApellido: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Segundo Apellido</Label>
                <Input type="text" className={modalInputClass} onChange={(e) => setFormData({...formData, SegundoApellido: e.target.value})} />
              </div>
            </div>
            <div className="mb-5">
              <Label>Cédula</Label>
              <Input type="text" placeholder="0-0000-0000" className={modalInputClass} onChange={(e) => setFormData({...formData, cedula: parseInt(e.target.value) || 0})} />
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Día de celebración</Label>
                <Input 
                  type="text" 
                  placeholder="12" 
                  value={formData.diaTemp}
                  className={modalInputClass}
                  onChange={(e) => actualizarFecha('dia', e.target.value)} 
                />
              </div>
              <div className="mb-5 flex-1">
                <Label>Mes de celebración</Label>
                <Input 
                  type="text" 
                  placeholder="Mayo" 
                  value={formData.mesTemp}
                  className={modalInputClass}
                  onChange={(e) => actualizarFecha('mes', e.target.value)} 
                />
              </div>
              <div className="mb-5 flex-1">
                <Label>Año de celebración</Label>
                <Input 
                  type="text" 
                  placeholder="2026" 
                  value={formData.anioTemp}
                  className={modalInputClass}
                  onChange={(e) => actualizarFecha('anio', e.target.value)} 
                />
              </div>
            </div>
            <div className="mb-5">
              <Label>Lugar de celebración sacramental</Label>
              <Input type="text" placeholder="Santuario San Blas de Nicoya" className={modalInputClass} onChange={(e) => setFormData({...formData, NombreParroquia: e.target.value})} />
            </div>
            <div className="mb-5">
              <Label>Prebísptero</Label>
              <Input type="text" className={modalInputClass} onChange={(e) => setFormData({...formData, Prebispero: e.target.value})} />
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Fecha de nacimiento</Label>
                <Input type="date" className={modalInputClass} onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Hora de nacimiento</Label>
                <Input type="time" className={modalInputClass} onChange={(e) => setFormData({...formData, horaNacimiento: e.target.value})} />
              </div>
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Nombre abuelos paternos</Label>
                <Input type="text" className={modalInputClass} onChange={(e) => setFormData({...formData, NombreAbuelosPaternos: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Nombre abuelos maternos</Label>
                <Input type="text" className={modalInputClass} onChange={(e) => setFormData({...formData, NombreAbuelosMaternos: e.target.value})} />
              </div>
            </div>
          </>
        );
      
      case 'Comunión':
        return (
          <>
            <div className="mb-5">
              <Label>Nombre del comulgante</Label>
              <Input type="text" placeholder="Nombre completo" className={modalInputClass} onChange={(e) => setFormData({...formData, Nombre: e.target.value})} />
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Día de Comunión</Label>
                <Input type="text" placeholder="15" className={modalInputClass} onChange={(e) => setFormData({...formData, DiaComunion: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Mes de Comunión</Label>
                <Input type="text" placeholder="Junio" className={modalInputClass} onChange={(e) => setFormData({...formData, MesComunion: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Año de Comunión</Label>
                <Input type="number" placeholder="2026" className={modalInputClass} onChange={(e) => setFormData({...formData, AnnioComunion: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="mb-5">
              <Label>Lugar de celebración</Label>
              <Input type="text" placeholder="Capilla Curime" className={modalInputClass} onChange={(e) => setFormData({...formData, LugarComunion: e.target.value})} />
            </div>
          </>
        );
      
      case 'Confirmación':
        return (
          <>
            <div className="mb-5">
              <Label>Nombre del confirmando</Label>
              <Input type="text" placeholder="Nombre completo" className={modalInputClass} onChange={(e) => setFormData({...formData, Nombre: e.target.value})} />
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Día de Confirmación</Label>
                <Input type="text" placeholder="22" className={modalInputClass} onChange={(e) => setFormData({...formData, DiaConfirmacion: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Mes de Confirmación</Label>
                <Input type="text" placeholder="Noviembre" className={modalInputClass} onChange={(e) => setFormData({...formData, MesConfirmacion: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Año de Confirmación</Label>
                <Input type="number" placeholder="2026" className={modalInputClass} onChange={(e) => setFormData({...formData, AnnioConfirmacion: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="mb-5">
              <Label>Lugar de celebración</Label>
              <Input type="text" placeholder="Catedral Metropolitana" className={modalInputClass} onChange={(e) => setFormData({...formData, LugarConfirmacion: e.target.value})} />
            </div>
          </>
        );
      
      case 'Matrimonio':
        return (
          <>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Nombre del contrayente 1</Label>
                <Input type="text" placeholder="Nombre completo" className={modalInputClass} onChange={(e) => setFormData({...formData, NombreContrayente: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Nombre del contrayente 2</Label>
                <Input type="text" placeholder="Nombre completo" className={modalInputClass} onChange={(e) => setFormData({...formData, NombreContrayente2: e.target.value})} />
              </div>
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Día de Matrimonio</Label>
                <Input type="text" placeholder="10" className={modalInputClass} onChange={(e) => setFormData({...formData, DiaMatrimonio: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Mes de Matrimonio</Label>
                <Input type="text" placeholder="Diciembre" className={modalInputClass} onChange={(e) => setFormData({...formData, MesMatrimonio: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Año de Matrimonio</Label>
                <Input type="number" placeholder="2026" className={modalInputClass} onChange={(e) => setFormData({...formData, AnnioMatrimonio: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="mb-5">
              <Label>Lugar de celebración</Label>
              <Input type="text" placeholder="Iglesia Santa Ana" className={modalInputClass} onChange={(e) => setFormData({...formData, LugarMatrimonio: e.target.value})} />
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Tomo</Label>
                <Input type="number" className={modalInputClass} onChange={(e) => setFormData({...formData, Tomo: parseInt(e.target.value)})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Folio</Label>
                <Input type="number" className={modalInputClass} onChange={(e) => setFormData({...formData, Folio: parseInt(e.target.value)})} />
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="flex max-h-[90vh] w-[90%] max-w-[800px] flex-col overflow-hidden rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 bg-surface-muted px-6 py-5">
          <h2 className="m-0 text-lg text-slate-800">INSCRIPCIÓN SACRAMENTAL</h2>
          <button type="button" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-3xl text-gray-500 hover:bg-gray-100" onClick={onClose}>×</button>
        </div>

        <div className="flex gap-2 border-b border-gray-200 px-6">
          {tiposSacramento.map((tipo) => (
            <button
              key={tipo}
              type="button"
              className={cn(
                "cursor-pointer border-0 bg-transparent px-5 py-3 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600",
                tipoActivo === tipo && "border-b-2 border-blue-600 text-blue-600",
              )}
              onClick={() => setTipoActivo(tipo)}
            >
              {tipo.toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto p-6">
            {renderForm()}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 bg-surface-muted px-6 py-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              CANCELAR
            </Button>
            <Button type="submit">
              INSCRIBIR ACTA
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSacramentoModal;