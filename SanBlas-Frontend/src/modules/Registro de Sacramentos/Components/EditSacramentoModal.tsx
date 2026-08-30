import { useEffect, useRef, useState } from 'react';
import { Button, cn, Input, Label, useToast } from '../../../shared/ui';
import { Loader2 } from 'lucide-react';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { useObtenerSacramentosPersona } from '../hooks/hooksNuevos/useObtenerSacramentosPersona';
import { useObtenerSacramentoNuevo } from '../hooks/hooksNuevos/useObtenerSacramentoNuevo';
import { useListarParroquias } from '../hooks/hooksNuevos/useListarParroquias';
import { useListarPresbiteros } from '../hooks/hooksNuevos/useListarPresbiteros';
import {
  ActualizarSacramentoInput,
  CrearSacramentoInput,
  DetalleBautismo,
  ParentescoAbuelo,
  PersonaDetalle,
  SacramentoDetalle,
  TipoSacramento,
  TIPO_SACRAMENTO_LABEL,
} from '../../../types/sacramentosNuevos';
import {
  cedulaDigitosValidos,
  cedulaValida,
  numeroValido,
  soloLetras,
  soloNumeros,
  textoEnRango,
} from '../../../shared/utils/formValidation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sacramentoId: number | null;
  cedula: string | null;
  onUpdate: (id: number, dto: ActualizarSacramentoInput) => Promise<void>;
  onCreate: (dto: CrearSacramentoInput) => Promise<void>;
}

const TIPOS: TipoSacramento[] = ['bautismo', 'comunion', 'confirmacion', 'matrimonio'];

const PARENTESCOS: ParentescoAbuelo[] = [
  'abuelo_paterno',
  'abuela_paterna',
  'abuelo_materno',
  'abuela_materna',
];

const inputClass = (hasError = false) =>
  cn(
    'w-full rounded-md border px-3 py-2.5 text-sm transition-colors focus:outline-none',
    hasError
      ? 'border-red-500 bg-red-50 focus:border-red-600'
      : 'border-gray-300 focus:border-blue-600',
  );

const formatearCedulaCR = (valor: string): string => {
  const digitos = valor.replace(/\D/g, '');
  const limpiados = digitos.startsWith('0') ? digitos.slice(1) : digitos.slice(0, 9);
  if (limpiados.length <= 1) return limpiados;
  if (limpiados.length <= 5) return `${limpiados[0]}-${limpiados.slice(1)}`;
  return `${limpiados[0]}-${limpiados.slice(1, 5)}-${limpiados.slice(5)}`;
};

interface PersonaForm {
  cedula: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
}

const personaVacia = (): PersonaForm => ({
  cedula: '',
  nombre: '',
  primerApellido: '',
  segundoApellido: '',
});

const aPersonaForm = (p: PersonaDetalle | null | undefined): PersonaForm =>
  p
    ? {
        cedula: p.cedula ?? '',
        nombre: p.nombre,
        primerApellido: p.primerApellido,
        segundoApellido: p.segundoApellido ?? '',
      }
    : personaVacia();

const aPersonaInput = (p: PersonaForm) => ({
  cedula: p.cedula || undefined,
  nombre: (p.nombre || '').trim(),
  primerApellido: (p.primerApellido || '').trim(),
  segundoApellido: (p.segundoApellido || '').trim() || undefined,
});

interface BautismoForm {
  bautizado: PersonaForm;
  padre: PersonaForm;
  madre: PersonaForm;
  padrino: PersonaForm;
  madrina: PersonaForm;
  abuelos: (PersonaForm & { parentesco: ParentescoAbuelo })[];
  fechaNacimiento: string;
  horaNacimiento: string;
  lugarNacimiento: string;
  libro: string;
  tomo: string;
  folio: string;
  asiento: string;
}

const bautismoVacio = (): BautismoForm => ({
  bautizado: personaVacia(),
  padre: personaVacia(),
  madre: personaVacia(),
  padrino: personaVacia(),
  madrina: personaVacia(),
  abuelos: [],
  fechaNacimiento: '',
  horaNacimiento: '',
  lugarNacimiento: '',
  libro: '',
  tomo: '',
  folio: '',
  asiento: '',
});

const bautismoDesdeDetalle = (detalle: DetalleBautismo): BautismoForm => ({
  bautizado: aPersonaForm(detalle.bautizado),
  padre: aPersonaForm(detalle.padre),
  madre: aPersonaForm(detalle.madre),
  padrino: aPersonaForm(detalle.padrino),
  madrina: aPersonaForm(detalle.madrina),
  abuelos: detalle.abuelos.map((ab) => ({
    cedula: ab.cedula ?? '',
    nombre: ab.nombre ?? '',
    primerApellido: ab.primerApellido ?? '',
    segundoApellido: ab.segundoApellido ?? '',
    parentesco: ab.parentesco,
  })),
  fechaNacimiento: detalle.fechaNacimiento ?? '',
  horaNacimiento: detalle.horaNacimiento ?? '',
  lugarNacimiento: detalle.lugarNacimiento ?? '',
  libro: detalle.libro ?? '',
  tomo: detalle.tomo ?? '',
  folio: detalle.folio ?? '',
  asiento: detalle.asiento ?? '',
});

interface MatrimonioForm {
  contrayente1: PersonaForm;
  contrayente2: PersonaForm;
  libro: string;
  tomo: string;
  folio: string;
}

const matrimonioVacio = (): MatrimonioForm => ({
  contrayente1: personaVacia(),
  contrayente2: personaVacia(),
  libro: '',
  tomo: '',
  folio: '',
});

const EditSacramentoModal = ({ isOpen, onClose, sacramentoId, cedula, onUpdate, onCreate }: Props) => {
  const { showToast } = useToast();
  const { data: parroquias } = useListarParroquias();
  const { data: presbiteros } = useListarPresbiteros();
  const ficha = useObtenerSacramentosPersona(cedula);
  const detalleQuery = useObtenerSacramentoNuevo(sacramentoId);

  const [activeTab, setActiveTab] = useState<TipoSacramento>('bautismo');
  const [idParroquia, setIdParroquia] = useState('');
  const [idPresbitero, setIdPresbitero] = useState('');
  const [fechaSacramento, setFechaSacramento] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [bautismo, setBautismo] = useState<BautismoForm>(bautismoVacio());
  const [persona, setPersona] = useState<PersonaForm>(personaVacia());
  const [matrimonio, setMatrimonio] = useState<MatrimonioForm>(matrimonioVacio());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  const personaSacramental = ficha.data;
  const tieneBautismo = Boolean(personaSacramental?.bautismo);

  const sacramentoDelTab: SacramentoDetalle | null | undefined =
    activeTab === 'bautismo'
      ? personaSacramental?.bautismo
      : activeTab === 'comunion'
        ? personaSacramental?.comunion
        : activeTab === 'confirmacion'
          ? personaSacramental?.confirmacion
          : personaSacramental?.matrimonio;

  const existeEnTab = Boolean(sacramentoDelTab);

  // Inicializa el formulario según la ficha de la persona.
  useEffect(() => {
    if (!isOpen) return;
    const personaBase = personaSacramental?.persona;

    if (personaSacramental?.bautismo) {
      setBautismo(bautismoDesdeDetalle(personaSacramental.bautismo.detalle as DetalleBautismo));
    } else {
      setBautismo({ ...bautismoVacio(), bautizado: aPersonaForm(personaBase) });
    }

    if (personaSacramental?.comunion) {
      setPersona(aPersonaForm((personaSacramental.comunion.detalle as { persona: PersonaDetalle }).persona));
    } else {
      setPersona(aPersonaForm(personaBase));
    }

    if (personaSacramental?.matrimonio) {
      const detalle = personaSacramental.matrimonio.detalle as {
        contrayente1: PersonaDetalle;
        contrayente2: PersonaDetalle;
        libro: string | null;
        tomo: string | null;
        folio: string | null;
      };
      setMatrimonio({
        contrayente1: aPersonaForm(detalle.contrayente1),
        contrayente2: aPersonaForm(detalle.contrayente2),
        libro: detalle.libro ?? '',
        tomo: detalle.tomo ?? '',
        folio: detalle.folio ?? '',
      });
    } else {
      setMatrimonio({ ...matrimonioVacio(), contrayente1: aPersonaForm(personaBase) });
    }
  }, [isOpen, personaSacramental]);

  // Al cargar el detalle del sacramento señalado, posiciona la pestaña y precarga los datos base.
  useEffect(() => {
    if (!isOpen || !detalleQuery.data) return;
    const detalle = detalleQuery.data;
    setActiveTab(detalle.tipo);
    setIdParroquia(String(detalle.parroquia?.id ?? ''));
    setIdPresbitero(detalle.presbitero ? String(detalle.presbitero.id) : '');
    setFechaSacramento(detalle.fechaSacramento ?? '');
    setObservaciones(detalle.observaciones ?? '');
  }, [isOpen, detalleQuery.data]);

  // Al cambiar de pestaña, precarga los datos base de ese sacramento si existe.
  useEffect(() => {
    if (!isOpen || !existeEnTab) return;
    const detalle = sacramentoDelTab!;
    setIdParroquia(String(detalle.parroquia?.id ?? ''));
    setIdPresbitero(detalle.presbitero ? String(detalle.presbitero.id) : '');
    setFechaSacramento(detalle.fechaSacramento ?? '');
    setObservaciones(detalle.observaciones ?? '');
    setErrors({});
  }, [isOpen, activeTab, existeEnTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const setCampoPersona = (
    setter: React.Dispatch<React.SetStateAction<PersonaForm>>,
    campo: keyof PersonaForm,
    valor: string,
  ) => {
    setter((prev) => ({
      ...prev,
      [campo]:
        campo === 'cedula'
          ? formatearCedulaCR(cedulaDigitosValidos(valor))
          : soloLetras(valor),
    }));
  };

  const setCampoBautismo = (
    campo: keyof BautismoForm,
    valor: string,
  ) => {
    const numerico = ['libro', 'tomo', 'folio', 'asiento'].includes(campo);
    setBautismo((prev) => ({ ...prev, [campo]: numerico ? soloNumeros(valor) : valor }));
  };

  const setCampoMatrimonio = (
    campo: keyof MatrimonioForm,
    valor: string,
  ) => {
    const numerico = ['libro', 'tomo', 'folio'].includes(campo);
    setMatrimonio((prev) => ({ ...prev, [campo]: numerico ? soloNumeros(valor) : valor }));
  };

  const validar = (): boolean => {
    const nuevos: Record<string, boolean> = {};
    if (!idParroquia) nuevos.idParroquia = true;
    if (!idPresbitero) nuevos.idPresbitero = true;
    if (!fechaSacramento) nuevos.fechaSacramento = true;

    const personaOk = (p: PersonaForm, prefijo: string) => {
      if (!p.nombre.trim()) nuevos[`${prefijo}Nombre`] = true;
      else if (!textoEnRango(p.nombre)) nuevos[`${prefijo}Nombre`] = true;
      if (!p.primerApellido.trim()) nuevos[`${prefijo}PrimerApellido`] = true;
      else if (!textoEnRango(p.primerApellido)) nuevos[`${prefijo}PrimerApellido`] = true;
      if (p.segundoApellido.trim() && !textoEnRango(p.segundoApellido))
        nuevos[`${prefijo}SegundoApellido`] = true;
      if (p.cedula.trim() && !cedulaValida(p.cedula)) nuevos[`${prefijo}Cedula`] = true;
    };

    const numericosOk = (libro: string, tomo: string, folio: string, asiento?: string) => {
      if (libro.trim() && !numeroValido(libro)) nuevos.libro = true;
      if (tomo.trim() && !numeroValido(tomo)) nuevos.tomo = true;
      if (folio.trim() && !numeroValido(folio)) nuevos.folio = true;
      if (asiento && asiento.trim() && !numeroValido(asiento)) nuevos.asiento = true;
    };

    if (activeTab === 'bautismo') {
      personaOk(bautismo.bautizado, 'bautizado');
      if (!bautismo.libro.trim()) nuevos.libro = true;
      if (!bautismo.tomo.trim()) nuevos.tomo = true;
      if (!bautismo.folio.trim()) nuevos.folio = true;
      if (!bautismo.asiento.trim()) nuevos.asiento = true;
      numericosOk(bautismo.libro, bautismo.tomo, bautismo.folio, bautismo.asiento);
      if (!bautismo.fechaNacimiento) nuevos.fechaNacimiento = true;
      if (!bautismo.horaNacimiento) nuevos.horaNacimiento = true;
      if (!bautismo.lugarNacimiento.trim()) nuevos.lugarNacimiento = true;
      if (
        bautismo.fechaNacimiento &&
        fechaSacramento &&
        bautismo.fechaNacimiento > fechaSacramento
      ) {
        nuevos.fechaNacimiento = true;
        nuevos.fechaSacramento = true;
      }
    }
    if (activeTab === 'comunion' || activeTab === 'confirmacion') personaOk(persona, 'persona');
    if (activeTab === 'matrimonio') {
      personaOk(matrimonio.contrayente1, 'contrayente1');
      personaOk(matrimonio.contrayente2, 'contrayente2');
      if (!matrimonio.libro.trim()) nuevos.libro = true;
      if (!matrimonio.tomo.trim()) nuevos.tomo = true;
      if (!matrimonio.folio.trim()) nuevos.folio = true;
      numericosOk(matrimonio.libro, matrimonio.tomo, matrimonio.folio);
    }

    setErrors(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const construirBase = (): Pick<CrearSacramentoInput, 'idParroquia' | 'idPresbitero' | 'fechaSacramento' | 'observaciones'> => ({
    idParroquia: Number(idParroquia),
    idPresbitero: idPresbitero ? Number(idPresbitero) : undefined,
    fechaSacramento,
    observaciones: observaciones.trim() || undefined,
  });

  const construirSeccion = () => {
    if (activeTab === 'bautismo') {
      return {
        bautismo: {
          bautizado: aPersonaInput(bautismo.bautizado),
          padre: bautismo.padre?.nombre?.trim() ? aPersonaInput(bautismo.padre) : undefined,
          madre: bautismo.madre?.nombre?.trim() ? aPersonaInput(bautismo.madre) : undefined,
          padrino: bautismo.padrino?.nombre?.trim() ? aPersonaInput(bautismo.padrino) : undefined,
          madrina: bautismo.madrina?.nombre?.trim() ? aPersonaInput(bautismo.madrina) : undefined,
          abuelos: bautismo.abuelos.length
            ? bautismo.abuelos.map((ab) => ({ ...aPersonaInput(ab), parentesco: ab.parentesco }))
            : undefined,
          fechaNacimiento: bautismo.fechaNacimiento || undefined,
          horaNacimiento: bautismo.horaNacimiento || undefined,
          lugarNacimiento: (bautismo.lugarNacimiento || '').trim() || undefined,
          libro: (bautismo.libro || '').trim() || undefined,
          tomo: (bautismo.tomo || '').trim() || undefined,
          folio: (bautismo.folio || '').trim() || undefined,
          asiento: (bautismo.asiento || '').trim() || undefined,
        },
      };
    }
    if (activeTab === 'comunion') return { comunion: { persona: aPersonaInput(persona) } };
    if (activeTab === 'confirmacion') return { confirmacion: { persona: aPersonaInput(persona) } };
    return {
      matrimonio: {
        contrayente1: aPersonaInput(matrimonio.contrayente1),
        contrayente2: aPersonaInput(matrimonio.contrayente2),
        libro: (matrimonio.libro || '').trim() || undefined,
        tomo: (matrimonio.tomo || '').trim() || undefined,
        folio: (matrimonio.folio || '').trim() || undefined,
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!existeEnTab && activeTab !== 'bautismo' && !tieneBautismo) {
      showToast('Debe registrar primero el Bautismo antes de los demás sacramentos.', 'error');
      return;
    }

    if (!validar()) return;

    setSaving(true);
    try {
      const seccion = construirSeccion();
      if (existeEnTab && sacramentoDelTab) {
        await onUpdate(sacramentoDelTab.id, { ...construirBase(), ...seccion });
      } else {
        await onCreate({ tipo: activeTab, ...construirBase(), ...seccion });
      }
      onClose();
    } catch (err: any) {
      const mensaje =
        err?.response?.data?.mensaje ?? err?.message ?? 'No se pudo guardar el acta.';
      showToast(String(mensaje), 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderPersonaCampos = (
    titulo: string,
    persona: PersonaForm,
    setter: React.Dispatch<React.SetStateAction<PersonaForm>>,
    prefijo: string,
  ) => (
    <div className="mb-5">
      <Label>{titulo}</Label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input type="text" placeholder="Cédula (0-0000-0000)" maxLength={12} className={inputClass(errors[`${prefijo}Cedula`])} value={persona.cedula} onChange={(e) => setCampoPersona(setter, 'cedula', e.target.value)} />
        <Input type="text" placeholder="Nombre" maxLength={30} className={inputClass(errors[`${prefijo}Nombre`])} value={persona.nombre} onChange={(e) => setCampoPersona(setter, 'nombre', e.target.value)} />
        <Input type="text" placeholder="Primer apellido" maxLength={30} className={inputClass(errors[`${prefijo}PrimerApellido`])} value={persona.primerApellido} onChange={(e) => setCampoPersona(setter, 'primerApellido', e.target.value)} />
        <Input type="text" placeholder="Segundo apellido" maxLength={30} className={inputClass(errors[`${prefijo}SegundoApellido`])} value={persona.segundoApellido} onChange={(e) => setCampoPersona(setter, 'segundoApellido', e.target.value)} />
      </div>
    </div>
  );

  const renderBautismo = () => (
    <>
      {renderPersonaCampos('Datos del bautizado', bautismo.bautizado, (updater) => setBautismo((prev) => ({ ...prev, bautizado: updater(prev.bautizado) })), 'bautizado')}
      {renderPersonaCampos('Padre (opcional)', bautismo.padre, (updater) => setBautismo((prev) => ({ ...prev, padre: updater(prev.padre) })), 'padre')}
      {renderPersonaCampos('Madre (opcional)', bautismo.madre, (updater) => setBautismo((prev) => ({ ...prev, madre: updater(prev.madre) })), 'madre')}
      {renderPersonaCampos('Padrino (opcional)', bautismo.padrino, (updater) => setBautismo((prev) => ({ ...prev, padrino: updater(prev.padrino) })), 'padrino')}
      {renderPersonaCampos('Madrina (opcional)', bautismo.madrina, (updater) => setBautismo((prev) => ({ ...prev, madrina: updater(prev.madrina) })), 'madrina')}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label required>Fecha de nacimiento</Label>
          <Input type="date" className={inputClass(errors.fechaNacimiento)} max={fechaSacramento || undefined} value={bautismo.fechaNacimiento} onChange={(e) => setCampoBautismo('fechaNacimiento', e.target.value)} />
        </div>
        <div>
          <Label required>Hora de nacimiento</Label>
          <Input type="time" className={inputClass(errors.horaNacimiento)} value={bautismo.horaNacimiento} onChange={(e) => setCampoBautismo('horaNacimiento', e.target.value)} />
        </div>
        <div>
          <Label required>Lugar de nacimiento</Label>
          <Input type="text" maxLength={60} className={inputClass(errors.lugarNacimiento)} value={bautismo.lugarNacimiento} onChange={(e) => setCampoBautismo('lugarNacimiento', e.target.value)} />
        </div>
        <div>
          <Label required>Libro</Label>
          <Input type="text" maxLength={6} className={inputClass(errors.libro)} value={bautismo.libro} onChange={(e) => setCampoBautismo('libro', e.target.value)} />
        </div>
        <div>
          <Label required>Tomo</Label>
          <Input type="text" maxLength={6} className={inputClass(errors.tomo)} value={bautismo.tomo} onChange={(e) => setCampoBautismo('tomo', e.target.value)} />
        </div>
        <div>
          <Label required>Folio</Label>
          <Input type="text" maxLength={6} className={inputClass(errors.folio)} value={bautismo.folio} onChange={(e) => setCampoBautismo('folio', e.target.value)} />
        </div>
        <div>
          <Label required>Asiento</Label>
          <Input type="text" maxLength={6} className={inputClass(errors.asiento)} value={bautismo.asiento} onChange={(e) => setCampoBautismo('asiento', e.target.value)} />
        </div>
      </div>
    </>
  );

  const renderMatrimonio = () => (
    <>
      {renderPersonaCampos('Contrayente 1', matrimonio.contrayente1, (updater) => setMatrimonio((prev) => ({ ...prev, contrayente1: updater(prev.contrayente1) })), 'contrayente1')}
      {renderPersonaCampos('Contrayente 2', matrimonio.contrayente2, (updater) => setMatrimonio((prev) => ({ ...prev, contrayente2: updater(prev.contrayente2) })), 'contrayente2')}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label required>Libro</Label>
          <Input type="text" maxLength={6} className={inputClass(errors.libro)} value={matrimonio.libro} onChange={(e) => setCampoMatrimonio('libro', e.target.value)} />
        </div>
        <div>
          <Label required>Tomo</Label>
          <Input type="text" maxLength={6} className={inputClass(errors.tomo)} value={matrimonio.tomo} onChange={(e) => setCampoMatrimonio('tomo', e.target.value)} />
        </div>
        <div>
          <Label required>Folio</Label>
          <Input type="text" maxLength={6} className={inputClass(errors.folio)} value={matrimonio.folio} onChange={(e) => setCampoMatrimonio('folio', e.target.value)} />
        </div>
      </div>
    </>
  );

  const cargandoFicha = ficha.isPending || detalleQuery.isPending;

  return (
    <div ref={modalRef} className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-[90%] max-w-[820px] flex-col overflow-hidden rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-surface-muted px-6 py-5">
          <div>
            <h2 className="m-0 text-lg text-slate-800">EDITAR ACTA SACRAMENTAL</h2>
            <p className="m-0 mt-0.5 text-sm text-slate-500">
              {personaSacramental?.persona
                ? [personaSacramental.persona.nombre, personaSacramental.persona.primerApellido].filter(Boolean).join(' ') +
                  (personaSacramental.persona.cedula ? ` · ${personaSacramental.persona.cedula}` : '')
                : ''}
            </p>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-3xl text-gray-500 hover:bg-gray-100"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-gray-200 px-6">
          {TIPOS.map((t) => (
            <button
              key={t}
              type="button"
              className={cn(
                'shrink-0 cursor-pointer border-0 bg-transparent px-5 py-3 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600',
                activeTab === t && 'border-b-2 border-blue-600 text-blue-600',
              )}
              onClick={() => setActiveTab(t)}
            >
              {TIPO_SACRAMENTO_LABEL[t].toUpperCase()}
            </button>
          ))}
        </div>

        {cargandoFicha ? (
          <div className="flex min-h-0 flex-1 items-center justify-center gap-2 py-12 text-sm text-text-secondary">
            <Loader2 size={20} className="animate-spin" /> Cargando ficha...
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <Label required>Parroquia</Label>
                  <select
                    value={idParroquia}
                    onChange={(e) => setIdParroquia(e.target.value)}
                    className={inputClass(errors.idParroquia)}
                  >
                    <option value="">Seleccione...</option>
                    {(parroquias ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.canton ? `(${p.canton})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label required>Presbítero</Label>
                  <select
                    value={idPresbitero}
                    onChange={(e) => setIdPresbitero(e.target.value)}
                    className={inputClass(errors.idPresbitero)}
                  >
                    <option value="">Seleccione...</option>
                    {(presbiteros ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.primerApellido}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label required>Fecha de celebración</Label>
                  <Input
                    type="date"
                    className={inputClass(errors.fechaSacramento)}
                    value={fechaSacramento}
                    onChange={(e) => setFechaSacramento(e.target.value)}
                  />
                </div>
              </div>

              {activeTab === 'bautismo' && renderBautismo()}
              {(activeTab === 'comunion' || activeTab === 'confirmacion') &&
                renderPersonaCampos(
                  `Datos de la persona (${TIPO_SACRAMENTO_LABEL[activeTab]})`,
                  persona,
                  setPersona,
                  'persona',
                )}
              {activeTab === 'matrimonio' && renderMatrimonio()}

              <div>
                <Label>Observaciones</Label>
                <Input type="text" maxLength={500} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-surface-muted px-6 py-4">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving
                  ? 'GUARDANDO...'
                  : existeEnTab
                    ? 'GUARDAR CAMBIOS'
                    : `REGISTRAR ${TIPO_SACRAMENTO_LABEL[activeTab].toUpperCase()}`}
              </Button>
              <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
                CANCELAR
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditSacramentoModal;