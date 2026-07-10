
import { useState, useEffect } from 'react';
import { Button, Input, Label } from '../../../shared/ui';

const modalInputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm transition-colors focus:border-blue-600 focus:outline-none";

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
            <div className="mb-5">
              <Label>Nombre del bautizado</Label>
              <Input type="text" value={formData.Nombre || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, Nombre: e.target.value})} />
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Primer Apellido</Label>
                <Input type="text" value={formData.PrimerApellido || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, PrimerApellido: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Segundo Apellido</Label>
                <Input type="text" value={formData.SegundoApellido || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, SegundoApellido: e.target.value})} />
              </div>
            </div>
            <div className="mb-5">
              <Label>Cédula</Label>
              <Input type="text" value={formData.cedula || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, cedula: e.target.value})} />
            </div>
            <div className="mb-5">
              <Label>Fecha de Bautismo</Label>
              <Input type="date" value={formData.FechaBautismo || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, FechaBautismo: e.target.value})} />
            </div>
            <div className="mb-5">
              <Label>Año de Bautismo</Label>
              <Input type="number" value={formData.AnnioBautismo || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, AnnioBautismo: parseInt(e.target.value)})} />
            </div>
            <div className="mb-5">
              <Label>Parroquia</Label>
              <Input type="text" value={formData.NombreParroquia || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, NombreParroquia: e.target.value})} />
            </div>
            <div className="mb-5">
              <Label>Prebísptero</Label>
              <Input type="text" value={formData.Prebispero || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, Prebispero: e.target.value})} />
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Fecha de nacimiento</Label>
                <Input type="date" value={formData.fechaNacimiento || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Hora de nacimiento</Label>
                <Input type="time" value={formData.horaNacimiento || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, horaNacimiento: e.target.value})} />
              </div>
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Abuelos Paternos</Label>
                <Input type="text" value={formData.NombreAbuelosPaternos || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, NombreAbuelosPaternos: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Abuelos Maternos</Label>
                <Input type="text" value={formData.NombreAbuelosMaternos || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, NombreAbuelosMaternos: e.target.value})} />
              </div>
            </div>
          </>
        );
      
      case 'Comunión':
        return (
          <>
            <div className="mb-5">
              <Label>Nombre del comulgante</Label>
              <Input type="text" value={formData.Nombre || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, Nombre: e.target.value})} />
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Día de Comunión</Label>
                <Input type="text" value={formData.DiaComunion || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, DiaComunion: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Mes de Comunión</Label>
                <Input type="text" value={formData.MesComunion || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, MesComunion: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Año de Comunión</Label>
                <Input type="number" value={formData.AnnioComunion || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, AnnioComunion: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="mb-5">
              <Label>Lugar</Label>
              <Input type="text" value={formData.LugarComunion || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, LugarComunion: e.target.value})} />
            </div>
          </>
        );
      
      case 'Confirmación':
        return (
          <>
            <div className="mb-5">
              <Label>Nombre del confirmando</Label>
              <Input type="text" value={formData.Nombre || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, Nombre: e.target.value})} />
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Día de Confirmación</Label>
                <Input type="text" value={formData.DiaConfirmacion || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, DiaConfirmacion: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Mes de Confirmación</Label>
                <Input type="text" value={formData.MesConfirmacion || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, MesConfirmacion: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Año de Confirmación</Label>
                <Input type="number" value={formData.AnnioConfirmacion || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, AnnioConfirmacion: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="mb-5">
              <Label>Lugar</Label>
              <Input type="text" value={formData.LugarConfirmacion || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, LugarConfirmacion: e.target.value})} />
            </div>
          </>
        );
      
      case 'Matrimonio':
        return (
          <>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Contrayente 1</Label>
                <Input type="text" value={formData.NombreContrayente || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, NombreContrayente: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Contrayente 2</Label>
                <Input type="text" value={formData.NombreContrayente2 || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, NombreContrayente2: e.target.value})} />
              </div>
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Día de Matrimonio</Label>
                <Input type="text" value={formData.DiaMatrimonio || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, DiaMatrimonio: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Mes de Matrimonio</Label>
                <Input type="text" value={formData.MesMatrimonio || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, MesMatrimonio: e.target.value})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Año de Matrimonio</Label>
                <Input type="number" value={formData.AnnioMatrimonio || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, AnnioMatrimonio: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="mb-5">
              <Label>Lugar</Label>
              <Input type="text" value={formData.LugarMatrimonio || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, LugarMatrimonio: e.target.value})} />
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Tomo</Label>
                <Input type="number" value={formData.Tomo || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, Tomo: parseInt(e.target.value)})} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Folio</Label>
                <Input type="number" value={formData.Folio || ''} className={modalInputClass} onChange={(e) => setFormData({...formData, Folio: parseInt(e.target.value)})} />
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
          <h2 className="m-0 text-lg text-slate-800">EDITAR {tipo.toUpperCase()}</h2>
          <button type="button" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-3xl text-gray-500 hover:bg-gray-100" onClick={onClose}>×</button>
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
              GUARDAR CAMBIOS
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSacramentoModal;
