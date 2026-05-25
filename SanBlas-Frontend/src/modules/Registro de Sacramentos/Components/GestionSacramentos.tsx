// src/modules/dashboard/components/GestionSacramentos.tsx
import { useState } from 'react';
import { useGetListBautismo } from '../hooks/hooksBautismo/useGetListBautismo';
import SacramentTable from './SacramentTable';
import DetailsDrawer from './DetailsDrawer';
import './styles/GestionSacramentos.css';

const GestionSacramentos = () => {
  const { data: bautismos, isPending, error } = useGetListBautismo();
  const [searchNombre, setSearchNombre] = useState('');
  const [searchCedula, setSearchCedula] = useState('');
  const [searchFecha, setSearchFecha] = useState('');
  const [selectedSacramento, setSelectedSacramento] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  if (isPending) return <p>Cargando sacramentos...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Filtrar datos
  const sacramentosFiltrados = bautismos
    ?.filter(b => {
      const nombreCompleto = `${b.Nombre} ${b.PrimerApellido} ${b.SegundoApellido}`.toLowerCase();
      const matchNombre = searchNombre === '' || nombreCompleto.includes(searchNombre.toLowerCase());
      const matchCedula = searchCedula === '' || b.cedula.toString().includes(searchCedula);
      const matchFecha = searchFecha === '' || b.FechaBautismo.includes(searchFecha);
      return matchNombre && matchCedula && matchFecha;
    })
    .map(b => ({
      id: b.id,
      nombre: `${b.Nombre} ${b.PrimerApellido} ${b.SegundoApellido}`,
      fechaCelebracion: b.FechaBautismo,
      lugar: b.NombreParroquia,
      tipo: 'Bautismo' as const,
      detalles: b
    })) || [];

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
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedSacramento(null);
  };

  return (
    <div className="gestion-sacramentos">
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

      {/* Botón Agregar */}
      <div className="add-button-container">
        <button className="add-sacrament-btn">+ Agregar Sacramento</button>
      </div>

      {/* Tabla */}
      <SacramentTable 
        sacramentos={sacramentosOrdenados}
        onViewDetails={handleViewDetails}
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />

      {/* Drawer lateral */}
      <DetailsDrawer 
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        sacramento={selectedSacramento}
        tipo="Bautismo"
      />
    </div>
  );
};

export default GestionSacramentos;