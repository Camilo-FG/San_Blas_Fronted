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
import { opcionesLugarCelebracion } from '../constants/filialesCelebracion';
import { obtenerDatosCedula } from '../../../services/cedulaService';

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

// Cache en memoria de las cédulas ya consultadas para evitar re-llamar a la API
// (Hacienda vía GoMeta) cada vez que se pierde el foco en el mismo campo.
const cacheCedulas = new Map<string, Awaited<ReturnType<typeof obtenerDatosCedula>>>();

const inputClass = (hasError = false) =>
  cn(
    'w-full rounded-md border px-3 py-2.5 text-sm transition-colors focus:outline-none',
    hasError
      ? 'border-red-500 bg-red-50 focus:border-red-600'
      : 'border-gray-300 focus:border-blue-600',
  );

// Mensajes de validación mostrados bajo cada campo, igual que en la solicitud de sacramentos.
const MENSAJES: Record<string, string> = {
  idParroquia: 'Seleccione la filial.',
  idPresbitero: 'Seleccione el presbítero.',
  fechaSacramento: 'Seleccione la fecha de celebración.',
  bautizadoNombre: 'El nombre del bautizado es obligatorio.',
  bautizadoPrimerApellido: 'El primer apellido del bautizado es obligatorio.',
  contrayente2Nombre: 'El nombre del cónyuge es obligatorio.',
  contrayente2PrimerApellido: 'El primer apellido del cónyuge es obligatorio.',
  fechaNacimiento: 'Seleccione la fecha de nacimiento.',
  horaNacimiento: 'Seleccione la hora de nacimiento.',
  lugarNacimiento: 'El lugar de nacimiento es obligatorio.',
  libro: 'El libro es obligatorio.',
  folio: 'El folio es obligatorio.',
  asiento: 'El asiento es obligatorio.',
};

const ErrorMsg = ({ errors, clave }: { errors: Record<string, string>; clave: string }) =>
  errors[clave] ? (
    <span className="mt-1 block text-xs font-semibold text-red-500">⚠ {errors[clave]}</span>
  ) : null;

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
  folio: detalle.folio ?? '',
  asiento: detalle.asiento ?? '',
});

interface MatrimonioForm {
  contrayente1: PersonaForm;
  contrayente2: PersonaForm;
  libro: string;
  folio: string;
}

const matrimonioVacio = (): MatrimonioForm => ({
  contrayente1: personaVacia(),
  contrayente2: personaVacia(),
  libro: '',
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  const personaSacramental = ficha.data;
  const tieneBautismo = Boolean(personaSacramental?.bautismo);

  // El sacramento que se está editando es el que se clickeó (detalleQuery.data).
  // La ficha por cédula solo sirve para los otros tabs y para prellenar la persona.
  const sacramentoDelTab: SacramentoDetalle | null | undefined =
    activeTab === 'bautismo'
      ? (detalleQuery.data?.tipo === 'bautismo'
          ? detalleQuery.data
          : personaSacramental?.bautismo)
      : activeTab === 'comunion'
        ? (detalleQuery.data?.tipo === 'comunion'
            ? detalleQuery.data
            : personaSacramental?.comunion)
        : activeTab === 'confirmacion'
          ? (detalleQuery.data?.tipo === 'confirmacion'
              ? detalleQuery.data
              : personaSacramental?.confirmacion)
          : (detalleQuery.data?.tipo === 'matrimonio'
              ? detalleQuery.data
              : personaSacramental?.matrimonio);

  const existeEnTab = Boolean(sacramentoDelTab);

  // Proceso lineal: para agregar un sacramento deben existir los anteriores
  // (bautismo -> comunión -> confirmación -> matrimonio). El que se está
  // editando (detalleQuery.data) siempre queda habilitado.
  const habilitado = (t: TipoSacramento): boolean => {
    if (detalleQuery.data?.tipo === t) return true;
    if (t === 'bautismo') return true;
    if (t === 'comunion') return Boolean(personaSacramental?.bautismo);
    if (t === 'confirmacion')
      return Boolean(personaSacramental?.bautismo && personaSacramental?.comunion);
    return Boolean(
      personaSacramental?.bautismo &&
        personaSacramental?.comunion &&
        personaSacramental?.confirmacion,
    );
  };

  // Inicializa el formulario según la ficha de la persona (o el detalle si no hay cédula).
  useEffect(() => {
    if (!isOpen) return;
    const personaBase = personaSacramental?.persona;
    const detalle = detalleQuery.data;

    if (detalle?.tipo === 'bautismo' && !personaSacramental?.bautismo) {
      setBautismo(bautismoDesdeDetalle(detalle.detalle as DetalleBautismo));
    } else if (personaSacramental?.bautismo) {
      setBautismo(bautismoDesdeDetalle(personaSacramental.bautismo.detalle as DetalleBautismo));
    } else {
      setBautismo({ ...bautismoVacio(), bautizado: aPersonaForm(personaBase) });
    }

    if (detalle?.tipo === 'comunion' && !personaSacramental?.comunion) {
      setPersona(aPersonaForm((detalle.detalle as { persona: PersonaDetalle }).persona));
    } else if (personaSacramental?.comunion) {
      setPersona(aPersonaForm((personaSacramental.comunion.detalle as { persona: PersonaDetalle }).persona));
    } else {
      setPersona(aPersonaForm(personaBase));
    }

    if (detalle?.tipo === 'matrimonio' && !personaSacramental?.matrimonio) {
      const detalleMatrimonio = detalle.detalle as {
        contrayente1: PersonaDetalle;
        contrayente2: PersonaDetalle;
        libro: string | null;
        folio: string | null;
      };
      setMatrimonio({
        contrayente1: aPersonaForm(detalleMatrimonio.contrayente1),
        contrayente2: aPersonaForm(detalleMatrimonio.contrayente2),
        libro: detalleMatrimonio.libro ?? '',
        folio: detalleMatrimonio.folio ?? '',
      });
    } else if (personaSacramental?.matrimonio) {
      const detalleMatrimonio = personaSacramental.matrimonio.detalle as {
        contrayente1: PersonaDetalle;
        contrayente2: PersonaDetalle;
        libro: string | null;
        folio: string | null;
      };
      setMatrimonio({
        contrayente1: aPersonaForm(detalleMatrimonio.contrayente1),
        contrayente2: aPersonaForm(detalleMatrimonio.contrayente2),
        libro: detalleMatrimonio.libro ?? '',
        folio: detalleMatrimonio.folio ?? '',
      });
    } else {
      setMatrimonio({ ...matrimonioVacio(), contrayente1: aPersonaForm(personaBase) });
    }
  }, [isOpen, personaSacramental, detalleQuery.data]);

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
    const numerico = ['libro', 'folio', 'asiento'].includes(campo);
    setBautismo((prev) => ({ ...prev, [campo]: numerico ? soloNumeros(valor) : valor }));
  };

  const setCampoMatrimonio = (
    campo: keyof MatrimonioForm,
    valor: string,
  ) => {
    const numerico = ['libro', 'folio'].includes(campo);
    setMatrimonio((prev) => ({ ...prev, [campo]: numerico ? soloNumeros(valor) : valor }));
  };

  const setAbueloBautismoCampo = (idx: number, campo: keyof PersonaForm, valor: string) => {
    setBautismo((prev) => ({
      ...prev,
      abuelos: prev.abuelos.map((ab, i) =>
        i === idx
          ? {
              ...ab,
              [campo]:
                campo === 'cedula' ? formatearCedulaCR(cedulaDigitosValidos(valor)) : soloLetras(valor),
            }
          : ab,
      ),
    }));
  };

  // Al completar la cédula, consulta la API de cédulas (Hacienda vía GoMeta) y
  // autocompleta nombre y apellidos solo si esos campos están vacíos.
  // Usa un cache en memoria para no re-llamar a la API por la misma cédula.
  const autocompletarPorCedula = async (
    setter: React.Dispatch<React.SetStateAction<PersonaForm>>,
    cedula: string,
    persona: PersonaForm,
  ) => {
    const digitos = cedulaDigitosValidos(cedula);
    if (digitos.length !== 9) return;
    if (persona.nombre.trim() && persona.primerApellido.trim()) return;
    if (cacheCedulas.has(cedula)) return;
    const datos = await obtenerDatosCedula(cedula);
    cacheCedulas.set(cedula, datos ?? null);
    if (!datos) return;
    setter((prev) => ({
      ...prev,
      nombre: prev.nombre.trim() ? prev.nombre : datos.nombre,
      primerApellido: prev.primerApellido.trim()
        ? prev.primerApellido
        : datos.primerApellido,
      segundoApellido: prev.segundoApellido.trim()
        ? prev.segundoApellido
        : datos.segundoApellido,
    }));
  };

  // Autocompleta nombre y apellidos de un abuelo a partir de su cédula (usa cache).
  const autocompletarAbueloPorCedula = async (idx: number, abuelo: PersonaForm & { parentesco: ParentescoAbuelo }) => {
    const digitos = cedulaDigitosValidos(abuelo.cedula);
    if (digitos.length !== 9) return;
    if (abuelo.nombre.trim() && abuelo.primerApellido.trim()) return;
    if (cacheCedulas.has(abuelo.cedula)) return;
    const datos = await obtenerDatosCedula(abuelo.cedula);
    cacheCedulas.set(abuelo.cedula, datos ?? null);
    if (!datos) return;
    setBautismo((prev) => ({
      ...prev,
      abuelos: prev.abuelos.map((a, i) =>
        i === idx
          ? {
              ...a,
              nombre: a.nombre.trim() ? a.nombre : datos.nombre,
              primerApellido: a.primerApellido.trim() ? a.primerApellido : datos.primerApellido,
              segundoApellido: a.segundoApellido.trim() ? a.segundoApellido : datos.segundoApellido,
            }
          : a,
      ),
    }));
  };

  const agregarAbueloBautismo = () => {
    const usados = bautismo.abuelos.map((a) => a.parentesco);
    const disponible = PARENTESCOS.find((p) => !usados.includes(p));
    if (!disponible) {
      showToast('Ya están registrados los 4 abuelos', 'error');
      return;
    }
    setBautismo((prev) => ({
      ...prev,
      abuelos: [...prev.abuelos, { ...personaVacia(), parentesco: disponible }],
    }));
  };

  const validar = (): boolean => {
    const nuevos: Record<string, string> = {};
    if (!idParroquia) nuevos.idParroquia = MENSAJES.idParroquia;
    if (!idPresbitero) nuevos.idPresbitero = MENSAJES.idPresbitero;
    if (!fechaSacramento) nuevos.fechaSacramento = MENSAJES.fechaSacramento;

    const personaOk = (p: PersonaForm, prefijo: string) => {
      if (!p.nombre.trim()) nuevos[`${prefijo}Nombre`] = MENSAJES[`${prefijo}Nombre`];
      else if (!textoEnRango(p.nombre))
        nuevos[`${prefijo}Nombre`] = 'El nombre debe tener entre 2 y 30 caracteres.';
      if (!p.primerApellido.trim())
        nuevos[`${prefijo}PrimerApellido`] = MENSAJES[`${prefijo}PrimerApellido`];
      else if (!textoEnRango(p.primerApellido))
        nuevos[`${prefijo}PrimerApellido`] = 'El primer apellido debe tener entre 2 y 30 caracteres.';
      if (p.segundoApellido.trim() && !textoEnRango(p.segundoApellido))
        nuevos[`${prefijo}SegundoApellido`] = 'El segundo apellido debe tener entre 2 y 30 caracteres.';
      if (p.cedula.trim() && !cedulaValida(p.cedula))
        nuevos[`${prefijo}Cedula`] = 'La cédula no es válida.';
    };

    const numericosOk = (libro: string, folio: string, asiento?: string) => {
      if (libro.trim() && !numeroValido(libro)) nuevos.libro = 'El libro debe ser un número válido.';
      if (folio.trim() && !numeroValido(folio)) nuevos.folio = 'El folio debe ser un número válido.';
      if (asiento && asiento.trim() && !numeroValido(asiento))
        nuevos.asiento = 'El asiento debe ser un número válido.';
    };

    if (activeTab === 'bautismo') {
      personaOk(bautismo.bautizado, 'bautizado');
      if (!bautismo.libro.trim()) nuevos.libro = MENSAJES.libro;
      if (!bautismo.folio.trim()) nuevos.folio = MENSAJES.folio;
      if (!bautismo.asiento.trim()) nuevos.asiento = MENSAJES.asiento;
      numericosOk(bautismo.libro, bautismo.folio, bautismo.asiento);
      if (!bautismo.fechaNacimiento) nuevos.fechaNacimiento = MENSAJES.fechaNacimiento;
      if (!bautismo.horaNacimiento) nuevos.horaNacimiento = MENSAJES.horaNacimiento;
      if (!bautismo.lugarNacimiento.trim())
        nuevos.lugarNacimiento = MENSAJES.lugarNacimiento;
      if (
        bautismo.fechaNacimiento &&
        fechaSacramento &&
        bautismo.fechaNacimiento > fechaSacramento
      ) {
        nuevos.fechaNacimiento =
          'La fecha de nacimiento no puede ser posterior a la fecha de celebración.';
        nuevos.fechaSacramento =
          'La fecha de celebración no puede ser anterior a la fecha de nacimiento.';
      }
    }
    if (activeTab === 'matrimonio') {
      personaOk(matrimonio.contrayente2, 'contrayente2');
      if (!matrimonio.libro.trim()) nuevos.libro = MENSAJES.libro;
      if (!matrimonio.folio.trim()) nuevos.folio = MENSAJES.folio;
      numericosOk(matrimonio.libro, matrimonio.folio);
    }
    // Comunión/confirmación no llevan datos de persona: usan la del bautismo.

    setErrors(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const construirBase = (): Pick<CrearSacramentoInput, 'idParroquia' | 'idPresbitero' | 'fechaSacramento' | 'observaciones'> => ({
    idParroquia: Number(idParroquia),
    idPresbitero: idPresbitero ? Number(idPresbitero) : undefined,
    fechaSacramento,
    // Las observaciones solo se registran en el bautismo; los demás sacramentos van únicamente con lugar y fecha.
    ...(activeTab === 'bautismo' ? { observaciones: observaciones.trim() || undefined } : {}),
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
        folio: (matrimonio.folio || '').trim() || undefined,
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!habilitado(activeTab)) {
      showToast('Complete el sacramento anterior para poder registrar este.', 'error');
      return;
    }

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
      if (err?.response?.status === 409) {
        // Muestra el mensaje del backend (ej: cédula de un bautizado ya registrado).
        const mensaje =
          err?.response?.data?.mensaje ??
          'Este expediente ya tiene registrado ese tipo de sacramento.';
        showToast(String(mensaje), 'error');
      } else {
        const mensaje =
          err?.response?.data?.mensaje ?? err?.message ?? 'No se pudo guardar el acta.';
        showToast(String(mensaje), 'error');
      }
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
        <div>
          <Input type="text" placeholder="Cédula (0-0000-0000)" maxLength={12} className={inputClass(Boolean(errors[`${prefijo}Cedula`]))} value={persona.cedula} onChange={(e) => setCampoPersona(setter, 'cedula', e.target.value)} onBlur={() => void autocompletarPorCedula(setter, persona.cedula, persona)} />
          <ErrorMsg errors={errors} clave={`${prefijo}Cedula`} />
        </div>
        <div>
          <Input type="text" placeholder="Nombre" maxLength={30} className={inputClass(Boolean(errors[`${prefijo}Nombre`]))} value={persona.nombre} onChange={(e) => setCampoPersona(setter, 'nombre', e.target.value)} />
          <ErrorMsg errors={errors} clave={`${prefijo}Nombre`} />
        </div>
        <div>
          <Input type="text" placeholder="Primer apellido" maxLength={30} className={inputClass(Boolean(errors[`${prefijo}PrimerApellido`]))} value={persona.primerApellido} onChange={(e) => setCampoPersona(setter, 'primerApellido', e.target.value)} />
          <ErrorMsg errors={errors} clave={`${prefijo}PrimerApellido`} />
        </div>
        <div>
          <Input type="text" placeholder="Segundo apellido" maxLength={30} className={inputClass(Boolean(errors[`${prefijo}SegundoApellido`]))} value={persona.segundoApellido} onChange={(e) => setCampoPersona(setter, 'segundoApellido', e.target.value)} />
          <ErrorMsg errors={errors} clave={`${prefijo}SegundoApellido`} />
        </div>
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

      <div className="mb-5">
        <Label>Abuelos (opcional)</Label>
        <div className="space-y-3">
          {bautismo.abuelos.map((ab, idx) => (
            <div key={idx} className="rounded-md border border-gray-200 p-3">
              <select
                value={ab.parentesco}
                onChange={(e) =>
                  setBautismo((prev) => ({
                    ...prev,
                    abuelos: prev.abuelos.map((a, i) =>
                      i === idx ? { ...a, parentesco: e.target.value as ParentescoAbuelo } : a,
                    ),
                  }))
                }
                className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {PARENTESCOS.map((p) => (
                  <option
                    key={p}
                    value={p}
                    disabled={bautismo.abuelos.some((a, i) => a.parentesco === p && i !== idx)}
                  >
                    {p.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Input type="text" placeholder="Cédula" maxLength={12} value={ab.cedula} onChange={(e) => setAbueloBautismoCampo(idx, 'cedula', e.target.value)} onBlur={() => void autocompletarAbueloPorCedula(idx, ab)} />
                <Input type="text" placeholder="Nombre" maxLength={30} value={ab.nombre} onChange={(e) => setAbueloBautismoCampo(idx, 'nombre', e.target.value)} />
                <Input type="text" placeholder="Primer apellido" maxLength={30} value={ab.primerApellido} onChange={(e) => setAbueloBautismoCampo(idx, 'primerApellido', e.target.value)} />
                <Input type="text" placeholder="Segundo apellido" maxLength={30} value={ab.segundoApellido} onChange={(e) => setAbueloBautismoCampo(idx, 'segundoApellido', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" onClick={agregarAbueloBautismo} className="mt-2">
          + Agregar abuelo
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label required>Fecha de nacimiento</Label>
          <Input type="date" className={inputClass(Boolean(errors.fechaNacimiento))} max={fechaSacramento || undefined} value={bautismo.fechaNacimiento} onChange={(e) => setCampoBautismo('fechaNacimiento', e.target.value)} />
          <ErrorMsg errors={errors} clave="fechaNacimiento" />
        </div>
        <div>
          <Label required>Hora de nacimiento</Label>
          <Input type="time" className={inputClass(Boolean(errors.horaNacimiento))} value={bautismo.horaNacimiento} onChange={(e) => setCampoBautismo('horaNacimiento', e.target.value)} />
          <ErrorMsg errors={errors} clave="horaNacimiento" />
        </div>
        <div>
          <Label required>Lugar de nacimiento</Label>
          <Input type="text" maxLength={60} className={inputClass(Boolean(errors.lugarNacimiento))} value={bautismo.lugarNacimiento} onChange={(e) => setCampoBautismo('lugarNacimiento', e.target.value)} />
          <ErrorMsg errors={errors} clave="lugarNacimiento" />
        </div>
        <div>
          <Label required>Libro</Label>
          <Input type="text" maxLength={6} className={inputClass(Boolean(errors.libro))} value={bautismo.libro} onChange={(e) => setCampoBautismo('libro', e.target.value)} />
          <ErrorMsg errors={errors} clave="libro" />
        </div>
        <div>
          <Label required>Folio</Label>
          <Input type="text" maxLength={6} className={inputClass(Boolean(errors.folio))} value={bautismo.folio} onChange={(e) => setCampoBautismo('folio', e.target.value)} />
          <ErrorMsg errors={errors} clave="folio" />
        </div>
        <div>
          <Label required>Asiento</Label>
          <Input type="text" maxLength={6} className={inputClass(Boolean(errors.asiento))} value={bautismo.asiento} onChange={(e) => setCampoBautismo('asiento', e.target.value)} />
          <ErrorMsg errors={errors} clave="asiento" />
        </div>
      </div>
    </>
  );

  const renderMatrimonio = () => (
    <>
      <p className="mb-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
        El primer contrayente es la persona inscrita en el Bautismo; solo ingrese el cónyuge.
      </p>
      {renderPersonaCampos('Cónyuge', matrimonio.contrayente2, (updater) => setMatrimonio((prev) => ({ ...prev, contrayente2: updater(prev.contrayente2) })), 'contrayente2')}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label required>Libro</Label>
          <Input type="text" maxLength={6} className={inputClass(Boolean(errors.libro))} value={matrimonio.libro} onChange={(e) => setCampoMatrimonio('libro', e.target.value)} />
          <ErrorMsg errors={errors} clave="libro" />
        </div>
        <div>
          <Label required>Folio</Label>
          <Input type="text" maxLength={6} className={inputClass(Boolean(errors.folio))} value={matrimonio.folio} onChange={(e) => setCampoMatrimonio('folio', e.target.value)} />
          <ErrorMsg errors={errors} clave="folio" />
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
          {TIPOS.map((t) => {
            const disponible = habilitado(t);
            return (
              <button
                key={t}
                type="button"
                disabled={!disponible}
                title={
                  disponible
                    ? undefined
                    : 'Complete el sacramento anterior para desbloquear este'
                }
                className={cn(
                  'shrink-0 border-0 bg-transparent px-5 py-3 text-sm font-medium transition-colors',
                  !disponible
                    ? 'cursor-not-allowed text-gray-300'
                    : 'cursor-pointer text-gray-500 hover:text-blue-600',
                  activeTab === t &&
                    disponible &&
                    'border-b-2 border-blue-600 text-blue-600',
                )}
                onClick={() => {
                  setActiveTab(t);
                  setErrors({});
                }}
              >
                {TIPO_SACRAMENTO_LABEL[t].toUpperCase()}
              </button>
            );
          })}
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
                  <Label required>Filial</Label>
                  <select
                    value={idParroquia}
                    onChange={(e) => setIdParroquia(e.target.value)}
                    className={inputClass(Boolean(errors.idParroquia))}
                  >
                    <option value="">Seleccione...</option>
                    {opcionesLugarCelebracion(
                      parroquias,
                      sacramentoDelTab?.parroquia ?? null,
                    ).map((lugar) => (
                      <option key={lugar.id} value={lugar.id}>
                        {lugar.nombre}
                      </option>
                    ))}
                  </select>
                  <ErrorMsg errors={errors} clave="idParroquia" />
                </div>
                <div>
                  <Label required>Presbítero</Label>
                  <select
                    value={idPresbitero}
                    onChange={(e) => setIdPresbitero(e.target.value)}
                    className={inputClass(Boolean(errors.idPresbitero))}
                  >
                    <option value="">Seleccione...</option>
                    {(presbiteros ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.primerApellido}
                      </option>
                    ))}
                  </select>
                  <ErrorMsg errors={errors} clave="idPresbitero" />
                </div>
                <div>
                  <Label required>Fecha de celebración</Label>
                  <Input
                    type="date"
                    className={inputClass(Boolean(errors.fechaSacramento))}
                    value={fechaSacramento}
                    onChange={(e) => setFechaSacramento(e.target.value)}
                  />
                  <ErrorMsg errors={errors} clave="fechaSacramento" />
                </div>
              </div>

              {activeTab === 'bautismo' && renderBautismo()}
              {activeTab === 'matrimonio' && renderMatrimonio()}

              {activeTab === 'bautismo' && (
                <div>
                  <Label>Observaciones</Label>
                  <Input type="text" maxLength={500} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
                  <p className="m-0 mt-1 text-right text-xs text-slate-400">
                    {observaciones.length}/500 caracteres
                  </p>
                </div>
              )}
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-surface-muted px-6 py-4">
              <Button type="submit" variant="royal" disabled={saving}>
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