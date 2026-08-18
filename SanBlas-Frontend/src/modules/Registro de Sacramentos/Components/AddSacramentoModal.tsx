import { useState } from 'react';
import { Button, cn, Input, Label } from '../../../shared/ui';

const getInputClass = (hasError: boolean) =>
  cn(
    "w-full rounded-md border px-3 py-2.5 text-sm transition-colors focus:outline-none",
    hasError
      ? "border-red-500 focus:border-red-600 bg-red-50"
      : "border-gray-300 focus:border-blue-600"
  );

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, tipo: string) => Promise<void> | void;
}

const tiposSacramento = ['Bautismo', 'Comunión', 'Confirmación', 'Matrimonio'];

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const LUGAR_MAX = 250;

const descomponerFecha = (fecha: string) => {
  const [annio, mes, dia] = fecha.split('-');
  return { dia, mes: parseInt(mes), annio: parseInt(annio) };
};

const AddSacramentoModal = ({ isOpen, onClose, onSave }: Props) => {
  const [tipoActivo, setTipoActivo] = useState('Bautismo');
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const setField = (campo: string, valor: any) => {
    setFormData({ ...formData, [campo]: valor });
    setErrors((prev) => ({ ...prev, [campo]: false }));
  };

  const getCamposObligatorios = (): string[] => {
    switch (tipoActivo) {
      case 'Bautismo':
        return ['Nombre', 'PrimerApellido', 'SegundoApellido', 'cedula', 'FechaBautismo', 'NombreParroquia', 'Tomo', 'Folio', 'Asiento'];
      case 'Comunión':
        return ['FechaComunion', 'LugarComunion'];
      case 'Confirmación':
        return ['FechaConfirmacion', 'LugarConfirmacion'];
      case 'Matrimonio':
        return ['NombreContrayente1', 'Apellido1Contrayente1', 'NombreContrayente2', 'Apellido1Contrayente2', 'FechaMatrimonio', 'LugarMatrimonio', 'Tomo', 'Folio'];
      default:
        return [];
    }
  };

  const esValido = (valor: any): boolean =>
    valor !== undefined && valor !== null && String(valor).trim() !== '' && Number(valor) !== 0;

  const prepararDatos = (datos: any): any => {
    if (tipoActivo === 'Bautismo') {
      const {
        NombreAbueloPaterno1, Apellido1AbueloPaterno1, Apellido2AbueloPaterno1,
        NombreAbueloPaterno2, Apellido1AbueloPaterno2, Apellido2AbueloPaterno2,
        NombreAbueloMaterno1, Apellido1AbueloMaterno1, Apellido2AbueloMaterno1,
        NombreAbueloMaterno2, Apellido1AbueloMaterno2, Apellido2AbueloMaterno2,
        cedula, ...rest
      } = datos;

      const nombrePaterno1 = [NombreAbueloPaterno1, Apellido1AbueloPaterno1, Apellido2AbueloPaterno1].filter(Boolean).join(' ');
      const nombrePaterno2 = [NombreAbueloPaterno2, Apellido1AbueloPaterno2, Apellido2AbueloPaterno2].filter(Boolean).join(' ');
      const nombreMaterno1 = [NombreAbueloMaterno1, Apellido1AbueloMaterno1, Apellido2AbueloMaterno1].filter(Boolean).join(' ');
      const nombreMaterno2 = [NombreAbueloMaterno2, Apellido1AbueloMaterno2, Apellido2AbueloMaterno2].filter(Boolean).join(' ');

      return {
        ...rest,
        cedula: parseInt(String(cedula).replace(/\D/g, '')) || 0,
        NombreAbuelosPaternos: [nombrePaterno1, nombrePaterno2].filter(Boolean).join(' y '),
        NombreAbuelosMaternos: [nombreMaterno1, nombreMaterno2].filter(Boolean).join(' y '),
      };
    }
    if (tipoActivo === 'Comunión') {
      const { FechaComunion, ...rest } = datos;
      const { dia, mes, annio } = descomponerFecha(FechaComunion);
      return { ...rest, DiaComunion: dia, MesComunion: MESES[mes - 1], AnnioComunion: annio };
    }
    if (tipoActivo === 'Confirmación') {
      const { FechaConfirmacion, ...rest } = datos;
      const { dia, mes, annio } = descomponerFecha(FechaConfirmacion);
      return { ...rest, DiaConfirmacion: dia, MesConfirmacion: MESES[mes - 1], AnnioConfirmacion: annio };
    }
    if (tipoActivo === 'Matrimonio') {
      const { FechaMatrimonio, NombreContrayente1, Apellido1Contrayente1, Apellido2Contrayente1, NombreContrayente2, Apellido1Contrayente2, Apellido2Contrayente2, ...rest } = datos;
      const { dia, mes, annio } = descomponerFecha(FechaMatrimonio);
      return {
        ...rest,
        NombreContrayente: [NombreContrayente1, Apellido1Contrayente1, Apellido2Contrayente1].filter(Boolean).join(' '),
        NombreContrayente2: [NombreContrayente2, Apellido1Contrayente2, Apellido2Contrayente2].filter(Boolean).join(' '),
        DiaMatrimonio: dia,
        MesMatrimonio: MESES[mes - 1],
        AnnioMatrimonio: annio,
      };
    }
    return datos;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    const nuevosErrores: Record<string, boolean> = {};
    getCamposObligatorios().forEach((campo) => {
      if (!esValido(formData[campo])) nuevosErrores[campo] = true;
    });

    if (tipoActivo === 'Bautismo' && !/^[0-9]-\d{4}-\d{4}$/.test(String(formData.cedula || ''))) {
      nuevosErrores.cedula = true;
    }

    if (
      tipoActivo === 'Bautismo' &&
      formData.fechaNacimiento &&
      formData.FechaBautismo &&
      formData.FechaBautismo <= formData.fechaNacimiento
    ) {
      nuevosErrores.FechaBautismo = true;
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrors(nuevosErrores);
      return;
    }

    setSaving(true);
    try {
      await onSave(prepararDatos(formData), tipoActivo);
      onClose();
      setFormData({});
      setErrors({});
    } finally {
      setSaving(false);
    }
  };

  const contadorLugar = (valor: any) => (
    <div className="mt-1 text-right text-xs text-gray-400">
      {String(valor || '').length}/{LUGAR_MAX}
    </div>
  );

  const renderForm = () => {
    switch (tipoActivo) {
      case 'Bautismo':
        return (
          <>
            <div className="mb-5">
              <Label>Nombre del bautizado</Label>
              <Input type="text" maxLength={80} value={formData.Nombre || ''} className={getInputClass(errors['Nombre'])} onChange={(e) => setField('Nombre', e.target.value)} />
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Primer Apellido</Label>
                <Input type="text" maxLength={80} value={formData.PrimerApellido || ''} className={getInputClass(errors['PrimerApellido'])} onChange={(e) => setField('PrimerApellido', e.target.value)} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Segundo Apellido</Label>
                <Input type="text" maxLength={80} value={formData.SegundoApellido || ''} className={getInputClass(errors['SegundoApellido'])} onChange={(e) => setField('SegundoApellido', e.target.value)} />
              </div>
            </div>
            <div className="mb-5">
              <Label>Cédula</Label>
              <Input type="text" placeholder="0-0000-0000" maxLength={12} value={formData.cedula || ''} className={getInputClass(errors['cedula'])} onChange={(e) => setField('cedula', e.target.value)} />
            </div>
            <div className="mb-5">
              <Label>Fecha de celebración</Label>
              <Input type="date" value={formData.FechaBautismo || ''} className={getInputClass(errors['FechaBautismo'])} onChange={(e) => {
                const valor = e.target.value;
                setFormData((prev) => ({ ...prev, FechaBautismo: valor, AnnioBautismo: valor ? parseInt(valor.slice(0, 4)) : undefined }));
                setErrors((prev) => ({ ...prev, FechaBautismo: false }));
              }} />
            </div>
            <div className="mb-5">
              <Label>Lugar de celebración sacramental</Label>
              <Input type="text" placeholder="Santuario San Blas de Nicoya" maxLength={LUGAR_MAX} value={formData.NombreParroquia || ''} className={getInputClass(errors['NombreParroquia'])} onChange={(e) => setField('NombreParroquia', e.target.value)} />
              {contadorLugar(formData.NombreParroquia)}
            </div>
            <div className="mb-5">
              <Label>Prebísptero</Label>
              <Input type="text" maxLength={120} value={formData.Prebispero || ''} className={getInputClass(false)} onChange={(e) => setField('Prebispero', e.target.value)} />
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Fecha de nacimiento</Label>
                <Input type="date" value={formData.fechaNacimiento || ''} className={getInputClass(false)} onChange={(e) => setField('fechaNacimiento', e.target.value)} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Hora de nacimiento</Label>
                <Input type="time" value={formData.horaNacimiento || ''} className={getInputClass(false)} onChange={(e) => setField('horaNacimiento', e.target.value)} />
              </div>
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Tomo</Label>
                <Input type="number" value={formData.Tomo ?? ''} className={getInputClass(errors['Tomo'])} onChange={(e) => setField('Tomo', parseInt(e.target.value) || '')} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Folio</Label>
                <Input type="number" value={formData.Folio ?? ''} className={getInputClass(errors['Folio'])} onChange={(e) => setField('Folio', parseInt(e.target.value) || '')} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Asiento</Label>
                <Input type="number" value={formData.Asiento ?? ''} className={getInputClass(errors['Asiento'])} onChange={(e) => setField('Asiento', parseInt(e.target.value) || '')} />
              </div>
            </div>
            <div className="mb-0">
              <Label>Abuelos Paternos</Label>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <Input type="text" placeholder="Nombre abuelo 1" maxLength={80} value={formData.NombreAbueloPaterno1 || ''} className={getInputClass(false)} onChange={(e) => setField('NombreAbueloPaterno1', e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <Input type="text" placeholder="Primer Apellido" maxLength={80} value={formData.Apellido1AbueloPaterno1 || ''} className={getInputClass(false)} onChange={(e) => setField('Apellido1AbueloPaterno1', e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <Input type="text" placeholder="Segundo Apellido" maxLength={80} value={formData.Apellido2AbueloPaterno1 || ''} className={getInputClass(false)} onChange={(e) => setField('Apellido2AbueloPaterno1', e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <Input type="text" placeholder="Nombre abuelo 2" maxLength={80} value={formData.NombreAbueloPaterno2 || ''} className={getInputClass(false)} onChange={(e) => setField('NombreAbueloPaterno2', e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <Input type="text" placeholder="Primer Apellido" maxLength={80} value={formData.Apellido1AbueloPaterno2 || ''} className={getInputClass(false)} onChange={(e) => setField('Apellido1AbueloPaterno2', e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <Input type="text" placeholder="Segundo Apellido" maxLength={80} value={formData.Apellido2AbueloPaterno2 || ''} className={getInputClass(false)} onChange={(e) => setField('Apellido2AbueloPaterno2', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-0 mt-5">
              <Label>Abuelos Maternos</Label>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <Input type="text" placeholder="Nombre abuelo 1" maxLength={80} value={formData.NombreAbueloMaterno1 || ''} className={getInputClass(false)} onChange={(e) => setField('NombreAbueloMaterno1', e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <Input type="text" placeholder="Primer Apellido" maxLength={80} value={formData.Apellido1AbueloMaterno1 || ''} className={getInputClass(false)} onChange={(e) => setField('Apellido1AbueloMaterno1', e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <Input type="text" placeholder="Segundo Apellido" maxLength={80} value={formData.Apellido2AbueloMaterno1 || ''} className={getInputClass(false)} onChange={(e) => setField('Apellido2AbueloMaterno1', e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <Input type="text" placeholder="Nombre abuelo 2" maxLength={80} value={formData.NombreAbueloMaterno2 || ''} className={getInputClass(false)} onChange={(e) => setField('NombreAbueloMaterno2', e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <Input type="text" placeholder="Primer Apellido" maxLength={80} value={formData.Apellido1AbueloMaterno2 || ''} className={getInputClass(false)} onChange={(e) => setField('Apellido1AbueloMaterno2', e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <Input type="text" placeholder="Segundo Apellido" maxLength={80} value={formData.Apellido2AbueloMaterno2 || ''} className={getInputClass(false)} onChange={(e) => setField('Apellido2AbueloMaterno2', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'Comunión':
        return (
          <>
            <div className="mb-5">
              <Label>Fecha de Comunión</Label>
              <Input type="date" value={formData.FechaComunion || ''} className={getInputClass(errors['FechaComunion'])} onChange={(e) => setField('FechaComunion', e.target.value)} />
            </div>
            <div className="mb-5">
              <Label>Lugar de celebración</Label>
              <Input type="text" placeholder="Capilla Curime" maxLength={LUGAR_MAX} value={formData.LugarComunion || ''} className={getInputClass(errors['LugarComunion'])} onChange={(e) => setField('LugarComunion', e.target.value)} />
              {contadorLugar(formData.LugarComunion)}
            </div>
          </>
        );

      case 'Confirmación':
        return (
          <>
            <div className="mb-5">
              <Label>Fecha de Confirmación</Label>
              <Input type="date" value={formData.FechaConfirmacion || ''} className={getInputClass(errors['FechaConfirmacion'])} onChange={(e) => setField('FechaConfirmacion', e.target.value)} />
            </div>
            <div className="mb-5">
              <Label>Lugar de celebración</Label>
              <Input type="text" placeholder="Catedral Metropolitana" maxLength={LUGAR_MAX} value={formData.LugarConfirmacion || ''} className={getInputClass(errors['LugarConfirmacion'])} onChange={(e) => setField('LugarConfirmacion', e.target.value)} />
              {contadorLugar(formData.LugarConfirmacion)}
            </div>
          </>
        );

      case 'Matrimonio':
        return (
          <>
            <div className="mb-0">
              <Label>Contrayente 1</Label>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <Input type="text" placeholder="Nombre" maxLength={80} value={formData.NombreContrayente1 || ''} className={getInputClass(errors['NombreContrayente1'])} onChange={(e) => setField('NombreContrayente1', e.target.value)} />
                </div>
                <div className="flex-1">
                  <Input type="text" placeholder="Primer Apellido" maxLength={80} value={formData.Apellido1Contrayente1 || ''} className={getInputClass(errors['Apellido1Contrayente1'])} onChange={(e) => setField('Apellido1Contrayente1', e.target.value)} />
                </div>
                <div className="flex-1">
                  <Input type="text" placeholder="Segundo Apellido" maxLength={80} value={formData.Apellido2Contrayente1 || ''} className={getInputClass(false)} onChange={(e) => setField('Apellido2Contrayente1', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="mb-0 mt-5">
              <Label>Contrayente 2</Label>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <Input type="text" placeholder="Nombre" maxLength={80} value={formData.NombreContrayente2 || ''} className={getInputClass(errors['NombreContrayente2'])} onChange={(e) => setField('NombreContrayente2', e.target.value)} />
                </div>
                <div className="flex-1">
                  <Input type="text" placeholder="Primer Apellido" maxLength={80} value={formData.Apellido1Contrayente2 || ''} className={getInputClass(errors['Apellido1Contrayente2'])} onChange={(e) => setField('Apellido1Contrayente2', e.target.value)} />
                </div>
                <div className="flex-1">
                  <Input type="text" placeholder="Segundo Apellido" maxLength={80} value={formData.Apellido2Contrayente2 || ''} className={getInputClass(false)} onChange={(e) => setField('Apellido2Contrayente2', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="mb-5 mt-5">
              <Label>Fecha de Matrimonio</Label>
              <Input type="date" value={formData.FechaMatrimonio || ''} className={getInputClass(errors['FechaMatrimonio'])} onChange={(e) => setField('FechaMatrimonio', e.target.value)} />
            </div>
            <div className="mb-5">
              <Label>Lugar de celebración</Label>
              <Input type="text" placeholder="Iglesia Santa Ana" maxLength={LUGAR_MAX} value={formData.LugarMatrimonio || ''} className={getInputClass(errors['LugarMatrimonio'])} onChange={(e) => setField('LugarMatrimonio', e.target.value)} />
              {contadorLugar(formData.LugarMatrimonio)}
            </div>
            <div className="mb-0 flex flex-col gap-4 sm:flex-row">
              <div className="mb-5 flex-1">
                <Label>Tomo</Label>
                <Input type="number" value={formData.Tomo ?? ''} className={getInputClass(errors['Tomo'])} onChange={(e) => setField('Tomo', parseInt(e.target.value) || '')} />
              </div>
              <div className="mb-5 flex-1">
                <Label>Folio</Label>
                <Input type="number" value={formData.Folio ?? ''} className={getInputClass(errors['Folio'])} onChange={(e) => setField('Folio', parseInt(e.target.value) || '')} />
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

        <form onSubmit={handleSubmit} noValidate>
          <div className="max-h-[60vh] overflow-y-auto p-6">
            {renderForm()}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 bg-surface-muted px-6 py-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              CANCELAR
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "GUARDANDO..." : "INSCRIBIR ACTA"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSacramentoModal;