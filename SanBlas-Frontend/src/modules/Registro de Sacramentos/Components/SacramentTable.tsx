// src/modules/dashboard/components/SacramentTable.tsx
import './styles/SacramentTable.css';

interface Sacrament {
  id: string;  // ← Cambiado a string por el prefijo (bautismo-1, etc)
  nombre: string;
  fechaCelebracion: string;
  lugar: string;
  tipo: 'Bautismo' | 'Comunión' | 'Confirmación' | 'Matrimonio';
  detalles: any;
}

interface Props {
  sacramentos: Sacrament[];
  onViewDetails: (sacramento: Sacrament) => void;
  onEdit: (sacramento: Sacrament) => void;      // ← Agregar
  onDelete: (sacramento: Sacrament) => void;    // ← Agregar
  onSort?: (columna: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

const colorPorTipo = {
  'Bautismo': '#E8F5E9',
  'Comunión': '#E3F2FD',
  'Confirmación': '#FFF3E0',
  'Matrimonio': '#F3E5F5'
};

const textColorPorTipo = {
  'Bautismo': '#2E7D32',
  'Comunión': '#1565C0',
  'Confirmación': '#E65100',
  'Matrimonio': '#6A1B9A'
};

const SacramentTable = ({ 
  sacramentos, 
  onViewDetails,
  onEdit,           // ← Recibir
  onDelete,         // ← Recibir
  onSort,
  sortColumn,
  sortDirection
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
            <th>ACCIONES</th>  {/* ← Nueva columna */}
          </tr>
        </thead>
        <tbody>
          {sacramentos.map((sacramento) => (
            <tr key={sacramento.id}>
              <td>
                <span 
                  className="sacrament-badge"
                  style={{ 
                    backgroundColor: colorPorTipo[sacramento.tipo],
                    color: textColorPorTipo[sacramento.tipo]
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
              <td>
                <div className="action-buttons">
                  <button 
                    className="edit-btn"
                    onClick={() => onEdit(sacramento)}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => onDelete(sacramento)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SacramentTable;