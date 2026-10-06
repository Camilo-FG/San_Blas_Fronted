import { useEffect, useState } from 'react';
import { ChevronDown, Loader2, SlidersHorizontal } from 'lucide-react';
import { useBuscarSacramentosNuevos } from '../hooks/hooksNuevos/useBuscarSacramentosNuevos';
import { useCrearSacramentoNuevo } from '../hooks/hooksNuevos/useCrearSacramentoNuevo';
import { useActualizarSacramentoNuevo } from '../hooks/hooksNuevos/useActualizarSacramentoNuevo';
import { useEliminarSacramentoNuevo } from '../hooks/hooksNuevos/useEliminarSacramentoNuevo';
import SacramentTable from './SacramentTable';
import SacramentoEmptyState from './SacramentoEmptyState';
import DetailsDrawer from './DetailsDrawer';
import AddSacramentoModal from './AddSacramentoModal';
import EditSacramentoModal from './EditSacramentoModal';
import { AdminModule, AdminSearch, Button, useToast } from '../../../shared/ui';
import { ActualizarSacramentoInput, CrearSacramentoInput } from '../../../types/sacramentosNuevos';

const GestionSacramentos = () => {
  const { showToast } = useToast();

  const [nombreInput, setNombreInput] = useState('');
  const [cedulaInput, setCedulaInput] = useState('');
  const [filtros, setFiltros] = useState({ nombre: '', cedula: '' });
  const [mostrarFiltrosBusqueda, setMostrarFiltrosBusqueda] = useState(false);
  const [libroInput, setLibroInput] = useState('');
  const [folioInput, setFolioInput] = useState('');
  const [asientoInput, setAsientoInput] = useState('');
  const [filtrosActa, setFiltrosActa] = useState({ libro: '', folio: '', asiento: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [drawerCedula, setDrawerCedula] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editCedula, setEditCedula] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const query = useBuscarSacramentosNuevos({
    nombre: filtros.nombre || undefined,
    cedula: filtros.cedula || undefined,
    libro: filtrosActa.libro || undefined,
    folio: filtrosActa.folio || undefined,
    asiento: filtrosActa.asiento || undefined,
    page,
    pageSize,
  });

  // Consulta ligera para saber si existen bautismos y habilitar las otras pestañas.
  const bautismosQuery = useBuscarSacramentosNuevos({ tipo: 'bautismo', page: 1, pageSize: 1 });
  const tieneBautismo = (bautismosQuery.data?.total ?? 0) > 0;

  const createSacramento = useCrearSacramentoNuevo();
  const updateSacramento = useActualizarSacramentoNuevo();
  const deleteSacramento = useEliminarSacramentoNuevo();

  // Debounce de 400ms en la búsqueda por texto.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros({ nombre: nombreInput.trim(), cedula: cedulaInput.replace(/\D/g, '') });
      setFiltrosActa({
        libro: libroInput.trim(),
        folio: folioInput.trim(),
        asiento: asientoInput.trim(),
      });
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [nombreInput, cedulaInput, libroInput, folioInput, asientoInput]);

  const aplicarMascaraCedula = (valor: string) => {
    const digitos = valor.replace(/\D/g, '').slice(0, 9);
    if (digitos.length <= 1) return digitos;
    if (digitos.length <= 5) return `${digitos[0]}-${digitos.slice(1)}`;
    return `${digitos[0]}-${digitos.slice(1, 5)}-${digitos.slice(5)}`;
  };

  const handleSolonLetrasNombre = (valor: string) => {
    return valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  };

  const handleViewDetails = (sacramento: { cedula: string | null }) => {
    if (!sacramento.cedula) {
      showToast('Este registro no tiene cédula asociada.', 'error');
      return;
    }
    setDrawerCedula(sacramento.cedula);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setDrawerCedula(null);
  };

  const handleEdit = (sacramento: { id: number; cedula: string | null }) => {
    setEditId(sacramento.id);
    setEditCedula(sacramento.cedula);
    setEditModalOpen(true);
  };

  const handleSaveAdd = async (dto: CrearSacramentoInput) => {
    await createSacramento.mutateAsync(dto);
    showToast('Acta sacramental registrada correctamente', 'success');
  };

  const handleUpdateSacramento = async (id: number, dto: ActualizarSacramentoInput) => {
    await updateSacramento.mutateAsync({ id, dto });
    showToast('Acta sacramental actualizada correctamente', 'success');
  };

  const handleDelete = async (sacramento: { id: number; nombre: string }) => {
    if (confirm(`¿Estás seguro de eliminar ${sacramento.nombre}?`)) {
      try {
        await deleteSacramento.mutateAsync(sacramento.id);
        showToast('Registro eliminado correctamente', 'success');
      } catch (err: any) {
        showToast(err?.response?.data?.mensaje ?? 'No se pudo eliminar el registro.', 'error');
      }
    }
  };

  const hayBusquedaActiva =
    filtros.nombre !== '' ||
    filtros.cedula !== '' ||
    filtrosActa.libro !== '' ||
    filtrosActa.folio !== '' ||
    filtrosActa.asiento !== '';

  const limpiarFiltrosActa = () => {
    setLibroInput('');
    setFolioInput('');
    setAsientoInput('');
  };
  const mostrarEstadoVacio =
    !query.isPending && !query.error && (query.data?.items.length ?? 0) === 0 && hayBusquedaActiva;

  return (
    <AdminModule className="w-full gap-3!">
      <div>
        <h2 className="m-0 font-heading text-lg font-extrabold text-royal-blue dark:text-white">
          CONSULTA DE REGISTROS SACRAMENTALES
        </h2>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border-strong bg-surface p-3 shadow-sm dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-none">
        <AdminSearch
          type="text"
          placeholder="Cédula (0-0000-0000)"
          value={cedulaInput}
          onChange={(e) => setCedulaInput(aplicarMascaraCedula(e.target.value))}
          className="min-w-[200px] flex-1"
        />
        <AdminSearch
          type="text"
          placeholder="Nombre o apellidos"
          maxLength={30}
          value={nombreInput}
          onChange={(e) => setNombreInput(handleSolonLetrasNombre(e.target.value))}
          className="min-w-[200px] flex-1"
        />
        <Button
          type="button"
          onClick={() => setMostrarFiltrosBusqueda((prev) => !prev)}
          variant="secondary"
          aria-expanded={mostrarFiltrosBusqueda}
          className="shrink-0 dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0f1d33] dark:text-[#f3f6fa] dark:hover:bg-white/[0.035] dark:[&_svg]:text-[#d9a928]"
        >
          <SlidersHorizontal size={15} strokeWidth={1.8} />
          Filtros de búsqueda
          <ChevronDown
            size={16}
            strokeWidth={2.5}
            className={`transition-transform duration-200 ${mostrarFiltrosBusqueda ? "rotate-180" : ""}`}
          />
        </Button>
        <Button
          type="button"
          onClick={() => setAddModalOpen(true)}
          variant="royal"
          className="shrink-0"
        >
          + Agregar
        </Button>
      </div>

      {mostrarFiltrosBusqueda && (
        <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border-strong bg-surface p-3 shadow-sm dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425] dark:shadow-none">
          <AdminSearch
            type="text"
            placeholder="Libro"
            value={libroInput}
            onChange={(e) => setLibroInput(e.target.value.slice(0, 100))}
            className="min-w-[140px] flex-1"
            aria-label="Filtrar por libro del acta de bautismo"
          />
          <AdminSearch
            type="text"
            placeholder="Folio"
            value={folioInput}
            onChange={(e) => setFolioInput(e.target.value.slice(0, 100))}
            className="min-w-[140px] flex-1"
            aria-label="Filtrar por folio del acta de bautismo"
          />
          <AdminSearch
            type="text"
            placeholder="Asiento"
            value={asientoInput}
            onChange={(e) => setAsientoInput(e.target.value.slice(0, 100))}
            className="min-w-[140px] flex-1"
            aria-label="Filtrar por asiento del acta de bautismo"
          />
          <Button
            type="button"
            onClick={limpiarFiltrosActa}
            variant="secondary"
            className="shrink-0 dark:border-[rgba(220,230,242,0.12)] dark:bg-transparent dark:text-[#f3f6fa] dark:hover:bg-white/[0.035]"
          >
            Limpiar
          </Button>
        </div>
      )}

      {query.isPending && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Loader2 size={32} className="animate-spin text-text-muted dark:text-[#7f8da3]" />
          <p className="m-0 text-sm text-text-secondary dark:text-[#b7c3d4]">Buscando registros...</p>
        </div>
      )}

      {query.error && !query.isPending && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-danger-bg bg-danger-bg/40 px-6 py-16 text-center dark:border-[#ff6b6b]/50 dark:bg-[#e03131]">
          <p className="m-0 text-sm font-medium text-danger dark:text-white">
            Ocurrió un error al realizar la búsqueda
          </p>
        </div>
      )}

      {mostrarEstadoVacio && (
        <div className="rounded-xl border border-border-strong bg-surface dark:border-[rgba(220,230,242,0.12)] dark:bg-[#0a1425]">
          <SacramentoEmptyState />
        </div>
      )}

      {!query.isPending && !query.error && !mostrarEstadoVacio && (
        <SacramentTable
          sacramentos={query.data?.items ?? []}
          total={query.data?.total ?? 0}
          page={query.data?.page ?? 1}
          totalPages={query.data?.totalPages ?? 1}
          pageSize={query.data?.pageSize ?? pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchNombre={filtros.nombre}
        />
      )}

      <DetailsDrawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        cedula={drawerCedula}
      />

      <AddSacramentoModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveAdd}
        tieneBautismo={tieneBautismo}
      />

      <EditSacramentoModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        sacramentoId={editId}
        cedula={editCedula}
        onUpdate={handleUpdateSacramento}
        onCreate={handleSaveAdd}
      />
    </AdminModule>
  );
};

export default GestionSacramentos;