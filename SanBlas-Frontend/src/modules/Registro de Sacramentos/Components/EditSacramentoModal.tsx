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

const CAMPOS_REQUERIDOS = {
    Bautismo: [
      'Nombre', 'PrimerApellido', 'SegundoApellido', 'cedula',
      'fechaBautismo', 'annioBautismo', 'nombreParroquia',
      'fechaNacimiento', 'horaNacimiento', 'tomo', 'folio'
    ],
    'Comunión': [
      'Nombre', 'FechaComunion', 'LugarComunion'
    ],
    'Confirmación': [
      'Nombre', 'FechaConfirmacion', 'LugarConfirmacion'
    ],
    Matrimonio: [
      'NombreContrayente', 'NombreContrayente2', 'FechaMatrimonio', 'LugarMatrimonio',
      'tomo', 'folio'
    ],
  } as const;

  const validarSeccion = (seccion: any, campos: string[]): string[] => {
    const faltantes: string[] = [];
    for (const campo of campos) {
      const valor = seccion[campo];
      if (valor === undefined || valor === null || valor === '' || (typeof valor === 'number' && isNaN(valor))) {
        faltantes.push(campo);
      }
    }
    return faltantes;
  };

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
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const isScrollingRef = useRef(false);

  const getInputClass = (hasError: boolean) =>
    cn(
      "w-full rounded-md border px-3 py-2.5 text-sm transition-colors focus:outline-none",
      hasError
        ? "border-red-500 focus:border-red-600 bg-red-50"
        : "border-gray-300 focus:border-blue-600",
    );

  const esRequerido = (campo: string) => CAMPOS_REQUERIDOS[tipo].includes(campo);

  const LabelReq = ({ campo, children }: { campo: string; children: React.ReactNode }) => (
    <Label>
      {children}
      {CAMPOS_REQUERIDOS[tipo].includes(campo) && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
    </Label>
  );

  // Cargar datos al abrir modal, resetear al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSecciones({
        Bautismo: {},
        'Comunión': {},
        'Confirmación': {},
        'Matrimonio': {},
      });
      return;
    }
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
    setActiveTab(tipo);
  }, [isOpen, sacramento, tipo]);

  // ESC para cerrar
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

  // Scroll spy para pestaña activa
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
    setErrors((prev) => ({ ...prev, [campo]: false }));
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
        <LabelReq campo="Nombre">Nombre del bautizado</LabelReq>
        <Input type="text" maxLength={80} value={secciones.Bautismo.Nombre || ''} className={getInputClass(errors['Nombre'])} onChange={(e) => setField('Bautismo', 'Nombre', e.target.value)} />
      </div>
      <div className="mb-0 flex flex-col gap-4 sm:flex-row">
        <div className="mb-5 flex-1">
          <LabelReq campo="PrimerApellido">Primer Apellido</LabelReq>
          <Input type="text" maxLength={80} value={secciones.Bautismo.PrimerApellido || ''} className={getInputClass(errors['PrimerApellido'])} onChange={(e) => setField('Bautismo', 'PrimerApellido', e.target.value)} />
        </div>
        <div className="mb-5 flex-1">
          <LabelReq campo="SegundoApellido">Segundo Apellido</LabelReq>
          <Input type="text" maxLength={80} value={secciones.Bautismo.SegundoApellido || ''} className={getInputClass(errors['SegundoApellido'])} onChange={(e) => setField('Bautismo', 'SegundoApellido', e.target.value)} />
        </div>
      </div>
      <div className="mb-5">
        <LabelReq campo="cedula">Cédula</LabelReq>
        <Input type="text" placeholder="0-0000-0000" maxLength={12} value={secciones.Bautismo.cedula || ''} className={getInputClass(errors['cedula'])} onChange={(e) => setField('Bautismo', 'cedula', e.target.value)} />
      </div>
      <div className="mb-5">
          <LabelReq campo="fechaBautismo">Fecha de Bautismo</LabelReq>
          <Input type="date" value={secciones.Bautismo.fechaBautismo || ''} className={getInputClass(errors['fechaBautismo'])} onChange={(e) => setField('Bautismo', 'fechaBautismo', e.target.value)} />
        </div>
        <div className="mb-5">
        <LabelReq campo="nombreParroquia">Lugar de celebración sacramental</LabelReq>
        <Input type="text" placeholder="Santuario San Blas de Nicoya" maxLength={LUGAR_MAX} value={secciones.Bautismo.nombreParroquia || ''} className={getInputClass(errors['nombreParroquia'])} onChange={(e) => setField('Bautismo', 'nombreParroquia', e.target.value)} />
      </div>
      <div className="mb-5">
        <Label>Prebísptero</Label>
        <Input type="text" maxLength={120} value={secciones.Bautismo.prebispero || ''} className={getInputClass(errors['prebispero'])} onChange={(e) => setField('Bautismo', 'prebispero', e.target.value)} />
      </div>
      <div className="mb-0 flex flex-col gap-4 sm:flex-row">
        <div className="mb-5 flex-1">
          <LabelReq campo="fechaNacimiento">Fecha de nacimiento</LabelReq>
          <Input type="date" value={secciones.Bautismo.fechaNacimiento || ''} className={getInputClass(errors['fechaNacimiento'])} onChange={(e) => setField('Bautismo', 'fechaNacimiento', e.target.value)} />
        </div>
        <div className="mb-5 flex-1">
          <LabelReq campo="horaNacimiento">Hora de nacimiento</LabelReq>
          <Input type="time" value={secciones.Bautismo.horaNacimiento || ''} className={getInputClass(errors['horaNacimiento'])} onChange={(e) => setField('Bautismo', 'horaNacimiento', e.target.value)} />
        </div>
      </div>
      <div className="mb-0 flex flex-col gap-4 sm:flex-row">
        <div className="mb-5 flex-1">
          <LabelReq campo="tomo">Tomo</LabelReq>
          <Input type="number" value={secciones.Bautismo.tomo || ''} className={getInputClass(errors['tomo'])} onChange={(e) => setField('Bautismo', 'tomo', parseInt(e.target.value) || '')} />
        </div>
        <div className="mb-5 flex-1">
          <LabelReq campo="folio">Folio</LabelReq>
          <Input type="number" value={secciones.Bautismo.folio || ''} className={getInputClass(errors['folio'])} onChange={(e) => setField('Bautismo', 'folio', parseInt(e.target.value) || '')} />
        </div>
      </div>
      <div className="mb-0 flex flex-col gap-4 sm:flex-row">
        <div className="mb-5 flex-1">
          <Label>Abuelos Paternos</Label>
          <Input type="text" maxLength={200} value={secciones.Bautismo.nombreAbuelosPaternos || ''} className={getInputClass(errors['nombreAbuelosPaternos'])} onChange={(e) => setField('Bautismo', 'nombreAbuelosPaternos', e.target.value)} />
        </div>
        <div className="mb-5 flex-1">
          <Label>Abuelos Maternos</Label>
          <Input type="text" maxLength={200} value={secciones.Bautismo.nombreAbuelosMaternos || ''} className={getInputClass(errors['nombreAbuelosMaternos'])} onChange={(e) => setField('Bautismo', 'nombreAbuelosMaternos', e.target.value)} />
        </div>
      </div>
    </>
  );

  const renderComunion = () => (
    <>
      <div className="mb-5">
        <Label>Fecha de Comunión</Label>
        <Input type="date" value={secciones['Comunión'].FechaComunion || ''} className={getInputClass(errors['FechaComunion'])} onChange={(e) => setField('Comunión', 'FechaComunion', e.target.value)} />
      </div>
      <div className="mb-5">
        <Label>Lugar de celebración</Label>
        <Input type="text" placeholder="Capilla Curime" maxLength={LUGAR_MAX} value={secciones['Comunión'].LugarComunion || ''} className={getInputClass(errors['LugarComunion'])} onChange={(e) => setField('Comunión', 'LugarComunion', e.target.value)} />
      </div>
    </>
  );

  const renderConfirmacion = () => (
    <>
      <div className="mb-5">
        <Label>Fecha de Confirmación</Label>
        <Input type="date" value={secciones['Confirmación'].FechaConfirmacion || ''} className={getInputClass(errors['FechaConfirmacion'])} onChange={(e) => setField('Confirmación', 'FechaConfirmacion', e.target.value)} />
      </div>
      <div className="mb-5">
        <Label>Lugar de celebración</Label>
        <Input type="text" placeholder="Catedral Metropolitana" maxLength={LUGAR_MAX} value={secciones['Confirmación'].LugarConfirmacion || ''} className={getInputClass(errors['LugarConfirmacion'])} onChange={(e) => setField('Confirmación', 'LugarConfirmacion', e.target.value)} />
      </div>
    </>
  );

  const renderMatrimonio = () => (
    <>
      <div className="mb-0 flex flex-col gap-4 sm:flex-row">
        <div className="mb-5 flex-1">
          <Label>Contrayente 1</Label>
          <Input type="text" maxLength={120} value={secciones.Matrimonio.NombreContrayente || ''} className={getInputClass(errors['NombreContrayente'])} onChange={(e) => setField('Matrimonio', 'NombreContrayente', e.target.value)} />
        </div>
        <div className="mb-5 flex-1">
          <Label>Contrayente 2</Label>
          <Input type="text" maxLength={120} value={secciones.Matrimonio.NombreContrayente2 || ''} className={getInputClass(errors['NombreContrayente2'])} onChange={(e) => setField('Matrimonio', 'NombreContrayente2', e.target.value)} />
        </div>
      </div>
      <div className="mb-5">
        <Label>Fecha de Matrimonio</Label>
        <Input type="date" value={secciones.Matrimonio.FechaMatrimonio || ''} className={getInputClass(errors['FechaMatrimonio'])} onChange={(e) => setField('Matrimonio', 'FechaMatrimonio', e.target.value)} />
      </div>
      <div className="mb-5">
        <Label>Lugar de celebración</Label>
        <Input type="text" placeholder="Iglesia Santa Ana" maxLength={LUGAR_MAX} value={secciones.Matrimonio.LugarMatrimonio || ''} className={getInputClass(errors['LugarMatrimonio'])} onChange={(e) => setField('Matrimonio', 'LugarMatrimonio', e.target.value)} />
      </div>
      <div className="mb-0 flex flex-col gap-4 sm:flex-row">
        <div className="mb-5 flex-1">
          <Label>Tomo</Label>
          <Input type="number" value={secciones.Matrimonio.tomo || ''} className={getInputClass(errors['tomo'])} onChange={(e) => setField('Matrimonio', 'tomo', parseInt(e.target.value) || '')} />
        </div>
        <div className="mb-5 flex-1">
          <Label>Folio</Label>
          <Input type="number" value={secciones.Matrimonio.folio || ''} className={getInputClass(errors['folio'])} onChange={(e) => setField('Matrimonio', 'folio', parseInt(e.target.value) || '')} />
        </div>
      </div>
    </>
  );

  const prepararSecciones = (): Record<string, any> => {
    const resultado: Record<string, any> = {};

    const bautismo = secciones.Bautismo;
    const bautismoTieneDatos = bautismo.Nombre || bautismo.cedula || bautismo.fechaBautismo;
    if (bautismoTieneDatos) {
      const base = tipo === 'Bautismo' ? bautismo : {};
      resultado.Bautismo = {
        ...base,
        ...normalizarCamposNombres(bautismo, [
          'Nombre', 'PrimerApellido', 'SegundoApellido', 'nombreParroquia', 'prebispero',
          'nombreAbuelosPaternos', 'nombreAbuelosMaternos',
        ]),
        id: bautismo.id,
        cedula: bautismo.cedula,
        fechaBautismo: bautismo.fechaBautismo,
        annioBautismo: bautismo.annioBautismo,
        fechaNacimiento: bautismo.fechaNacimiento,
        horaNacimiento: bautismo.horaNacimiento,
        tomo: bautismo.tomo,
        folio: bautismo.folio,
      };
    }

    const comunion = secciones['Comunión'];
    const comunionTieneDatos = comunion.FechaComunion || comunion.LugarComunion;
    if (comunicacionTieneDatos) {
      const base = tipo === 'Comunión' ? comunion : {};
      const { dia, mes, annio } = descomponerFecha(comunion.FechaComunion);
      resultado['Comunión'] = {
        ...base,
        ...normalizarCamposNombres(comunion, ['LugarComunion']),
        id: comunion.id,
        Nombre: comunion.Nombre,
        DiaComunion: dia,
        MesComunion: !isNaN(mes) ? MESES[mes - 1] : '',
        AnnioComunion: annio || undefined,
      };
    }

    const confirmacion = secciones['Confirmación'];
    const confirmacionTieneDatos = confirmacion.FechaConfirmacion || confirmacion.LugarConfirmacion;
    if (confirmacionTieneDatos) {
      const base = tipo === 'Confirmación' ? confirmacion : {};
      const { dia, mes, annio } = descomponerFecha(confirmacion.FechaConfirmacion);
      resultado['Confirmación'] = {
        ...base,
        ...normalizarCamposNombres(confirmacion, ['LugarConfirmacion']),
        id: confirmacion.id,
        Nombre: confirmacion.Nombre,
        DiaConfirmacion: dia,
        MesConfirmacion: !isNaN(mes) ? MESES[mes - 1] : '',
        AnnioConfirmacion: annio || undefined,
      };
    }

    const matrimonio = secciones.Matrimonio;
    const matrimonioTieneDatos = matrimonio.NombreContrayente || matrimonio.FechaMatrimonio || matrimonio.LugarMatrimonio;
    if (matrimonioTieneDatos) {
      const base = tipo === 'Matrimonio' ? matrimonio : {};
      const { dia, mes, annio } = descomponerFecha(matrimonio.FechaMatrimonio);
      resultado.Matrimonio = {
        ...base,
        ...normalizarCamposNombres(matrimonio, ['NombreContrayente', 'NombreContrayente2', 'LugarMatrimonio']),
        id: matrimonio.id,
        NombreContrayente: matrimonio.NombreContrayente,
        NombreContrayente2: matrimonio.NombreContrayente2,
        DiaMatrimonio: dia,
        MesMatrimonio: !isNaN(mes) ? MESES[mes - 1] : '',
        AnnioMatrimonio: annio || undefined,
        tomo: matrimonio.tomo,
        folio: matrimonio.folio,
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
        setErrors((prev) => ({ ...prev, cedula: true }));
        return;
      }
    }

    // Validar campos requeridos del tipo que se está editando
    const camposRequeridos = CAMPOS_REQUERIDOS[tipo];
    const seccionActual = secciones[tipo];
    const nuevosErrores: Record<string, boolean> = {};
    
    for (const campo of camposRequeridos) {
      const valor = seccionActual[campo];
      if (valor === undefined || valor === null || valor === '' || (typeof valor === 'number' && isNaN(valor))) {
        nuevosErrores[campo] = true;
      }
    }
    
    if (Object.keys(nuevosErrores).length > 0) {
      setErrors(nuevosErrores);
      return;
    }

    const datos = prepararSecciones();
    if (Object.keys(datos).length === 0) {
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