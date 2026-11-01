import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, cn, ContadorCaracteres, CustomSelect, Input, Label, useToast } from '../../../shared/ui';
import { Loader2 } from 'lucide-react';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { useEscapeKey } from '../../../shared/hooks/useEscapeKey';
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
  CEDULA_DIGITOS,
  cedulaDigitosValidos,
  cedulaValida,
  numeroValido,
  soloLetras,
  soloNumeros,
  soloTextoSeguro,
  textoEnRango,
  textoSeguroValido,
} from '../../../shared/utils/formValidation';
import { opcionesLugarCelebracion } from '../constants/filialesCelebracion';
import {
  opcionesParentescoAbuelo,
  PARENTESCOS_ABUELOS,
} from '../constants/parentescosAbuelos';
import { obtenerDatosCedula } from '../../../services/cedulaService';
import { erroresVisibles, marcarTocado, mismosErrores, type CamposTocados } from '../Utils/validacionEnVivo';
import {
  MAX_CEDULA_NACIONAL,
  MAX_LIBRO,
  MAX_LUGAR_NACIMIENTO as LUGAR_NACIMIENTO_MAX,
  MAX_NOMBRE_PERSONA,
  MAX_OBSERVACIONES as OBSERVACIONES_MAX,
} from '../constants/limitesCampos';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sacramentoId: number | null;
  onUpdate: (id: number, dto: ActualizarSacramentoInput) => Promise<void>;
  onCreate: (dto: CrearSacramentoInput) => Promise<void>;
}

const TIPOS: TipoSacramento[] = ['bautismo', 'comunion', 'confirmacion', 'matrimonio'];

const inputClass = (hasError = false) =>
  cn(
    'w-full rounded-md border px-3 py-2.5 text-sm transition-colors focus:outline-none dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33] dark:text-[#f3f6fa] dark:placeholder:text-[#7f8da3] dark:focus:border-[#d9a928]',
    hasError
      ? 'border-red-500 bg-red-50 focus:border-red-600 dark:border-[#e66a6a] dark:bg-[rgba(230,106,106,0.10)]'
      : 'border-gray-300 focus:border-slate-500',
  );

const selectTriggerClass = (hasError = false) =>
  cn(
    'rounded-md! border! px-3! py-2.5! text-sm! font-normal! text-slate-900!',
    hasError
      ? 'border-red-500! bg-red-50! hover:bg-red-50! focus-visible:border-red-600! dark:border-[#e66a6a]! dark:bg-[rgba(230,106,106,0.10)]! dark:hover:bg-[rgba(230,106,106,0.10)]! dark:text-[#f3f6fa]!'
      : 'border-gray-300! bg-white! hover:bg-white! focus-visible:border-slate-500! dark:border-[rgba(220,230,242,0.12)]! dark:bg-[#0f1d33]! dark:text-[#f3f6fa]! dark:hover:bg-[#0f1d33]! dark:focus-visible:border-[#d9a928]!',
  );

const selectMenuClass =
  'rounded-md! border! border-gray-200! bg-white! shadow-[0_16px_35px_rgba(6,15,32,0.14)]! dark:border-[rgba(220,230,242,0.12)]! dark:bg-[#0f1d33]! dark:shadow-[0_18px_40px_rgba(0,0,0,0.5)]!';

const selectOptionClass =
  'font-normal! dark:text-[#c7d2e3]! dark:hover:bg-white/[0.06]! dark:hover:text-[#f3f6fa]!';

// Mensajes de validación mostrados bajo cada campo, igual que en la solicitud de sacramentos.
const MENSAJES: Record<string, string> = {
  idParroquia: 'Seleccione la filial.',
  idPresbitero: 'Seleccione el presbítero.',
  fechaSacramento: 'Seleccione la fecha de celebración.',
  bautizadoNombre: 'El nombre del bautizado es obligatorio.',
  bautizadoPrimerApellido: 'El primer apellido del bautizado es obligatorio.',
  bautizadoSegundoApellido: 'El segundo apellido del bautizado es obligatorio.',
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
    <span className="mt-1 block text-xs font-semibold text-red-500 dark:text-[#e66a6a]">⚠ {errors[clave]}</span>
  ) : null;

const formatearCedulaCR = (valor: string): string => {
  const digitos = valor.replace(/\D/g, '');
  const limpiados = digitos.replace(/^0+/, '').slice(0, 9);
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
  lugarNacimiento: soloTextoSeguro(detalle.lugarNacimiento ?? '', LUGAR_NACIMIENTO_MAX),
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

const EditSacramentoModal = ({ isOpen, onClose, sacramentoId, onUpdate, onCreate }: Props) => {
  const { showToast } = useToast();
  const { data: parroquias } = useListarParroquias();
  const { data: presbiteros } = useListarPresbiteros();
  const ficha = useObtenerSacramentosPersona(sacramentoId);
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
  const [campoCedulaCargando, setCampoCedulaCargando] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Campos que el usuario ya visitó (escribió o salió de ellos) y si ya intentó
  // guardar: deciden cuáles mensajes de error se muestran en la validación en vivo.
  const [tocados, setTocados] = useState<CamposTocados>({});
  const [intentado, setIntentado] = useState(false);
  // Resultado de la consulta de cédula por campo (bautizado, padre, ..., abuelo-0).
  // Va aparte de `errors` porque ese estado se limpia al cambiar de pestaña.
  const [consultasCedula, setConsultasCedula] = useState<
    Record<string, { digitos: string; estado: 'no_encontrada' | 'error' }>
  >({});

  // Devuelve el estado solo si corresponde a la cédula actual (evita mensajes
  // de una consulta vieja cuando el usuario ya cambió el número).
  const estadoConsultaCedula = (prefijo: string, cedula: string) => {
    const digitos = cedulaDigitosValidos(cedula);
    const registro = consultasCedula[prefijo];
    return registro && registro.digitos === digitos ? registro.estado : null;
  };

  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);
  useEscapeKey(isOpen, onClose, !saving);

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
    setObservaciones(soloTextoSeguro(detalle.observaciones ?? '', OBSERVACIONES_MAX));
  }, [isOpen, detalleQuery.data]);

  // Al cambiar de pestaña, precarga los datos base de ese sacramento si existe.
  useEffect(() => {
    if (!isOpen || !existeEnTab) return;
    const detalle = sacramentoDelTab!;
    setIdParroquia(String(detalle.parroquia?.id ?? ''));
    setIdPresbitero(detalle.presbitero ? String(detalle.presbitero.id) : '');
    setFechaSacramento(detalle.fechaSacramento ?? '');
    setObservaciones(soloTextoSeguro(detalle.observaciones ?? '', OBSERVACIONES_MAX));
    setErrors({});
    setTocados({});
    setIntentado(false);
  }, [isOpen, activeTab, existeEnTab]);

  // Al abrir/cerrar el modal (o cambiar de acta) se descartan los avisos de cédula.
  useEffect(() => {
    setConsultasCedula({});
  }, [isOpen, sacramentoId]);

  const setCampoPersona = (
    setter: React.Dispatch<React.SetStateAction<PersonaForm>>,
    campo: keyof PersonaForm,
    valor: string,
  ) => {
    if (campo === 'cedula' && cedulaDigitosValidos(valor).length === 0) {
      setter(() => ({ cedula: '', nombre: '', primerApellido: '', segundoApellido: '' }));
      return;
    }
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
    setBautismo((prev) => ({
      ...prev,
      [campo]: numerico
        ? soloNumeros(valor)
        : campo === 'lugarNacimiento'
          ? soloTextoSeguro(valor, LUGAR_NACIMIENTO_MAX)
          : valor,
    }));
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
          ? campo === 'cedula' && cedulaDigitosValidos(valor).length === 0
            ? { ...ab, cedula: '', nombre: '', primerApellido: '', segundoApellido: '' }
            : {
                ...ab,
                [campo]:
                  campo === 'cedula' ? formatearCedulaCR(cedulaDigitosValidos(valor)) : soloLetras(valor),
              }
          : ab,
      ),
    }));
  };

  // Al completar la cédula, consulta la API y sobrescribe nombre y apellidos con
  // los de esa cédula (al cambiarla se reemplazan los datos anteriores).
  const autocompletarPorCedula = async (
    setter: React.Dispatch<React.SetStateAction<PersonaForm>>,
    cedula: string,
    campo: string,
  ) => {
    const digitos = cedulaDigitosValidos(cedula);
    if (digitos.length !== 9) return;
    setCampoCedulaCargando(campo);
    try {
      const resultado = await obtenerDatosCedula(cedula);
      setter((prev) => {
        // Si el usuario cambió la cédula mientras se consultaba, no sobrescribir.
        if (cedulaDigitosValidos(prev.cedula) !== digitos) return prev;
        if (resultado.estado === 'encontrada') {
          return {
            ...prev,
            nombre: resultado.datos.nombre,
            primerApellido: resultado.datos.primerApellido,
            segundoApellido: resultado.datos.segundoApellido,
          };
        }
        // Cédula inexistente o proveedor caído: se limpian los nombres, pero los
        // campos quedan habilitados para escribirlos a mano.
        return {
          ...prev,
          nombre: '',
          primerApellido: '',
          segundoApellido: '',
        };
      });
      setConsultasCedula((prev) => {
        const siguiente = { ...prev };
        if (resultado.estado === 'encontrada') {
          delete siguiente[campo];
        } else {
          siguiente[campo] = { digitos, estado: resultado.estado };
        }
        return siguiente;
      });
    } finally {
      setCampoCedulaCargando((actual) => (actual === campo ? null : actual));
    }
  };

  // Autocompleta nombre y apellidos de un abuelo a partir de su cédula.
  const autocompletarAbueloPorCedula = async (idx: number, abuelo: PersonaForm & { parentesco: ParentescoAbuelo }) => {
    const digitos = cedulaDigitosValidos(abuelo.cedula);
    if (digitos.length !== 9) return;
    const campo = `abuelo-${idx}`;
    setCampoCedulaCargando(campo);
    try {
      const resultado = await obtenerDatosCedula(abuelo.cedula);
      setBautismo((prev) => ({
        ...prev,
        abuelos: prev.abuelos.map((a, i) => {
          if (i !== idx) return a;
          // Si el usuario cambió la cédula mientras se consultaba, no sobrescribir.
          if (cedulaDigitosValidos(a.cedula) !== digitos) return a;
          if (resultado.estado === 'encontrada') {
            return {
              ...a,
              nombre: resultado.datos.nombre,
              primerApellido: resultado.datos.primerApellido,
              segundoApellido: resultado.datos.segundoApellido,
            };
          }
          return {
            ...a,
            nombre: '',
            primerApellido: '',
            segundoApellido: '',
          };
        }),
      }));
      setConsultasCedula((prev) => {
        const siguiente = { ...prev };
        if (resultado.estado === 'encontrada') {
          delete siguiente[campo];
        } else {
          siguiente[campo] = { digitos, estado: resultado.estado };
        }
        return siguiente;
      });
    } finally {
      setCampoCedulaCargando((actual) => (actual === campo ? null : actual));
    }
  };

  const agregarAbueloBautismo = () => {
    const usados = bautismo.abuelos.map((a) => a.parentesco);
    const disponible = PARENTESCOS_ABUELOS.find((p) => !usados.includes(p));
    if (!disponible) {
      showToast('Ya están registrados los 4 abuelos', 'error');
      return;
    }
    setBautismo((prev) => ({
      ...prev,
      abuelos: [...prev.abuelos, { ...personaVacia(), parentesco: disponible }],
    }));
  };

  // Cálculo puro de los errores del formulario actual (sin efectos secundarios).
  const calcularErrores = (): Record<string, string> => {
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
      else if (prefijo === 'bautizado' && !p.segundoApellido.trim())
        nuevos[`${prefijo}SegundoApellido`] = MENSAJES[`${prefijo}SegundoApellido`];
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
      else if (!textoSeguroValido(bautismo.lugarNacimiento, LUGAR_NACIMIENTO_MAX))
        nuevos.lugarNacimiento =
          'El lugar de nacimiento contiene caracteres no permitidos.';
      if (observaciones.trim() && !textoSeguroValido(observaciones, OBSERVACIONES_MAX))
        nuevos.observaciones = 'Las observaciones contienen caracteres no permitidos.';
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

    return nuevos;
  };

  // Solo se ejecuta al guardar: publica todos los errores y enciende la validación en vivo.
  const validar = (): boolean => {
    const nuevos = calcularErrores();
    setErrors(nuevos);
    setIntentado(true);
    return Object.keys(nuevos).length === 0;
  };

  // Validación en vivo: recalcula al cambiar cualquier valor y publica solo los
  // mensajes de campos que el usuario ya tocó (o de los ya visibles). Así el
  // aviso desaparece apenas se corrige y aparece al salir de un campo vacío,
  // sin necesidad de intentar guardar.
  useEffect(() => {
    setErrors((anteriores) => {
      const visibles = erroresVisibles(calcularErrores(), anteriores, tocados, intentado);
      return mismosErrores(anteriores, visibles) ? anteriores : visibles;
    });
  }, [
    activeTab,
    idParroquia,
    idPresbitero,
    fechaSacramento,
    bautismo,
    matrimonio,
    observaciones,
    tocados,
    intentado,
  ]);

  // Marca como tocado el campo del que se salió o en el que se escribió, para
  // que la validación en vivo reaccione sin esperar al envío del formulario.
  const marcarCampoTocado = (e: React.SyntheticEvent<HTMLFormElement>) => {
    const clave = (e.target as HTMLInputElement).name;
    if (clave) setTocados((t) => marcarTocado(t, clave));
  };

  const construirBase = (): Pick<CrearSacramentoInput, 'idParroquia' | 'idPresbitero' | 'fechaSacramento' | 'observaciones'> => ({
    idParroquia: Number(idParroquia),
    idPresbitero: idPresbitero ? Number(idPresbitero) : undefined,
    fechaSacramento,
    // Las observaciones solo se registran en el bautismo; los demás sacramentos van únicamente con lugar y fecha.
    ...(activeTab === 'bautismo'
      ? { observaciones: soloTextoSeguro(observaciones, OBSERVACIONES_MAX).trim() || undefined }
      : {}),
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
          lugarNacimiento:
            soloTextoSeguro(bautismo.lugarNacimiento || '', LUGAR_NACIMIENTO_MAX).trim() ||
            undefined,
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

  const renderAvisoCedula = (prefijo: string, cedula: string) => {
    const estado = estadoConsultaCedula(prefijo, cedula);
    if (estado !== 'no_encontrada' && estado !== 'error') return null;
    return (
      <span
        role="alert"
        className="mt-1 block text-xs font-semibold text-red-500 dark:text-[#e66a6a]"
      >
        {estado === 'no_encontrada'
          ? 'Cédula no encontrada'
          : 'No se pudo verificar la cédula. Intente nuevamente.'}
      </span>
    );
  };

  const renderPersonaCampos = (
    titulo: string,
    persona: PersonaForm,
    setter: React.Dispatch<React.SetStateAction<PersonaForm>>,
    prefijo: string,
  ) => {
    // Con cédula completa se bloquean los nombres porque se autocompletan; si
    // la cédula no existe (o el proveedor falló) se habilitan para escribir a mano.
    const estadoCedula = estadoConsultaCedula(prefijo, persona.cedula);
    const nombresBloqueados =
      cedulaDigitosValidos(persona.cedula).length === 9 && estadoCedula === null;

    return (
      <div className="mb-5">
        <Label>{titulo}</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="relative">
              <Input type="text" placeholder="Cédula (0-0000-0000)" name={`${prefijo}Cedula`} maxLength={MAX_CEDULA_NACIONAL} className={cn(inputClass(Boolean(errors[`${prefijo}Cedula`])), 'pr-10')} value={persona.cedula} aria-invalid={estadoCedula === 'no_encontrada' || undefined} onChange={(e) => {
                const cedula = formatearCedulaCR(cedulaDigitosValidos(e.target.value));
                setCampoPersona(setter, 'cedula', e.target.value);
                if (cedulaDigitosValidos(cedula).length === 9) {
                  void autocompletarPorCedula(setter, cedula, prefijo);
                }
              }} />
              {campoCedulaCargando === prefijo && (
                <Loader2
                  aria-label="Buscando datos de la cédula"
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-royal-blue"
                />
              )}
            </div>
            {renderAvisoCedula(prefijo, persona.cedula)}
            <ContadorCaracteres
              actual={cedulaDigitosValidos(persona.cedula).length}
              maximo={CEDULA_DIGITOS}
              unidad="dígitos"
            />
            <ErrorMsg errors={errors} clave={`${prefijo}Cedula`} />
          </div>
          <div>
            <Input type="text" placeholder="Nombre" name={`${prefijo}Nombre`} maxLength={MAX_NOMBRE_PERSONA} className={inputClass(Boolean(errors[`${prefijo}Nombre`]))} value={persona.nombre} disabled={nombresBloqueados} title={nombresBloqueados ? 'Borre la cédula para cambiar el nombre.' : undefined} onChange={(e) => setCampoPersona(setter, 'nombre', e.target.value)} />
            <ErrorMsg errors={errors} clave={`${prefijo}Nombre`} />
            <ContadorCaracteres actual={persona.nombre.length} maximo={MAX_NOMBRE_PERSONA} />
          </div>
          <div>
            <Input type="text" placeholder="Primer apellido" name={`${prefijo}PrimerApellido`} maxLength={MAX_NOMBRE_PERSONA} className={inputClass(Boolean(errors[`${prefijo}PrimerApellido`]))} value={persona.primerApellido} disabled={nombresBloqueados} title={nombresBloqueados ? 'Borre la cédula para cambiar el apellido.' : undefined} onChange={(e) => setCampoPersona(setter, 'primerApellido', e.target.value)} />
            <ErrorMsg errors={errors} clave={`${prefijo}PrimerApellido`} />
            <ContadorCaracteres actual={persona.primerApellido.length} maximo={MAX_NOMBRE_PERSONA} />
          </div>
          <div>
            <Input type="text" placeholder="Segundo apellido" name={`${prefijo}SegundoApellido`} maxLength={MAX_NOMBRE_PERSONA} className={inputClass(Boolean(errors[`${prefijo}SegundoApellido`]))} value={persona.segundoApellido} disabled={nombresBloqueados} title={nombresBloqueados ? 'Borre la cédula para cambiar el apellido.' : undefined} onChange={(e) => setCampoPersona(setter, 'segundoApellido', e.target.value)} />
            <ErrorMsg errors={errors} clave={`${prefijo}SegundoApellido`} />
            <ContadorCaracteres actual={persona.segundoApellido.length} maximo={MAX_NOMBRE_PERSONA} />
          </div>
        </div>
      </div>
    );
  };

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
          {bautismo.abuelos.map((ab, idx) => {
            const estadoCedulaAbuelo = estadoConsultaCedula(`abuelo-${idx}`, ab.cedula);
            const abueloBloqueado =
              cedulaDigitosValidos(ab.cedula).length === 9 && estadoCedulaAbuelo === null;
            const parentescosUsados = bautismo.abuelos
              .filter((_, i) => i !== idx)
              .map((a) => a.parentesco);
            return (
            <div key={idx} className="rounded-md border border-gray-200 p-3 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33]">
              <CustomSelect
                className="mb-2"
                value={ab.parentesco}
                onChange={(parentesco) =>
                  setBautismo((prev) => ({
                    ...prev,
                    abuelos: prev.abuelos.map((a, i) =>
                      i === idx
                        ? { ...a, parentesco: parentesco as ParentescoAbuelo }
                        : a,
                    ),
                  }))
                }
                options={opcionesParentescoAbuelo(parentescosUsados, ab.parentesco)}
                ariaLabel="Parentesco del abuelo"
                maxVisibleOptions={4}
                triggerClassName={selectTriggerClass()}
                menuClassName={selectMenuClass}
                optionClassName={selectOptionClass}
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <div className="relative">
                    <Input type="text" placeholder="Cédula" maxLength={MAX_CEDULA_NACIONAL} value={ab.cedula} className="pr-10" onChange={(e) => {
                      setAbueloBautismoCampo(idx, 'cedula', e.target.value);
                      const cedula = formatearCedulaCR(cedulaDigitosValidos(e.target.value));
                      if (cedulaDigitosValidos(cedula).length === 9) {
                        void autocompletarAbueloPorCedula(idx, { ...ab, cedula });
                      }
                    }} />
                    {campoCedulaCargando === `abuelo-${idx}` && <Loader2 aria-label="Buscando datos de la cédula" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-royal-blue" />}
                  </div>
                  {renderAvisoCedula(`abuelo-${idx}`, ab.cedula)}
                  <ContadorCaracteres
                    actual={cedulaDigitosValidos(ab.cedula).length}
                    maximo={CEDULA_DIGITOS}
                    unidad="dígitos"
                  />
                </div>
                <div>
                  <Input type="text" placeholder="Nombre" maxLength={MAX_NOMBRE_PERSONA} value={ab.nombre} disabled={abueloBloqueado} onChange={(e) => setAbueloBautismoCampo(idx, 'nombre', e.target.value)} />
                  <ContadorCaracteres actual={ab.nombre.length} maximo={MAX_NOMBRE_PERSONA} />
                </div>
                <div>
                  <Input type="text" placeholder="Primer apellido" maxLength={MAX_NOMBRE_PERSONA} value={ab.primerApellido} disabled={abueloBloqueado} onChange={(e) => setAbueloBautismoCampo(idx, 'primerApellido', e.target.value)} />
                  <ContadorCaracteres actual={ab.primerApellido.length} maximo={MAX_NOMBRE_PERSONA} />
                </div>
                <div>
                  <Input type="text" placeholder="Segundo apellido" maxLength={MAX_NOMBRE_PERSONA} value={ab.segundoApellido} disabled={abueloBloqueado} onChange={(e) => setAbueloBautismoCampo(idx, 'segundoApellido', e.target.value)} />
                  <ContadorCaracteres actual={ab.segundoApellido.length} maximo={MAX_NOMBRE_PERSONA} />
                </div>
              </div>
            </div>
            );
          })}
        </div>
        <Button type="button" variant="secondary" onClick={agregarAbueloBautismo} className="mt-2">
          + Agregar abuelo
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label required>Fecha de nacimiento</Label>
          <Input type="date" name="fechaNacimiento" className={inputClass(Boolean(errors.fechaNacimiento))} max={fechaSacramento || undefined} value={bautismo.fechaNacimiento} onChange={(e) => setCampoBautismo('fechaNacimiento', e.target.value)} />
          <ErrorMsg errors={errors} clave="fechaNacimiento" />
        </div>
        <div>
          <Label required>Hora de nacimiento</Label>
          <Input type="time" name="horaNacimiento" className={inputClass(Boolean(errors.horaNacimiento))} value={bautismo.horaNacimiento} onChange={(e) => setCampoBautismo('horaNacimiento', e.target.value)} />
          <ErrorMsg errors={errors} clave="horaNacimiento" />
        </div>
        <div>
          <Label required>Lugar de nacimiento</Label>
          <Input type="text" name="lugarNacimiento" maxLength={LUGAR_NACIMIENTO_MAX} className={inputClass(Boolean(errors.lugarNacimiento))} value={bautismo.lugarNacimiento} onChange={(e) => setCampoBautismo('lugarNacimiento', e.target.value)} />
          <ErrorMsg errors={errors} clave="lugarNacimiento" />
          <ContadorCaracteres actual={bautismo.lugarNacimiento.length} maximo={LUGAR_NACIMIENTO_MAX} />
        </div>
        <div>
          <Label required>Libro</Label>
          <Input type="text" name="libro" maxLength={MAX_LIBRO} className={inputClass(Boolean(errors.libro))} value={bautismo.libro} onChange={(e) => setCampoBautismo('libro', e.target.value)} />
          <ErrorMsg errors={errors} clave="libro" />
          <ContadorCaracteres actual={bautismo.libro.length} maximo={MAX_LIBRO} />
        </div>
        <div>
          <Label required>Folio</Label>
          <Input type="text" name="folio" maxLength={MAX_LIBRO} className={inputClass(Boolean(errors.folio))} value={bautismo.folio} onChange={(e) => setCampoBautismo('folio', e.target.value)} />
          <ErrorMsg errors={errors} clave="folio" />
          <ContadorCaracteres actual={bautismo.folio.length} maximo={MAX_LIBRO} />
        </div>
        <div>
          <Label required>Asiento</Label>
          <Input type="text" name="asiento" maxLength={MAX_LIBRO} className={inputClass(Boolean(errors.asiento))} value={bautismo.asiento} onChange={(e) => setCampoBautismo('asiento', e.target.value)} />
          <ErrorMsg errors={errors} clave="asiento" />
          <ContadorCaracteres actual={bautismo.asiento.length} maximo={MAX_LIBRO} />
        </div>
      </div>
    </>
  );

  const renderMatrimonio = () => (
    <>
      <p className="mb-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33] dark:text-[#b7c3d4]">
        El primer contrayente es la persona inscrita en el Bautismo; solo ingrese el cónyuge.
      </p>
      {renderPersonaCampos('Cónyuge', matrimonio.contrayente2, (updater) => setMatrimonio((prev) => ({ ...prev, contrayente2: updater(prev.contrayente2) })), 'contrayente2')}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label required>Libro</Label>
          <Input type="text" name="libro" maxLength={MAX_LIBRO} className={inputClass(Boolean(errors.libro))} value={matrimonio.libro} onChange={(e) => setCampoMatrimonio('libro', e.target.value)} />
          <ErrorMsg errors={errors} clave="libro" />
          <ContadorCaracteres actual={matrimonio.libro.length} maximo={MAX_LIBRO} />
        </div>
        <div>
          <Label required>Folio</Label>
          <Input type="text" name="folio" maxLength={MAX_LIBRO} className={inputClass(Boolean(errors.folio))} value={matrimonio.folio} onChange={(e) => setCampoMatrimonio('folio', e.target.value)} />
          <ErrorMsg errors={errors} clave="folio" />
          <ContadorCaracteres actual={matrimonio.folio.length} maximo={MAX_LIBRO} />
        </div>
      </div>
    </>
  );

  const cargandoFicha = ficha.isPending || detalleQuery.isPending;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 dark:bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.16, ease: 'easeIn' } }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={onClose}
        >
          <motion.div
            className="flex max-h-[90vh] w-[90%] max-w-[820px] transform-gpu flex-col overflow-hidden rounded-xl bg-white dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-[0_22px_55px_rgba(0,0,0,0.6)] dark:[&_h2]:text-[#f3f6fa] dark:[&_button[aria-label]]:bg-white/5 dark:[&_button[aria-label]]:text-[#f3f6fa] dark:[&_button[aria-label]]:hover:bg-white/10"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.16, ease: 'easeIn' } }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-surface-muted px-6 py-5 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33]">
              <div>
                <h2 className="m-0 text-lg text-slate-800 dark:text-[#f3f6fa]">EDITAR ACTA SACRAMENTAL</h2>
                <p className="m-0 mt-0.5 text-sm text-slate-500 dark:text-[#7f8da3]">
                  {personaSacramental?.persona
                    ? [personaSacramental.persona.nombre, personaSacramental.persona.primerApellido].filter(Boolean).join(' ') +
                      (personaSacramental.persona.cedula ? ` · ${personaSacramental.persona.cedula}` : '')
                    : ''}
                </p>
              </div>
              <button
                type="button"
                aria-label="Cerrar"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-3xl text-gray-500 hover:bg-gray-100 dark:bg-white/5 dark:text-[#f3f6fa] dark:hover:bg-white/10"
                onClick={onClose}
              >
                ×
              </button>
            </div>

            <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-gray-200 px-6 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425]">
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
                        ? 'cursor-not-allowed text-gray-300 dark:text-[#7f8da3]'
                        : 'cursor-pointer text-gray-500 hover:text-blue-600 dark:text-[#b7c3d4] dark:hover:text-[#d9a928]',
                      activeTab === t &&
                        disponible &&
                        'border-b-2 border-blue-600 text-blue-600 dark:border-[#d9a928] dark:text-[#d9a928]',
                    )}
                    onClick={() => {
                      setActiveTab(t);
                      setErrors({});
                      setTocados({});
                      setIntentado(false);
                    }}
                  >
                    {TIPO_SACRAMENTO_LABEL[t].toUpperCase()}
                  </button>
                );
              })}
            </div>

            {cargandoFicha ? (
              <div className="flex min-h-0 flex-1 items-center justify-center gap-2 py-12 text-sm text-text-secondary dark:text-[#b7c3d4]">
                <Loader2 size={20} className="animate-spin" /> Cargando ficha...
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate onBlur={marcarCampoTocado} onChange={marcarCampoTocado} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 scrollbar-contenedor space-y-4 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <Label required>Filial</Label>
                      <CustomSelect
                        value={idParroquia}
                        onChange={(valor) => {
                          setIdParroquia(valor);
                          setTocados((t) => marcarTocado(t, 'idParroquia'));
                        }}
                        options={opcionesLugarCelebracion(
                          parroquias,
                          sacramentoDelTab?.parroquia ?? null,
                        ).map((lugar) => ({
                          label: lugar.nombre,
                          value: String(lugar.id),
                        }))}
                        placeholder="Seleccione..."
                        ariaLabel="Filial"
                        hasError={Boolean(errors.idParroquia)}
                        maxVisibleOptions={5}
                        triggerClassName={selectTriggerClass(Boolean(errors.idParroquia))}
                        menuClassName={selectMenuClass}
                        optionClassName={selectOptionClass}
                      />
                      <ErrorMsg errors={errors} clave="idParroquia" />
                    </div>
                    <div>
                      <Label required>Presbítero</Label>
                      <CustomSelect
                        value={idPresbitero}
                        onChange={(valor) => {
                          setIdPresbitero(valor);
                          setTocados((t) => marcarTocado(t, 'idPresbitero'));
                        }}
                        options={(presbiteros ?? []).map((p) => ({
                          label: `${p.nombre} ${p.primerApellido}`,
                          value: String(p.id),
                        }))}
                        placeholder="Seleccione..."
                        ariaLabel="Presbítero"
                        hasError={Boolean(errors.idPresbitero)}
                        maxVisibleOptions={5}
                        triggerClassName={selectTriggerClass(Boolean(errors.idPresbitero))}
                        menuClassName={selectMenuClass}
                        optionClassName={selectOptionClass}
                      />
                      <ErrorMsg errors={errors} clave="idPresbitero" />
                    </div>
                    <div>
                      <Label required>Fecha de celebración</Label>
                      <Input
                        type="date"
                        name="fechaSacramento"
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
                      <Input
                        type="text"
                        name="observaciones"
                        maxLength={OBSERVACIONES_MAX}
                        value={observaciones}
                        onChange={(e) =>
                          setObservaciones(soloTextoSeguro(e.target.value, OBSERVACIONES_MAX))
                        }
                      />
                      <ErrorMsg errors={errors} clave="observaciones" />
                      <ContadorCaracteres actual={observaciones.length} maximo={OBSERVACIONES_MAX} />
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-surface-muted px-6 py-4 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33]">
                  <Button type="submit" variant="royal" disabled={saving}>
                    {saving
                      ? 'GUARDANDO...'
                      : existeEnTab
                        ? 'GUARDAR CAMBIOS'
                        : `REGISTRAR ${TIPO_SACRAMENTO_LABEL[activeTab].toUpperCase()}`}
                  </Button>
                  <Button type="button" variant="secondary" onClick={onClose} disabled={saving} className="dark:border! dark:border-white/15! dark:bg-white/5! dark:text-[#f3f6fa] dark:hover:bg-white/15!">
                    CANCELAR
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditSacramentoModal;
