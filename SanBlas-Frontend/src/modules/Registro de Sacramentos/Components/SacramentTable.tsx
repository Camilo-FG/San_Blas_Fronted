import { Pencil, Trash2, MapPin, Calendar, FileText, Eye } from 'lucide-react';
import { AdminRecordCard } from '../../../shared/components/admin/AdminRecordCard';
import './styles/SacramentTable.css';

interface Sacrament {
  id: string;  
  nombre: string;
  fechaCelebracion: string;
  lugar: string;
  tipo: 'Bautismo' | 'Comunión' | 'Confirmación' | 'Matrimonio';
  detalles: any;
}

interface Props {
  sacramentos: Sacrament[];
  onViewDetails: (sacramento: Sacrament) => void;
  onEdit: (sacramento: Sacrament) => void;      
  onDelete: (sacramento: Sacrament) => void;    
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
  onEdit,           
  onDelete,         
  onSort,
  sortColumn,
  sortDirection
}: Props) => {
  const renderTipoBadge = (tipo: Sacrament['tipo']) => (
    <span
      className="sacrament-badge"
      style={{
        backgroundColor: colorPorTipo[tipo],
        color: textColorPorTipo[tipo],
      }}
    >
      {tipo}
    </span>
  );

  return (
    <div className="admin-responsive-data">
      <div className="admin-responsive-data__table sacrament-table-container">
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
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {sacramentos.map((sacramento) => (
              <tr key={sacramento.id}>
                <td>{renderTipoBadge(sacramento.tipo)}</td>
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
                       Editar
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => onDelete(sacramento)}
                    >
                       Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-responsive-data__cards">
        {sacramentos.map((sacramento) => (
          <AdminRecordCard
            key={sacramento.id}
            icon={<FileText size={20} />}
            accent={textColorPorTipo[sacramento.tipo]}
            code={sacramento.tipo}
            title={sacramento.nombre}
            subtitle={sacramento.lugar}
            badges={renderTipoBadge(sacramento.tipo)}
            meta={[
              {
                icon: <Calendar size={12} />,
                label: 'Celebración',
                value: sacramento.fechaCelebracion,
              },
              {
                icon: <MapPin size={12} />,
                label: 'Lugar',
                value: sacramento.lugar,
              },
            ]}
            actions={[
              {
                label: 'Acta',
                icon: <Eye size={15} />,
                variant: 'ghost',
                onClick: () => onViewDetails(sacramento),
              },
              {
                label: 'Editar',
                icon: <Pencil size={15} />,
                variant: 'primary',
                onClick: () => onEdit(sacramento),
              },
              {
                label: 'Eliminar',
                icon: <Trash2 size={15} />,
                variant: 'danger',
                onClick: () => onDelete(sacramento),
              },
            ]}
          />
        ))}
      </div>
    </div>
  );
};

export default SacramentTable;
