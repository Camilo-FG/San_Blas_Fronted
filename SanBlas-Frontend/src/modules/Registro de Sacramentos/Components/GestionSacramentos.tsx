// src/modules/dashboard/components/GestionSacramentos.tsx
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetListBautismo } from '../hooks/hooksBautismo/useGetListBautismo';
import { useGetListComunion } from '../hooks/hooksComunion/useGetListComunion';
import { useGetListConfirma } from '../hooks/hooksConfirma/useGetListConfirma';
import { useGetListMatrimonio } from '../hooks/hooksMatrimonio/useGetListMatrimonio';
import SacramentTable from './SacramentTable';
import DetailsDrawer from './DetailsDrawer';
import AddSacramentoModal from './AddSacramentoModal';
import { useCreateBautismo } from '../hooks/hooksBautismo/useCreateBautismo';
import './styles/GestionSacramentos.css';

const GestionSacramentos = () => {
  const { data: bautismos, isPending: pendingBautismo, error: errorBautismo } = useGetListBautismo();
  const { data: comuniones, isPending: pendingComunion, error: errorComunion } = useGetListComunion();
  const { data: confirmaciones, isPending: pendingConfirmacion, error: errorConfirmacion } = useGetListConfirma();
  const { data: matrimonios, isPending: pendingMatrimonio, error: errorMatrimonio } = useGetListMatrimonio();
  
  const queryClient = useQueryClient();
  const [searchNombre, setSearchNombre] = useState('');
  const [searchCedula, setSearchCedula] = useState('');
  const [searchFecha, setSearchFecha] = useState('');
  const [selectedSacramento, setSelectedSacramento] = useState<any>(null);
  const [selectedTipo, setSelectedTipo] = useState<string>('Bautismo');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createBautismo = useCreateBautismo();

  const isPending = pendingBautismo || pendingComunion || pendingConfirmacion || pendingMatrimonio;
  const error = errorBautismo || errorComunion || errorConfirmacion || errorMatrimonio;

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
      queryClient.invalidateQueries({ queryKey: ['bautismo'] });
    }
  };

  // Unificar todos los sacramentos en un solo array
  const todosLosSacramentos = [
    ...(bautismos?.map(b => ({
      id:`bautismo-${b.id}`,
      nombre: `${b.Nombre} ${b.PrimerApellido} ${b.SegundoApellido}`,
      cedula: b.cedula,
      fechaCelebracion: b.FechaBautismo,
      lugar: b.NombreParroquia,
      tipo: 'Bautismo' as const,
      detalles: b
    })) || []),
    ...(comuniones?.map(c => ({
      id: `comunion-${c.id}`,
      nombre: c.Nombre,
      cedula: '',
      fechaCelebracion: `${c.DiaComunion} ${c.MesComunion} ${c.AnnioComunion}`,
      lugar: c.LugarComunion,
      tipo: 'Comunión' as const,
      detalles: c
    })) || []),
    ...(confirmaciones?.map(conf => ({
      id: `confirmacion-${conf.id}`,
      nombre: conf.Nombre,
      cedula: '',
      fechaCelebracion: `${conf.DiaConfirmacion} ${conf.MesConfirmacion} ${conf.AnnioConfirmacion}`,
      lugar: conf.LugarConfirmacion,
      tipo: 'Confirmación' as const,
      detalles: conf
    })) || []),
    ...(matrimonios?.map(m => ({
      id:`matrimonio-${m.id}`,
      nombre: `${m.NombreContrayente} y ${m.NombreContrayente2}`,
      cedula: '',
      fechaCelebracion: `${m.DiaMatrimonio} ${m.MesMatrimonio} ${m.AnnioMatrimonio}`,
      lugar: m.LugarMatrimonio,
      tipo: 'Matrimonio' as const,
      detalles: m
    })) || []),
  ];

  // Filtrar datos
  const sacramentosFiltrados = todosLosSacramentos.filter(s => {
    const matchNombre = searchNombre === '' || s.nombre.toLowerCase().includes(searchNombre.toLowerCase());
    const matchCedula = searchCedula === '' || s.cedula.toString().includes(searchCedula);
    const matchFecha = searchFecha === '' || s.fechaCelebracion.includes(searchFecha);
    return matchNombre && matchCedula && matchFecha;
  });

  // Ordenar datos
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

  return (
    <div className="gestion-sacramentos">
      <div className="add-button-container">
        <button className="add-sacrament-btn" onClick={() => setIsModalOpen(true)}>
          + Agregar Sacramento
        </button>
      </div>

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
      
      {!isPending && !error && (
        <SacramentTable 
          sacramentos={sacramentosOrdenados}
          onViewDetails={handleViewDetails}
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
    </div>
  );
};

export default GestionSacramentos;