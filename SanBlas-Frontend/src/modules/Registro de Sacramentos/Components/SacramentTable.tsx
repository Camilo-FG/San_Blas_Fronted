// src/modules/dashboard/components/SacramentTable.tsx
import './styles/SacramentTable.css';

interface Sacrament {
  id: number;
  nombre: string;
  fechaCelebracion: string;
  lugar: string;
  tipo: 'Bautismo' | 'Comunión' | 'Confirmación' | 'Matrimonio';
  detalles: any;
}

interface Props {
  sacramentos: Sacrament[];
  onViewDetails: (sacramento: Sacrament) => void;
  onSort?: (columna: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

const colorPorTipo = {
   'Bautismo': '#4CAF5020',      // Verde transparente
  'Comunión': '#2196F320',      // Azul transparente
  'Confirmación': '#FF980020',  // Naranja transparente
  'Matrimonio': '#9C27B020'     // Morado transparente
};

const SacramentTable = ({ 
  sacramentos, 
  onViewDetails,
  onSort,           // ← Esto estaba faltando
  sortColumn,       // ← Esto estaba faltando
  sortDirection     // ← Esto estaba faltando
}: Props) => {
  return (
    <div className="sacrament-table-container">
      <table className="sacrament-table">
        <thead>
          <tr>
            <th onClick={() => onSort?.('tipo')} style={{ cursor: onSort ? 'pointer' : 'default' }}>
              SACRAMENTO
              {sortColumn === 'tipo' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </th>
            <th onClick={() => onSort?.('nombre')} style={{ cursor: onSort ? 'pointer' : 'default' }}>
              REGISTRADO / CONTRAYENTE
              {sortColumn === 'nombre' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </th>
            <th onClick={() => onSort?.('fechaCelebracion')} style={{ cursor: onSort ? 'pointer' : 'default' }}>
              FECHA DE CELEBRACIÓN
              {sortColumn === 'fechaCelebracion' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </th>
            <th onClick={() => onSort?.('lugar')} style={{ cursor: onSort ? 'pointer' : 'default' }}>
              LUGAR / PARROQUIA
              {sortColumn === 'lugar' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </th>
            <th>DETALLES</th>
          </tr>
        </thead>
        <tbody>
          {sacramentos.map((sacramento) => (
            <tr key={sacramento.id}>
              <td>
                <span 
                  className="sacrament-badge"
                  style={{ backgroundColor: colorPorTipo[sacramento.tipo],
                     color: colorPorTipo[sacramento.tipo].replace('20', '')
                   }}
                  
                >
                  {sacramento.tipo}
                </span>
              </td>
              <td>{sacramento.nombre}</td>
              <td>{sacramento.fechaCelebracion}</td>
              <td>{sacramento.lugar}</td>
              <td>
                <button 
                  className="view-details-btn"
                  onClick={() => onViewDetails(sacramento)}
                >
                  VER ACTA &gt;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SacramentTable;