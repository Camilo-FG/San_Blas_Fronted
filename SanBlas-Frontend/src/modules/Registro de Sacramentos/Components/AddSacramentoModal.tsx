import { useEffect, useRef, useState } from 'react';
import { Button, cn, Input, Label, useToast } from '../../../shared/ui';
import { Loader2 } from 'lucide-react';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { useListarParroquias } from '../hooks/hooksNuevos/useListarParroquias';
import { useListarPresbiteros } from '../hooks/hooksNuevos/useListarPresbiteros';
import {
  AbueloInput,
  CrearSacramentoInput,
  ParentescoAbuelo,
  TipoSacramento,
  TIPO_SACRAMENTO_LABEL,
} from '../../../types/sacramentosNuevos';
import {
  cedulaDigitosValidos,
  soloLetras,
  soloNumeros,
} from '../../../shared/utils/formValidation';
import { opcionesLugarCelebracion } from '../constants/filialesCelebracion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CrearSacramentoInput) => Promise<void>;
  tieneBautismo: boolean;
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

const AddSacramentoModal = ({ isOpen, onClose, onSave, tieneBautismo }: Props) => {
  const { showToast } = useToast();
  const { data: parroquias, isPending: cargandoParroquias } = useListarParroquias();
  const { data: presbiteros, isPending: cargandoPresbiteros } = useListarPresbiteros();

  const [tipo, setTipo] = useState<TipoSacramento>('bautismo');
  const [idParroquia, setIdParroquia] = useState('');
  const [idPresbitero, setIdPresbitero] = useState('');
  const [fechaSacramento, setFechaSacramento] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [bautizado, setBautizado] = useState<PersonaForm>(personaVacia);
  const [padre, setPadre] = useState<PersonaForm>(personaVacia);
  const [madre, setMadre] = useState<PersonaForm>(personaVacia);
  const [padrino, setPadrino] = useState<PersonaForm>(personaVacia);
  const [madrina, setMadrina] = useState<PersonaForm>(personaVacia);
  const [abuelos, setAbuelos] = useState<(PersonaForm & { parentesco: ParentescoAbuelo })[]>([]);
  const [persona, setPersona] = useState<PersonaForm>(personaVacia);
  const [contrayente1, setContrayente1] = useState<PersonaForm>(personaVacia);
  const [contrayente2, setContrayente2] = useState<PersonaForm>(personaVacia);
  const [detalleBautismo, setDetalleBautismo] = useState({
    fechaNacimiento: '',
    horaNacimiento: '',
    lugarNacimiento: '',
    libro: '',
    folio: '',
    asiento: '',
  });
  const [detalleMatrimonio, setDetalleMatrimonio] = useState({
    libro: '',
    folio: '',
  });

  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    if (!isOpen) {
      setTipo('bautismo');
      setIdParroquia('');
      setIdPresbitero('');
      setFechaSacramento('');
      setObservaciones('');
      setBautizado(personaVacia());
      setPadre(personaVacia());
      setMadre(personaVacia());
      setPadrino(personaVacia());
      setMadrina(personaVacia());
      setAbuelos([]);
      setPersona(personaVacia());
      setContrayente1(personaVacia());
      setContrayente2(personaVacia());
      setDetalleBautismo({ fechaNacimiento: '', horaNacimiento: '', lugarNacimiento: '', libro: '', folio: '', asiento: '' });
      setDetalleMatrimonio({ libro: '', folio: '' });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Orden estricto de la cadena: bautismo -> comunion -> confirmacion -> matrimonio.
  const ORDEN: TipoSacramento[] = ['bautismo', 'comunion', 'confirmacion', 'matrimonio'];

  // true si el sacramento tiene sus campos requeridos completos (coincide con los `*` del formulario).
  const completo = (t: TipoSacramento): boolean => {
    const base = idParroquia !== '' && idPresbitero !== '' && fechaSacramento !== '';
    if (t === 'bautismo')
      return (
        base &&
        bautizado.nombre.trim() !== '' &&
        bautizado.primerApellido.trim() !== '' &&
        detalleBautismo.fechaNacimiento !== '' &&
        detalleBautismo.horaNacimiento !== '' &&
        detalleBautismo.lugarNacimiento.trim() !== '' &&
        detalleBautismo.libro.trim() !== '' &&
        detalleBautismo.folio.trim() !== '' &&
        detalleBautismo.asiento.trim() !== ''
      );
    // Comunión y confirmación solo piden lugar y fecha: la persona es la misma del bautismo.
    if (t === 'comunion' || t === 'confirmacion') return base;
    // El matrimonio solo pide el cónyuge: el primer contrayente es la persona del bautismo.
    return (
      base &&
      contrayente2.nombre.trim() !== '' &&
      contrayente2.primerApellido.trim() !== '' &&
      detalleMatrimonio.libro.trim() !== '' &&
      detalleMatrimonio.folio.trim() !== ''
    );
  };

  // Una pestaña se habilita solo si la inmediatamente anterior (y las previas) está completa.
  const habilitado = (t: TipoSacramento): boolean => {
    const idx = ORDEN.indexOf(t);
    if (idx === 0) return true;
    return completo(ORDEN[idx - 1]) && habilitado(ORDEN[idx - 1]);
  };

  // Al avanzar de pestaña, reutiliza la persona ya registrada en el bautismo
  // para el resto de sacramentos del expediente (por lógica es la misma persona).
  // Así no se vuelve a pedir ni a repetir la cédula de la persona bautizada.
  const cambiarTab = (nuevo: TipoSacramento) => {
    if (nuevo === tipo) return;
    if (tipo === 'bautismo' && nuevo !== 'bautismo') {
      setPersona((prev) => ({ ...bautizado, ...prev }));
    }
    // El primer contrayente del matrimonio es la misma persona del expediente.
    if (nuevo === 'matrimonio') {
      const base = { ...bautizado, ...persona };
      setContrayente1((prev) => ({ ...base, ...prev }));
    }
    setErrors({});
    setTipo(nuevo);
  };

  const setPersonaCampo = (
    setter: React.Dispatch<React.SetStateAction<PersonaForm>>,
    campo: keyof PersonaForm,
    valor: string,
  ) => {
    setter((prev) => ({
      ...prev,
      [campo]:
        campo === 'cedula' ? formatearCedulaCR(cedulaDigitosValidos(valor)) : soloLetras(valor),
    }));
  };

  const setAbueloCampo = (idx: number, campo: keyof PersonaForm, valor: string) => {
    setAbuelos((prev) =>
      prev.map((ab, i) =>
        i === idx
          ? {
              ...ab,
              [campo]:
                campo === 'cedula' ? formatearCedulaCR(cedulaDigitosValidos(valor)) : soloLetras(valor),
            }
          : ab,
      ),
    );
  };

  const setDetalleBautismoCampo = (campo: 'libro' | 'folio' | 'asiento', valor: string) =>
    setDetalleBautismo((p) => ({ ...p, [campo]: soloNumeros(valor) }));

  const setDetalleMatrimonioCampo = (campo: 'libro' | 'folio', valor: string) =>
    setDetalleMatrimonio((p) => ({ ...p, [campo]: soloNumeros(valor) }));

  const agregarAbuelo = () => {
    const usados = abuelos.map((a) => a.parentesco);
    const disponible = PARENTESCOS.find((p) => !usados.includes(p));
    if (!disponible) {
      showToast('Ya están registrados los 4 abuelos', 'error');
      return;
    }
    setAbuelos((prev) => [...prev, { ...personaVacia(), parentesco: disponible }]);
  };

  const validar = (): boolean => {
    const nuevos: Record<string, string> = {};
    if (!idParroquia) nuevos.idParroquia = MENSAJES.idParroquia;
    if (!idPresbitero) nuevos.idPresbitero = MENSAJES.idPresbitero;
    if (!fechaSacramento) nuevos.fechaSacramento = MENSAJES.fechaSacramento;

    const personaOk = (p: PersonaForm, prefijo: string) => {
      if (!p.nombre.trim()) nuevos[`${prefijo}Nombre`] = MENSAJES[`${prefijo}Nombre`];
      if (!p.primerApellido.trim())
        nuevos[`${prefijo}PrimerApellido`] = MENSAJES[`${prefijo}PrimerApellido`];
    };

    if (tipo === 'bautismo') {
      personaOk(bautizado, 'bautizado');
      if (!detalleBautismo.fechaNacimiento) nuevos.fechaNacimiento = MENSAJES.fechaNacimiento;
      if (!detalleBautismo.horaNacimiento) nuevos.horaNacimiento = MENSAJES.horaNacimiento;
      if (!detalleBautismo.lugarNacimiento.trim())
        nuevos.lugarNacimiento = MENSAJES.lugarNacimiento;
      if (!detalleBautismo.libro.trim()) nuevos.libro = MENSAJES.libro;
      if (!detalleBautismo.folio.trim()) nuevos.folio = MENSAJES.folio;
      if (!detalleBautismo.asiento.trim()) nuevos.asiento = MENSAJES.asiento;
      if (
        detalleBautismo.fechaNacimiento &&
        fechaSacramento &&
        detalleBautismo.fechaNacimiento > fechaSacramento
      ) {
        nuevos.fechaNacimiento =
          'La fecha de nacimiento no puede ser posterior a la fecha de celebración.';
        nuevos.fechaSacramento =
          'La fecha de celebración no puede ser anterior a la fecha de nacimiento.';
      }
    }
    if (tipo === 'matrimonio') {
      personaOk(contrayente2, 'contrayente2');
      if (!detalleMatrimonio.libro.trim()) nuevos.libro = MENSAJES.libro;
      if (!detalleMatrimonio.folio.trim()) nuevos.folio = MENSAJES.folio;
    }
    // Comunión/confirmación no llevan datos de persona: usan la del bautismo.

    setErrors(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const personaInput = (p: PersonaForm) => ({
    cedula: p.cedula || undefined,
    nombre: p.nombre.trim(),
    primerApellido: p.primerApellido.trim(),
    segundoApellido: p.segundoApellido.trim() || undefined,
  });

  const construirDto = (): CrearSacramentoInput => {
    const base = {
      tipo,
      idParroquia: Number(idParroquia),
      idPresbitero: idPresbitero ? Number(idPresbitero) : undefined,
      fechaSacramento,
      // Las observaciones solo aplican al bautismo; los demás sacramentos van únicamente con lugar y fecha.
      ...(tipo === 'bautismo' ? { observaciones: observaciones.trim() || undefined } : {}),
    };
    if (tipo === 'bautismo') {
      return {
        ...base,
        bautismo: {
          bautizado: personaInput(bautizado),
          padre: padre.nombre.trim() ? personaInput(padre) : undefined,
          madre: madre.nombre.trim() ? personaInput(madre) : undefined,
          padrino: padrino.nombre.trim() ? personaInput(padrino) : undefined,
          madrina: madrina.nombre.trim() ? personaInput(madrina) : undefined,
          abuelos: abuelos.length
            ? (abuelos.map((ab) => ({ ...personaInput(ab), parentesco: ab.parentesco })) as AbueloInput[])
            : undefined,
          fechaNacimiento: detalleBautismo.fechaNacimiento || undefined,
          horaNacimiento: detalleBautismo.horaNacimiento || undefined,
          lugarNacimiento: detalleBautismo.lugarNacimiento.trim() || undefined,
          libro: detalleBautismo.libro.trim() || undefined,
          folio: detalleBautismo.folio.trim() || undefined,
          asiento: detalleBautismo.asiento.trim() || undefined,
        },
      };
    }
    // La persona del expediente se copió del bautismo; se usa como respaldo si por
    // algún flujo no quedó seteada (evita duplicar o cambiar la cédula del bautizado).
    const personaDelExpediente = persona.nombre.trim() ? persona : bautizado;
    if (tipo === 'comunion')
      return { ...base, comunion: { persona: personaInput(personaDelExpediente) } };
    if (tipo === 'confirmacion')
      return { ...base, confirmacion: { persona: personaInput(personaDelExpediente) } };
    return {
      ...base,
      matrimonio: {
        // El primer contrayente es la persona del expediente (bautismo); solo se pide el cónyuge.
        contrayente1: personaInput(
          contrayente1.nombre.trim() ? contrayente1 : personaDelExpediente,
        ),
        contrayente2: personaInput(contrayente2),
        libro: detalleMatrimonio.libro.trim() || undefined,
        folio: detalleMatrimonio.folio.trim() || undefined,
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!habilitado(tipo)) {
      showToast('Complete el sacramento anterior para poder registrar este.', 'error');
      return;
    }
    if (!validar()) return;
    setSaving(true);
    try {
      await onSave(construirDto());
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
          err?.response?.data?.mensaje ?? err?.message ?? 'No se pudo registrar el acta.';
        showToast(String(mensaje), 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const renderPersona = (
    titulo: string,
    persona: PersonaForm,
    setter: React.Dispatch<React.SetStateAction<PersonaForm>>,
    prefijo: string,
  ) => (
    <div className="mb-5">
      <Label>{titulo}</Label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Input
            type="text"
            placeholder="Cédula (0-0000-0000)"
            maxLength={12}
            className={inputClass(Boolean(errors[`${prefijo}Cedula`]))}
            value={persona.cedula}
            onChange={(e) => setPersonaCampo(setter, 'cedula', e.target.value)}
          />
        </div>
        <div>
          <Input
            type="text"
            placeholder="Nombre"
            maxLength={30}
            className={inputClass(Boolean(errors[`${prefijo}Nombre`]))}
            value={persona.nombre}
            onChange={(e) => setPersonaCampo(setter, 'nombre', e.target.value)}
          />
          <ErrorMsg errors={errors} clave={`${prefijo}Nombre`} />
        </div>
        <div>
          <Input
            type="text"
            placeholder="Primer apellido"
            maxLength={30}
            className={inputClass(Boolean(errors[`${prefijo}PrimerApellido`]))}
            value={persona.primerApellido}
            onChange={(e) => setPersonaCampo(setter, 'primerApellido', e.target.value)}
          />
          <ErrorMsg errors={errors} clave={`${prefijo}PrimerApellido`} />
        </div>
        <div>
          <Input
            type="text"
            placeholder="Segundo apellido"
            maxLength={30}
            className={inputClass(Boolean(errors[`${prefijo}SegundoApellido`]))}
            value={persona.segundoApellido}
            onChange={(e) => setPersonaCampo(setter, 'segundoApellido', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderBautismo = () => (
    <>
      {renderPersona('Datos del bautizado', bautizado, setBautizado, 'bautizado')}
      {renderPersona('Padre (opcional)', padre, setPadre, 'padre')}
      {renderPersona('Madre (opcional)', madre, setMadre, 'madre')}
      {renderPersona('Padrino (opcional)', padrino, setPadrino, 'padrino')}
      {renderPersona('Madrina (opcional)', madrina, setMadrina, 'madrina')}

      <div className="mb-5">
        <Label>Abuelos (opcional)</Label>
        <div className="space-y-3">
          {abuelos.map((ab, idx) => (
            <div key={idx} className="rounded-md border border-gray-200 p-3">
              <select
                value={ab.parentesco}
                onChange={(e) =>
                  setAbuelos((prev) =>
                    prev.map((a, i) => (i === idx ? { ...a, parentesco: e.target.value as ParentescoAbuelo } : a)),
                  )
                }
                className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {PARENTESCOS.map((p) => (
                  <option key={p} value={p} disabled={abuelos.some((a, i) => a.parentesco === p && i !== idx)}>
                    {p.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Input type="text" placeholder="Cédula" maxLength={12} value={ab.cedula} onChange={(e) => setAbueloCampo(idx, 'cedula', e.target.value)} />
                <Input type="text" placeholder="Nombre" maxLength={30} value={ab.nombre} onChange={(e) => setAbueloCampo(idx, 'nombre', e.target.value)} />
                <Input type="text" placeholder="Primer apellido" maxLength={30} value={ab.primerApellido} onChange={(e) => setAbueloCampo(idx, 'primerApellido', e.target.value)} />
                <Input type="text" placeholder="Segundo apellido" maxLength={30} value={ab.segundoApellido} onChange={(e) => setAbueloCampo(idx, 'segundoApellido', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" onClick={agregarAbuelo} className="mt-2">
          + Agregar abuelo
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label required>Fecha de nacimiento</Label>
          <Input type="date" className={inputClass(Boolean(errors.fechaNacimiento))} max={fechaSacramento || undefined} value={detalleBautismo.fechaNacimiento} onChange={(e) => setDetalleBautismo((p) => ({ ...p, fechaNacimiento: e.target.value }))} />
          <ErrorMsg errors={errors} clave="fechaNacimiento" />
        </div>
        <div>
          <Label required>Hora de nacimiento</Label>
          <Input type="time" className={inputClass(Boolean(errors.horaNacimiento))} value={detalleBautismo.horaNacimiento} onChange={(e) => setDetalleBautismo((p) => ({ ...p, horaNacimiento: e.target.value }))} />
          <ErrorMsg errors={errors} clave="horaNacimiento" />
        </div>
        <div>
          <Label required>Lugar de nacimiento</Label>
          <Input type="text" maxLength={60} className={inputClass(Boolean(errors.lugarNacimiento))} value={detalleBautismo.lugarNacimiento} onChange={(e) => setDetalleBautismo((p) => ({ ...p, lugarNacimiento: e.target.value }))} />
          <ErrorMsg errors={errors} clave="lugarNacimiento" />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label required>Libro</Label>
          <Input type="text" maxLength={6} className={inputClass(Boolean(errors.libro))} value={detalleBautismo.libro} onChange={(e) => setDetalleBautismoCampo('libro', e.target.value)} />
          <ErrorMsg errors={errors} clave="libro" />
        </div>
        <div>
          <Label required>Folio</Label>
          <Input type="text" maxLength={6} className={inputClass(Boolean(errors.folio))} value={detalleBautismo.folio} onChange={(e) => setDetalleBautismoCampo('folio', e.target.value)} />
          <ErrorMsg errors={errors} clave="folio" />
        </div>
        <div>
          <Label required>Asiento</Label>
          <Input type="text" maxLength={6} className={inputClass(Boolean(errors.asiento))} value={detalleBautismo.asiento} onChange={(e) => setDetalleBautismoCampo('asiento', e.target.value)} />
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
      {renderPersona('Cónyuge', contrayente2, setContrayente2, 'contrayente2')}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label required>Libro</Label>
          <Input type="text" maxLength={6} className={inputClass(Boolean(errors.libro))} value={detalleMatrimonio.libro} onChange={(e) => setDetalleMatrimonioCampo('libro', e.target.value)} />
          <ErrorMsg errors={errors} clave="libro" />
        </div>
        <div>
          <Label required>Folio</Label>
          <Input type="text" maxLength={6} className={inputClass(Boolean(errors.folio))} value={detalleMatrimonio.folio} onChange={(e) => setDetalleMatrimonioCampo('folio', e.target.value)} />
          <ErrorMsg errors={errors} clave="folio" />
        </div>
      </div>
    </>
  );

  const catalogoCargando = cargandoParroquias || cargandoPresbiteros;

  return (
    <div ref={modalRef} className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-[90%] max-w-[800px] flex-col overflow-hidden rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-surface-muted px-6 py-5">
          <h2 className="m-0 text-lg text-slate-800">INSCRIPCIÓN SACRAMENTAL</h2>
          <button
            type="button"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-3xl text-gray-500 hover:bg-gray-100"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="flex gap-2 border-b border-gray-200 px-6">
          {TIPOS.map((t) => {
            const disponible = habilitado(t);
            return (
              <button
                key={t}
                type="button"
                disabled={!disponible}
                title={disponible ? undefined : 'Complete el sacramento anterior para desbloquear este'}
                className={cn(
                  'px-5 py-3 text-sm font-medium transition-colors',
                  !disponible
                    ? 'cursor-not-allowed border-0 bg-transparent text-gray-300'
                    : 'cursor-pointer border-0 bg-transparent text-gray-500 hover:text-blue-600',
                  tipo === t && disponible && 'border-b-2 border-blue-600 text-blue-600',
                )}
                onClick={() => cambiarTab(t)}
              >
                {TIPO_SACRAMENTO_LABEL[t].toUpperCase()}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6">
            {catalogoCargando ? (
              <div className="flex items-center gap-2 py-6 text-sm text-text-secondary">
                <Loader2 size={18} className="animate-spin" /> Cargando catálogos...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <Label required>Filial</Label>
                    <select
                      value={idParroquia}
                      onChange={(e) => setIdParroquia(e.target.value)}
                      className={inputClass(Boolean(errors.idParroquia))}
                    >
                      <option value="">Seleccione...</option>
                      {opcionesLugarCelebracion(parroquias).map((lugar) => (
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

                {tipo === 'bautismo' && renderBautismo()}
                {tipo === 'matrimonio' && renderMatrimonio()}

                {tipo === 'bautismo' && (
                  <div>
                    <Label>Observaciones</Label>
                    <Input
                      type="text"
                      maxLength={500}
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                    />
                    <p className="m-0 mt-1 text-right text-xs text-slate-400">
                      {observaciones.length}/500 caracteres
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 bg-surface-muted px-6 py-4">
            <Button type="submit" variant="royal" disabled={saving || catalogoCargando}>
              {saving ? 'GUARDANDO...' : 'INSCRIBIR ACTA'}
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

export default AddSacramentoModal;