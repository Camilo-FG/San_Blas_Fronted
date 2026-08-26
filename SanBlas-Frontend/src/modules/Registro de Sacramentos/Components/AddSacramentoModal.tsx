import { useEffect, useMemo, useState } from 'react';
import { Button, cn, Input, Label, useToast } from '../../../shared/ui';
import { Loader2 } from 'lucide-react';
import { useListarParroquias } from '../hooks/hooksNuevos/useListarParroquias';
import { useListarPresbiteros } from '../hooks/hooksNuevos/useListarPresbiteros';
import {
  AbueloInput,
  CrearSacramentoInput,
  ParentescoAbuelo,
  TipoSacramento,
  TIPO_SACRAMENTO_LABEL,
} from '../../../types/sacramentosNuevos';

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
  const [errors, setErrors] = useState<Record<string, boolean>>({});

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
    tomo: '',
    folio: '',
    asiento: '',
  });
  const [detalleMatrimonio, setDetalleMatrimonio] = useState({
    libro: '',
    tomo: '',
    folio: '',
  });

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
      setDetalleBautismo({ fechaNacimiento: '', horaNacimiento: '', lugarNacimiento: '', libro: '', tomo: '', folio: '', asiento: '' });
      setDetalleMatrimonio({ libro: '', tomo: '', folio: '' });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const personaBloqueada = !tieneBautismo && tipo !== 'bautismo';

  const setPersonaCampo = (
    setter: React.Dispatch<React.SetStateAction<PersonaForm>>,
    campo: keyof PersonaForm,
    valor: string,
  ) => {
    setter((prev) => ({
      ...prev,
      [campo]: campo === 'cedula' ? formatearCedulaCR(valor) : valor,
    }));
  };

  const setAbueloCampo = (idx: number, campo: keyof PersonaForm, valor: string) => {
    setAbuelos((prev) =>
      prev.map((ab, i) =>
        i === idx ? { ...ab, [campo]: campo === 'cedula' ? formatearCedulaCR(valor) : valor } : ab,
      ),
    );
  };

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
    const nuevos: Record<string, boolean> = {};
    if (!idParroquia) nuevos.idParroquia = true;
    if (!fechaSacramento) nuevos.fechaSacramento = true;

    const personaOk = (p: PersonaForm, prefijo: string) => {
      if (!p.nombre.trim()) nuevos[`${prefijo}Nombre`] = true;
      if (!p.primerApellido.trim()) nuevos[`${prefijo}PrimerApellido`] = true;
    };

    if (tipo === 'bautismo') personaOk(bautizado, 'bautizado');
    if (tipo === 'comunion' || tipo === 'confirmacion') personaOk(persona, 'persona');
    if (tipo === 'matrimonio') {
      personaOk(contrayente1, 'contrayente1');
      personaOk(contrayente2, 'contrayente2');
    }

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
      observaciones: observaciones.trim() || undefined,
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
          tomo: detalleBautismo.tomo.trim() || undefined,
          folio: detalleBautismo.folio.trim() || undefined,
          asiento: detalleBautismo.asiento.trim() || undefined,
        },
      };
    }
    if (tipo === 'comunion') return { ...base, comunion: { persona: personaInput(persona) } };
    if (tipo === 'confirmacion') return { ...base, confirmacion: { persona: personaInput(persona) } };
    return {
      ...base,
      matrimonio: {
        contrayente1: personaInput(contrayente1),
        contrayente2: personaInput(contrayente2),
        libro: detalleMatrimonio.libro.trim() || undefined,
        tomo: detalleMatrimonio.tomo.trim() || undefined,
        folio: detalleMatrimonio.folio.trim() || undefined,
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (personaBloqueada) {
      showToast('Debe registrar primero el Bautismo antes de los demás sacramentos.', 'error');
      return;
    }
    if (!validar()) return;
    setSaving(true);
    try {
      await onSave(construirDto());
      onClose();
    } catch (err: any) {
      const mensaje =
        err?.response?.data?.mensaje ?? err?.message ?? 'No se pudo registrar el acta.';
      showToast(String(mensaje), 'error');
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
        <Input
          type="text"
          placeholder="Nombre"
          maxLength={100}
          className={inputClass(errors[`${prefijo}Nombre`])}
          value={persona.nombre}
          onChange={(e) => setPersonaCampo(setter, 'nombre', e.target.value)}
        />
        <Input
          type="text"
          placeholder="Primer apellido"
          maxLength={100}
          className={inputClass(errors[`${prefijo}PrimerApellido`])}
          value={persona.primerApellido}
          onChange={(e) => setPersonaCampo(setter, 'primerApellido', e.target.value)}
        />
        <Input
          type="text"
          placeholder="Segundo apellido"
          maxLength={100}
          value={persona.segundoApellido}
          onChange={(e) => setPersonaCampo(setter, 'segundoApellido', e.target.value)}
        />
        <Input
          type="text"
          placeholder="Cédula (0-0000-0000)"
          maxLength={12}
          value={persona.cedula}
          onChange={(e) => setPersonaCampo(setter, 'cedula', e.target.value)}
        />
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
                <Input type="text" placeholder="Nombre" value={ab.nombre} onChange={(e) => setAbueloCampo(idx, 'nombre', e.target.value)} />
                <Input type="text" placeholder="Primer apellido" value={ab.primerApellido} onChange={(e) => setAbueloCampo(idx, 'primerApellido', e.target.value)} />
                <Input type="text" placeholder="Segundo apellido" value={ab.segundoApellido} onChange={(e) => setAbueloCampo(idx, 'segundoApellido', e.target.value)} />
                <Input type="text" placeholder="Cédula" value={ab.cedula} onChange={(e) => setAbueloCampo(idx, 'cedula', e.target.value)} />
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
          <Label>Fecha de nacimiento</Label>
          <Input type="date" value={detalleBautismo.fechaNacimiento} onChange={(e) => setDetalleBautismo((p) => ({ ...p, fechaNacimiento: e.target.value }))} />
        </div>
        <div>
          <Label>Hora de nacimiento</Label>
          <Input type="time" value={detalleBautismo.horaNacimiento} onChange={(e) => setDetalleBautismo((p) => ({ ...p, horaNacimiento: e.target.value }))} />
        </div>
        <div>
          <Label>Lugar de nacimiento</Label>
          <Input type="text" value={detalleBautismo.lugarNacimiento} onChange={(e) => setDetalleBautismo((p) => ({ ...p, lugarNacimiento: e.target.value }))} />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label>Libro</Label>
          <Input type="text" value={detalleBautismo.libro} onChange={(e) => setDetalleBautismo((p) => ({ ...p, libro: e.target.value }))} />
        </div>
        <div>
          <Label>Tomo</Label>
          <Input type="text" value={detalleBautismo.tomo} onChange={(e) => setDetalleBautismo((p) => ({ ...p, tomo: e.target.value }))} />
        </div>
        <div>
          <Label>Folio</Label>
          <Input type="text" value={detalleBautismo.folio} onChange={(e) => setDetalleBautismo((p) => ({ ...p, folio: e.target.value }))} />
        </div>
        <div>
          <Label>Asiento</Label>
          <Input type="text" value={detalleBautismo.asiento} onChange={(e) => setDetalleBautismo((p) => ({ ...p, asiento: e.target.value }))} />
        </div>
      </div>
    </>
  );

  const renderPersonaDetalle = () => (
    <>{renderPersona(`Datos de la persona (${TIPO_SACRAMENTO_LABEL[tipo]})`, persona, setPersona, 'persona')}</>
  );

  const renderMatrimonio = () => (
    <>
      {renderPersona('Contrayente 1', contrayente1, setContrayente1, 'contrayente1')}
      {renderPersona('Contrayente 2', contrayente2, setContrayente2, 'contrayente2')}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label>Libro</Label>
          <Input type="text" value={detalleMatrimonio.libro} onChange={(e) => setDetalleMatrimonio((p) => ({ ...p, libro: e.target.value }))} />
        </div>
        <div>
          <Label>Tomo</Label>
          <Input type="text" value={detalleMatrimonio.tomo} onChange={(e) => setDetalleMatrimonio((p) => ({ ...p, tomo: e.target.value }))} />
        </div>
        <div>
          <Label>Folio</Label>
          <Input type="text" value={detalleMatrimonio.folio} onChange={(e) => setDetalleMatrimonio((p) => ({ ...p, folio: e.target.value }))} />
        </div>
      </div>
    </>
  );

  const catalogoCargando = cargandoParroquias || cargandoPresbiteros;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50" onClick={onClose}>
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
            const bloqueado = !tieneBautismo && t !== 'bautismo';
            return (
              <button
                key={t}
                type="button"
                disabled={bloqueado}
                title={bloqueado ? 'Registre primero el Bautismo' : undefined}
                className={cn(
                  'px-5 py-3 text-sm font-medium transition-colors',
                  bloqueado
                    ? 'cursor-not-allowed border-0 bg-transparent text-gray-300'
                    : 'cursor-pointer border-0 bg-transparent text-gray-500 hover:text-blue-600',
                  tipo === t && !bloqueado && 'border-b-2 border-blue-600 text-blue-600',
                )}
                onClick={() => setTipo(t)}
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
                    <Label>Parroquia *</Label>
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
                    <Label>Presbítero</Label>
                    <select
                      value={idPresbitero}
                      onChange={(e) => setIdPresbitero(e.target.value)}
                      className={inputClass()}
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
                    <Label>Fecha de celebración *</Label>
                    <Input
                      type="date"
                      className={inputClass(errors.fechaSacramento)}
                      value={fechaSacramento}
                      onChange={(e) => setFechaSacramento(e.target.value)}
                    />
                  </div>
                </div>

                {tipo === 'bautismo' && renderBautismo()}
                {(tipo === 'comunion' || tipo === 'confirmacion') && renderPersonaDetalle()}
                {tipo === 'matrimonio' && renderMatrimonio()}

                <div>
                  <Label>Observaciones</Label>
                  <Input
                    type="text"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 bg-surface-muted px-6 py-4">
            <Button type="submit" variant="primary" disabled={saving || catalogoCargando}>
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