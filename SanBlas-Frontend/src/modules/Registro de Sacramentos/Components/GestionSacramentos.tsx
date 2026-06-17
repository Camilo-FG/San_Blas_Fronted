import { useState } from 'react';
import { useGetListBautismo } from '../hooks/hooksBautismo/useGetListBautismo';
 import { useGetListComunion } from '../hooks/hooksComunion/useGetListComunion';
 import { useGetListConfirma } from '../hooks/hooksConfirma/useGetListConfirma';
 import { useGetListMatrimonio } from '../hooks/hooksMatrimonio/useGetListMatrimonio';
import SacramentTable from './SacramentTable';
import DetailsDrawer from './DetailsDrawer';
import AddSacramentoModal from './AddSacramentoModal';
import EditSacramentoModal from './EditSacramentoModal';
import { useCreateBautismo } from '../hooks/hooksBautismo/useCreateBautismo';
 import { useCreateComunion } from '../hooks/hooksComunion/useCreateComunion';
 import { useCreateConfirma } from '../hooks/hooksConfirma/useCreateConfirma';
 import { useCreateMatrimonio } from '../hooks/hooksMatrimonio/useCreateMatrimonio';
import { usePutBautismo } from '../hooks/hooksBautismo/usePutBautismo';
 import { usePutComunion } from '../hooks/hooksComunion/usePutComunion';
 import { usePutConfirma } from '../hooks/hooksConfirma/usePutConfirma';
 import { usePutMatrimonio } from '../hooks/hooksMatrimonio/usePutMatrimonio';
import { useDeleteBautismo } from '../hooks/hooksBautismo/useDeleteBautismo';
 import { useDeleteComunion } from '../hooks/hooksComunion/useDeleteComunion';
 import { useDeleteConfirma } from '../hooks/hooksConfirma/useDeleteConfirma';
 import { useDeleteMatrimonio } from '../hooks/hooksMatrimonio/useDeleteMatrimonio';
import './styles/GestionSacramentos.css';

const GestionSacramentos = () => {
  // ========== HOOKS DE LECTURA ==========
  const { data: bautismos, isPending: pendingBautismo, error: errorBautismo, refetch: refetchBautismos } = useGetListBautismo();
   const { data: comuniones, isPending: pendingComunion, error: errorComunion, refetch: refetchComuniones } = useGetListComunion();
   const { data: confirmaciones, isPending: pendingConfirmacion, error: errorConfirmacion, refetch: refetchConfirmaciones } = useGetListConfirma();
   const { data: matrimonios, isPending: pendingMatrimonio, error: errorMatrimonio, refetch: refetchMatrimonios } = useGetListMatrimonio();

  // ========== HOOKS DE MUTACIÓN ==========
  const createBautismo = useCreateBautismo();
   const createComunion = useCreateComunion();
   const createConfirmacion = useCreateConfirma();
   const createMatrimonio = useCreateMatrimonio();

  const updateBautismo = usePutBautismo();
   const updateComunion = usePutComunion();
   const updateConfirmacion = usePutConfirma();
   const updateMatrimonio = usePutMatrimonio();

  const deleteBautismo = useDeleteBautismo();
   const deleteComunion = useDeleteComunion();
   const deleteConfirmacion = useDeleteConfirma();
   const deleteMatrimonio = useDeleteMatrimonio();

  // ========== ESTADOS ==========
  const [searchNombre, setSearchNombre] = useState('');
  const [searchCedula, setSearchCedula] = useState('');
  const [searchFecha, setSearchFecha] = useState('');
  const [selectedSacramento, setSelectedSacramento] = useState<any>(null);
  const [selectedTipo, setSelectedTipo] = useState<string>('Bautismo');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSacramento, setEditingSacramento] = useState<any>(null);
  const [editingTipo, setEditingTipo] = useState<string>('Bautismo');

  // ========== ESTADOS DE CARGA Y ERROR ==========
  const isPending = pendingBautismo || pendingComunion || pendingConfirmacion || pendingMatrimonio;
  const error = errorBautismo || errorComunion || errorConfirmacion || errorMatrimonio;

  // ========== HANDLERS ==========
  const handleSaveSacramento = async (data: any, tipo: string) => {
    if (tipo === 'Bautismo') {
      const nuevoId = Date.now();
      await createBautismo.mutateAsync({
        id: nuevoId,
        ...data,
        SegundoApellido: data.SegundoApellido || '',
        Prebispero: data.Prebispero || '',
        horaNacimiento: data.horaNacimiento || '',
        NombreAbuelosPaternos: data.NombreAbuelosPaternos || '',
        NombreAbuelosMaternos: data.NombreAbuelosMaternos || '',
      });
      await refetchBautismos();
    }
    
    
    else if (tipo === 'Comunión') {
      const nuevoId = Date.now();
      await createComunion.mutateAsync({ id: nuevoId, ...data });
      await refetchComuniones();
    }
    else if (tipo === 'Confirmación') {
      const nuevoId = Date.now();
      await createConfirmacion.mutateAsync({ id: nuevoId, ...data });
      await refetchConfirmaciones();
    }
    else if (tipo === 'Matrimonio') {
      const nuevoId = Date.now();
      await createMatrimonio.mutateAsync({ id: nuevoId, ...data });
      await refetchMatrimonios();
    }
    
  };

  const handleEdit = (sacramento: any) => {
    setEditingSacramento(sacramento.detalles);
    setEditingTipo(sacramento.tipo);
    setEditModalOpen(true);
  };

  const handleEditSave = async (data: any, tipo: string) => {
    if (tipo === 'Bautismo') {
      await updateBautismo.mutateAsync(data);
      await refetchBautismos();
    }
    
    else if (tipo === 'Comunión') {
      await updateComunion.mutateAsync(data);
      await refetchComuniones();
    }
    else if (tipo === 'Confirmación') {
      await updateConfirmacion.mutateAsync(data);
      await refetchConfirmaciones();
    }
    else if (tipo === 'Matrimonio') {
      await updateMatrimonio.mutateAsync(data);
      await refetchMatrimonios();
    }
    
  };

  const handleDelete = async (sacramento: any) => {
    if (confirm(`¿Estás seguro de eliminar ${sacramento.nombre}?`)) {
      const id = sacramento.detalles.id;
      
      switch (sacramento.tipo) {
        case 'Bautismo':
          await deleteBautismo.mutateAsync(id);
          await refetchBautismos();
          break;
        
        
        case 'Comunión':
          await deleteComunion.mutateAsync(id);
          await refetchComuniones();
          break;
        case 'Confirmación':
          await deleteConfirmacion.mutateAsync(id);
          await refetchConfirmaciones();
          break;
        case 'Matrimonio':
          await deleteMatrimonio.mutateAsync(id);
          await refetchMatrimonios();
          break;
        
      }
    }
  };

  // ========== UNIFICAR SACRAMENTOS ==========
  const bautismosArray = Array.isArray(bautismos) ? bautismos : [];
   const comunionesArray = Array.isArray(comuniones) ? comuniones : [];
   const confirmacionesArray = Array.isArray(confirmaciones) ? confirmaciones : [];
   const matrimoniosArray = Array.isArray(matrimonios) ? matrimonios : [];

  const todosLosSacramentos = [
    // BAUTISMOS
    ...(bautismosArray.map(b => ({
      id: `bautismo-${b.id}`,
      nombre: `${b.Nombre} ${b.PrimerApellido} ${b.SegundoApellido}`,
      cedula: b.cedula,
      fechaCelebracion: b.FechaBautismo,
      lugar: b.NombreParroquia,
      tipo: 'Bautismo' as const,
      detalles: b
    }))),
    
    
    // COMUNIONES
    ...(comunionesArray.map(c => ({
      id: `comunion-${c.id}`,
      nombre: c.Nombre,
      cedula: '',
      fechaCelebracion: `${c.DiaComunion} ${c.MesComunion} ${c.AnnioComunion}`,
      lugar: c.LugarComunion,
      tipo: 'Comunión' as const,
      detalles: c
    }))),
    
    // CONFIRMACIONES
    ...(confirmacionesArray.map(conf => ({
      id: `confirmacion-${conf.id}`,
      nombre: conf.Nombre,
      cedula: '',
      fechaCelebracion: `${conf.DiaConfirmacion} ${conf.MesConfirmacion} ${conf.AnnioConfirmacion}`,
      lugar: conf.LugarConfirmacion,
      tipo: 'Confirmación' as const,
      detalles: conf
    }))),
    
    // MATRIMONIOS
    ...(matrimoniosArray.map(m => ({
      id: `matrimonio-${m.id}`,
      nombre: `${m.NombreContrayente} y ${m.NombreContrayente2}`,
      cedula: '',
      fechaCelebracion: `${m.DiaMatrimonio} ${m.MesMatrimonio} ${m.AnnioMatrimonio}`,
      lugar: m.LugarMatrimonio,
      tipo: 'Matrimonio' as const,
      detalles: m
    }))),
    
  ];

  // ========== FILTRAR DATOS ==========
  const sacramentosFiltrados = todosLosSacramentos.filter(s => {
    const matchNombre = searchNombre === '' || s.nombre.toLowerCase().includes(searchNombre.toLowerCase());
    const matchCedula = searchCedula === '' || s.cedula.toString().includes(searchCedula);
    const matchFecha = searchFecha === '' || s.fechaCelebracion.includes(searchFecha);
    return matchNombre && matchCedula && matchFecha;
  });

  // ========== ORDENAR DATOS ==========
  const ordenarDatos = (datos: any[], columna: string, direccion: 'asc' | 'desc') => {
    return [...datos].sort((a, b) => {
      let valA = a[columna];
      let valB = b[columna];
      
      if (columna === 'fechaCelebracion') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      
      if (valA < valB) return direccion === 'asc' ? -1 : 1;
      if (valA > valB) return direccion === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sacramentosOrdenados = ordenarDatos(sacramentosFiltrados, sortColumn, sortDirection);

  const handleSort = (columna: string) => {
    if (sortColumn === columna) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columna);
      setSortDirection('asc');
    }
  };

  const handleViewDetails = (sacramento: any) => {
    setSelectedSacramento(sacramento.detalles);
    setSelectedTipo(sacramento.tipo);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedSacramento(null);
    setSelectedTipo('Bautismo');
  };

  // ========== RENDER ==========
  return (
    <div className="gestion-sacramentos">
      {/* Botón Agregar */}
      <div className="add-button-container">
        <button className="add-sacrament-btn" onClick={() => setIsModalOpen(true)}>
          + Agregar Sacramento
        </button>
      </div>

      {/* Filtros */}
      <div className="search-filters">
        <input
          type="text"
          placeholder="Nombre del registrado"
          value={searchNombre}
          onChange={(e) => setSearchNombre(e.target.value)}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Cédula"
          value={searchCedula}
          onChange={(e) => setSearchCedula(e.target.value)}
          className="search-input"
        />
        <input
          type="date"
          placeholder="Fecha de celebración"
          value={searchFecha}
          onChange={(e) => setSearchFecha(e.target.value)}
          className="search-input"
        />
      </div>

      
      {isPending && <p>Cargando sacramentos...</p>}
      {error && <p>Error: {error.message}</p>}
      
      {/* Tabla */}
      {!isPending && !error && (
        <SacramentTable 
          sacramentos={sacramentosOrdenados}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
        />
      )}

     
      <DetailsDrawer 
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        sacramento={selectedSacramento}
        tipo={selectedTipo}
      />

      
      <AddSacramentoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSacramento}
      />

      
      <EditSacramentoModal 
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
        sacramento={editingSacramento}
        tipo={editingTipo}
      />
    </div>
  );
};

export default GestionSacramentos;