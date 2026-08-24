import { useState, useEffect, useRef } from 'react';
import { Button, cn, Input, Label, useToast } from '../../../shared/ui';
import { normalizarCamposNombres } from '../Utils/normalizarNombres';

const modalInputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm transition-colors focus:border-blue-600 focus:outline-none";

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
  onSave: (datos: Record<string, any>, tipoOriginal: string) => Promise<void> | void;
  sacramento: any;
  tipo: string;
}

const tiposSacramento = ['Bautismo', 'Comunión', 'Confirmación', 'Matrimonio'];

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const LUGAR_MAX = 250;

const get = (obj: any, keys: string[]): any => {
  for (const key of keys) {
    const v = obj?.[key];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return '';
};

const descomponerFecha = (fecha: string) => {
  const [annio, mes, dia] = (fecha || '').split('-');
  return { dia: dia || '', mes: mes ? parseInt(mes) : NaN, annio: annio || '' };
};

const mesDesdePartes = (dia: any, mes: any, annio: any): string => {
  if (dia && annio) {
    const idx = MESES.findIndex((m) => m.toLowerCase() === String(mes || '').toLowerCase());
    const mesNum = idx >= 0 ? idx + 1 : Number(mes) || NaN;
    if (!isNaN(mesNum) && mesNum >= 1 && mesNum <= 12) {
      return `${annio}-${String(mesNum).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    }
  }
  return '';
};

const EditSacramentoModal = ({ isOpen, onClose, onSave, sacramento, tipo }: Props) => {
  const { showToast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [secciones, setSecciones] = useState<Record<string, any>>({
    Bautismo: {},
    'Comunión': {},
    'Confirmación': {},
    'Matrimonio': {},
  });
  const [activeTab, setActiveTab] = useState(tipo);
  const [saving, setSaving] = useState(false);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const container = containerRef.current;
    const handleScroll = () => {
      if (isScrollingRef.current) return;
      const sections = tiposSacramento.map(t => sectionRefs.current[t]).filter(Boolean) as HTMLElement[];
      let current = '';
      let minDistance = Infinity;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const distance = Math.abs(rect.top - containerRect.top);
        if (distance < minDistance) {
          minDistance = distance;
          current = tiposSacramento.find(t => sectionRefs.current[t] === section) || '';
        }
      }
      if (current) setActiveTab(current);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  useEffect(() => {
    if (!sacramento) return;
    const s: any = {};

    s.Bautismo = {
      id: get(sacramento, ['id']),
      Nombre: get(sacramento, ['nombre', 'Nombre']),
      PrimerApellido: get(sacramento, ['primerApellido', 'PrimerApellido']),
      SegundoApellido: get(sacramento, ['segundoApellido', 'SegundoApellido']),
      cedula: get(sacramento, ['cedula', 'Cedula']),
      fechaBautismo: get(sacramento, ['fechaBautismo', 'FechaBautismo']),
      annioBautismo: get(sacramento, ['annioBautismo', 'AnnioBautismo']),
      nombreParroquia: get(sacramento, ['nombreParroquia', 'NombreParroquia']),
      prebispero: get(sacramento, ['prebispero', 'Prebispero']),
      fechaNacimiento: get(sacramento, ['fechaNacimiento', 'FechaNacimiento']),
      horaNacimiento: get(sacramento, ['horaNacimiento', 'HoraNacimiento']),
      nombreAbuelosPaternos: get(sacramento, ['nombreAbuelosPaternos', 'NombreAbuelosPaternos']),
      nombreAbuelosMaternos: get(sacramento, ['nombreAbuelosMaternos', 'NombreAbuelosMaternos']),
      tomo: get(sacramento, ['tomo', 'Tomo']),
      folio: get(sacramento, ['folio', 'Folio']),
    };

    s['Comunión'] = {
      id: get(sacramento, ['id']),
      Nombre: get(sacramento, ['nombre', 'Nombre']),
      FechaComunion: mesDesdePartes(
        get(sacramento, ['diaComunion', 'DiaComunion']),
        get(sacramento, ['mesComunion', 'MesComunion']),
        get(sacramento, ['annioComunion', 'AnnioComunion']),
      ),
      LugarComunion: get(sacramento, ['lugarComunion', 'LugarComunion']),
    };

    s['Confirmación'] = {
      id: get(sacramento, ['id']),
      Nombre: get(sacramento, ['nombre', 'Nombre']),
      FechaConfirmacion: mesDesdePartes(
        get(sacramento, ['diaConfirmacion', 'DiaConfirmacion']),
        get(sacramento, ['mesConfirmacion', 'MesConfirmacion']),
        get(sacramento, ['annioConfirmacion', 'AnnioConfirmacion']),
      ),
      LugarConfirmacion: get(sacramento, ['lugarConfirmacion', 'LugarConfirmacion']),
    };

    s['Matrimonio'] = {
      id: get(sacramento, ['id']),
      NombreContrayente: get(sacramento, ['nombreContrayente', 'NombreContrayente']),
      NombreContrayente2: get(sacramento, ['nombreContrayente2', 'NombreContrayente2']),
      FechaMatrimonio: mesDesdePartes(
        get(sacramento, ['diaMatrimonio', 'DiaMatrimonio']),
        get(sacramento, ['mesMatrimonio', 'MesMatrimonio']),
        get(sacramento, ['annioMatrimonio', 'AnnioMatrimonio']),
      ),
      LugarMatrimonio: get(sacramento, ['lugarMatrimonio', 'LugarMatrimonio']),
      tomo: get(sacramento, ['tomo', 'Tomo']),
      folio: get(sacramento, ['folio', 'Folio']),
    };

    setSecciones(s);
  }, [sacramento]);

  if (!isOpen) return null;

  const soloLetras = (valor: string) => valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');

  const soloDigitos = (valor: string) => valor.replace(/\D/g, '');

  const validarCedulaCR = (valor: string) => {
    const digitos = soloDigitos(valor);
    if (digitos.length === 0) return '';
    if (digitos[0] === '0') return digitos.slice(1);
    return digitos.slice(0, 9);
  };

  const formatearCedulaCR = (digitos: string) => {
    if (digitos.length <= 1) return digitos;
    if (digitos.length <= 5) return `${digitos[0]}-${digitos.slice(1)}`;
    return `${digitos[0]}-${digitos.slice(1, 5)}-${digitos.slice(5)}`;
  };

  const setField = (seccion: string, campo: string, valor: any) => {
    let valorProcesado = valor;
    const camposTexto = ['Nombre', 'PrimerApellido', 'SegundoApellido', 'NombreParroquia', 'Prebispero', 'LugarComunion', 'LugarConfirmacion', 'LugarMatrimonio', 'NombreContrayente', 'NombreContrayente2', 'nombreAbuelosPaternos', 'nombreAbuelosMaternos'];
    const camposNumericos = ['Tomo', 'Folio', 'Asiento', 'AnnioBautismo', 'AnnioComunion', 'AnnioConfirmacion', 'AnnioMatrimonio', 'tomo', 'folio'];
    if (camposTexto.includes(campo)) {
      valorProcesado = soloLetras(String(valor));
    } else if (campo === 'cedula') {
      const digitos = validarCedulaCR(String(valor));
      valorProcesado = formatearCedulaCR(digitos);
    } else if (camposNumericos.includes(campo)) {
      valorProcesado = soloDigitos(String(valor));
    }
    setSecciones((prev) => ({
      ...prev,
      [seccion]: { ...prev[seccion], [campo]: valorProcesado },
    }));
  };

  const scrollA = (seccion: string) => {
    const container = containerRef.current;
    const seccionEl = sectionRefs.current[seccion];
    if (container && seccionEl) {
      isScrollingRef.current = true;
      setActiveTab(seccion);
      container.scrollTo({
        top: seccionEl.offsetTop - container.offsetTop - 8,
        behavior: 'smooth',
      });
      setTimeout(() => { isScrollingRef.current = false; }, 500);
    }
  };

  const constSeccion = (seccion: string) => (
    <div
      ref={(el) => { sectionRefs.current[seccion] = el; }}
      className="scroll-mt-2"
    >
      <h3 className="mb-3 border-b border-gray-200 pb-2 text-sm font-bold tracking-wide text-blue-700 uppercase">
        {seccion.toUpperCase()}
      </h3>
    </div>
  );

  const renderBautismo = () => (
    <>
      <div className="mb-5">
        <Label>Nombre del bautizado</Label>
        <Input type="text" maxLength={80} value={secciones.Bautismo.Nombre || ''} className={modalInputClass} onChange={(e) => setField('Bautismo', 'Nombre', e.target.value)} />
      </div>
      <div className="mb-0 flex flex-col gap-4 sm:flex-row">
        <div className="mb-5 flex-1">
          <Label>Primer Apellido</Label>
          <Input type="text" maxLength={80} value={secciones.Bautismo.PrimerApellido || ''} className={modalInputClass} onChange={(e) => setField('Bautismo', 'PrimerApellido', e.target.value)} />
        </div>
        <div className="mb-5 flex-1">
          <Label>Segundo Apellido</Label>
          <Input type="text" maxLength={80} value={secciones.Bautismo.SegundoApellido || ''} className={modalInputClass} onChange={(e) => setField('Bautismo', 'SegundoApellido', e.target.value)} />
        </div>
      </div>
      <div className="mb-5">
        <Label>Cédula</Label>
        <Input type="text" placeholder="0-0000-0000" maxLength={12} value={secciones.Bautismo.cedula || ''} className={modalInputClass} onChange={(e) => setField('Bautismo', 'cedula', e.target.value)} />
      </div>
      <div className="mb-0 flex flex-col gap-4 sm:flex-row">
        <div className="mb-5 flex-1">
          <Label>Fecha de Bautismo</Label>
          <Input type="date" value={secciones.Bautismo.fechaBautismo || ''} className={modalInputClass} onChange={(e) => setField('Bautismo', 'fechaBautismo', e.target.value)} />
        </div>
        <div className="mb-5 flex-1">
          <Label>Año de Bautismo</Label>
          <Input type="number" value={secciones.Bautismo.annioBautismo || ''} className={modalInputClass} onChange={(e) => setField('Bautismo', 'annioBautismo', parseInt(e.target.value) || '')} />
        </div>
      </div>
      <div className="mb-5">
        <Label>Lugar de celebración sacramental</Label>
        <Input type="text" placeholder="Santuario San Blas de Nicoya" maxLength={LUGAR_MAX} value={secciones.Bautismo.nombreParroquia || ''} className={modalInputClass} onChange={(e) => setField('Bautismo', 'nombreParroquia', e.target.value)} />
      </div>
      <div className="mb-5">
        <Label>Prebísptero</Label>
        <Input type="text" maxLength={120} value={secciones.Bautismo.prebispero || ''} className={modalInputClass} onChange={(e) => setField('Bautismo', 'prebispero', e.target.value)} />
      </div>
      <div className="mb-0 flex flex-col gap-4 sm:flex-row">
        <div className="mb-5 flex-1">
          <Label>Fecha de nacimiento</Label>
          <Input type="date" value={secciones.Bautismo.fechaNacimiento || ''} className={modalInputClass} onChange={(e) => setField('Bautismo', 'fechaNacimiento', e.target.value)} />
        </div>
        <div className="mb-5 flex-1">
          <Label>Hora de nacimiento</Label>
          <Input type="time" value={secciones.Bautismo.horaNacimiento || ''} className={modalInputClass} onChange={(e) => setField('Bautismo', 'horaNacimiento', e.target.value)} />
        </div>
      </div>
      <div className="mb-0 flex flex-col gap-4 sm:flex-row">
        <div className="mb-5 flex-1">
          <Label>Tomo</Label>
          <Input type="number" value={secciones.Bautismo.tomo || ''} className={modalInputClass} onChange={(e) => setField('Bautismo', 'tomo', parseInt(e.target.value) || '')} />
        </div>
        <div className="mb-5 flex-1">
          <Label>Folio</Label>
          <Input type="number" value={secciones.Bautismo.folio || ''} className={modalInputClass} onChange={(e) => setField('Bautismo', 'folio', parseInt(e.target.value) || '')} />
        </div>
      </div>
      <div className="mb-0 flex flex-col gap-4 sm:flex-row">
        <div className="mb-5 flex-1">
          <Label>Abuelos Paternos</Label>
          <Input type="text" maxLength={200} value={secciones.Bautismo.nombreAbuelosPaternos || ''} className={modalInputClass} onChange={(e) => setField('Bautismo', 'nombreAbuelosPaternos', e.target.value)} />
        </div>
        <div className="mb-5 flex-1">
          <Label>Abuelos Maternos</Label>
          <Input type="text" maxLength={200} value={secciones.Bautismo.nombreAbuelosMaternos || ''} className={modalInputClass} onChange={(e) => setField('Bautismo', 'nombreAbuelosMaternos', e.target.value)} />
        </div>
      </div>
    </>
  );

  const renderComunion = () => (
    <>
      <div className="mb-5">
        <Label>Fecha de Comunión</Label>
        <Input type="date" value={secciones['Comunión'].FechaComunion || ''} className={modalInputClass} onChange={(e) => setField('Comunión', 'FechaComunion', e.target.value)} />
      </div>
      <div className="mb-5">
        <Label>Lugar de celebración</Label>
        <Input type="text" placeholder="Capilla Curime" maxLength={LUGAR_MAX} value={secciones['Comunión'].LugarComunion || ''} className={modalInputClass} onChange={(e) => setField('Comunión', 'LugarComunion', e.target.value)} />
      </div>
    </>
  );

  const renderConfirmacion = () => (
    <>
      <div className="mb-5">
        <Label>Fecha de Confirmación</Label>
        <Input type="date" value={secciones['Confirmación'].FechaConfirmacion || ''} className={modalInputClass} onChange={(e) => setField('Confirmación', 'FechaConfirmacion', e.target.value)} />
      </div>
      <div className="mb-5">
        <Label>Lugar de celebración</Label>
        <Input type="text" placeholder="Catedral Metropolitana" maxLength={LUGAR_MAX} value={secciones['Confirmación'].LugarConfirmacion || ''} className={modalInputClass} onChange={(e) => setField('Confirmación', 'LugarConfirmacion', e.target.value)} />
      </div>
    </>
  );

  const renderMatrimonio = () => (
    <>
      <div className="mb-0 flex flex-col gap-4 sm:flex-row">
        <div className="mb-5 flex-1">
          <Label>Contrayente 1</Label>
          <Input type="text" maxLength={120} value={secciones.Matrimonio.NombreContrayente || ''} className={modalInputClass} onChange={(e) => setField('Matrimonio', 'NombreContrayente', e.target.value)} />
        </div>
        <div className="mb-5 flex-1">
          <Label>Contrayente 2</Label>
          <Input type="text" maxLength={120} value={secciones.Matrimonio.NombreContrayente2 || ''} className={modalInputClass} onChange={(e) => setField('Matrimonio', 'NombreContrayente2', e.target.value)} />
        </div>
      </div>
      <div className="mb-5">
        <Label>Fecha de Matrimonio</Label>
        <Input type="date" value={secciones.Matrimonio.FechaMatrimonio || ''} className={modalInputClass} onChange={(e) => setField('Matrimonio', 'FechaMatrimonio', e.target.value)} />
      </div>
      <div className="mb-5">
        <Label>Lugar de celebración</Label>
        <Input type="text" placeholder="Iglesia Santa Ana" maxLength={LUGAR_MAX} value={secciones.Matrimonio.LugarMatrimonio || ''} className={modalInputClass} onChange={(e) => setField('Matrimonio', 'LugarMatrimonio', e.target.value)} />
      </div>
      <div className="mb-0 flex flex-col gap-4 sm:flex-row">
        <div className="mb-5 flex-1">
          <Label>Tomo</Label>
          <Input type="number" value={secciones.Matrimonio.tomo || ''} className={modalInputClass} onChange={(e) => setField('Matrimonio', 'tomo', parseInt(e.target.value) || '')} />
        </div>
        <div className="mb-5 flex-1">
          <Label>Folio</Label>
          <Input type="number" value={secciones.Matrimonio.folio || ''} className={modalInputClass} onChange={(e) => setField('Matrimonio', 'folio', parseInt(e.target.value) || '')} />
        </div>
      </div>
    </>
  );

  const prepararSecciones = (): Record<string, any> => {
    const resultado: Record<string, any> = {};

    const bautismo = secciones.Bautismo;
    if (bautismo.Nombre || bautismo.cedula || bautismo.fechaBautismo) {
      resultado.Bautismo = normalizarCamposNombres(bautismo, [
        'Nombre', 'PrimerApellido', 'SegundoApellido', 'nombreParroquia', 'prebispero',
        'nombreAbuelosPaternos', 'nombreAbuelosMaternos',
      ]);
    }

    const comunion = secciones['Comunión'];
    if (comunion.FechaComunion || comunion.LugarComunion) {
      const { dia, mes, annio } = descomponerFecha(comunion.FechaComunion);
      resultado['Comunión'] = {
        ...normalizarCamposNombres(comunion, ['LugarComunion']),
        DiaComunion: dia,
        MesComunion: !isNaN(mes) ? MESES[mes - 1] : '',
        AnnioComunion: annio || undefined,
      };
    }

    const confirmacion = secciones['Confirmación'];
    if (confirmacion.FechaConfirmacion || confirmacion.LugarConfirmacion) {
      const { dia, mes, annio } = descomponerFecha(confirmacion.FechaConfirmacion);
      resultado['Confirmación'] = {
        ...normalizarCamposNombres(confirmacion, ['LugarConfirmacion']),
        DiaConfirmacion: dia,
        MesConfirmacion: !isNaN(mes) ? MESES[mes - 1] : '',
        AnnioConfirmacion: annio || undefined,
      };
    }

    const matrimonio = secciones.Matrimonio;
    if (matrimonio.NombreContrayente || matrimonio.FechaMatrimonio || matrimonio.LugarMatrimonio) {
      const { dia, mes, annio } = descomponerFecha(matrimonio.FechaMatrimonio);
      resultado.Matrimonio = {
        ...normalizarCamposNombres(matrimonio, ['NombreContrayente', 'NombreContrayente2', 'LugarMatrimonio']),
        DiaMatrimonio: dia,
        MesMatrimonio: !isNaN(mes) ? MESES[mes - 1] : '',
        AnnioMatrimonio: annio || undefined,
      };
    }

    return resultado;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    // Validar cédula en Bautismo si tiene datos
    const bautismo = secciones.Bautismo;
    if (bautismo.Nombre || bautismo.cedula || bautismo.fechaBautismo) {
      if (bautismo.cedula && !/^[1-9]-\d{4}-\d{4}$/.test(String(bautismo.cedula || ''))) {
        showToast('Cédula inválida. Formato: 1-XXXX-XXXX (primer dígito 1-9)', 'error');
        return;
      }
    }

    const datos = prepararSecciones();
    if (Object.keys(datos).length === 0) {
      showToast('Complete al menos una sección para guardar.', 'error');
      return;
    }
    setSaving(true);
    try {
      await onSave(datos, tipo);
      onClose();
    } catch {
      showToast('No se pudieron guardar los cambios. Intente de nuevo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="flex max-h-[90vh] w-[90%] max-w-[800px] flex-col overflow-hidden rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 bg-surface-muted px-6 py-5">
          <h2 className="m-0 text-lg text-slate-800">EDITAR ACTA SACRAMENTAL</h2>
          <button type="button" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-3xl text-gray-500 hover:bg-gray-100" onClick={onClose}>×</button>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-gray-200 px-6">
          {tiposSacramento.map((tipoTab) => (
            <button
              key={tipoTab}
              type="button"
              className={cn(
                "shrink-0 cursor-pointer border-0 bg-transparent px-5 py-3 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600",
                activeTab === tipoTab && "border-b-2 border-blue-600 text-blue-600",
              )}
              onClick={() => {
                setActiveTab(tipoTab);
                scrollA(tipoTab);
              }}
            >
              {tipoTab.toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div ref={containerRef} className="max-h-[60vh] space-y-8 overflow-y-auto p-6">
            <div>
              {constSeccion('Bautismo')}
              {renderBautismo()}
            </div>
            <div>
              {constSeccion('Comunión')}
              {renderComunion()}
            </div>
            <div>
              {constSeccion('Confirmación')}
              {renderConfirmacion()}
            </div>
            <div>
              {constSeccion('Matrimonio')}
              {renderMatrimonio()}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 bg-surface-muted px-6 py-4">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              CANCELAR
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSacramentoModal;