import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { AdminRecordCard } from '../../../shared/components/admin/AdminRecordCard';
import { AdminRecordDetailSheet } from '../../../shared/components/admin/AdminRecordDetailSheet';
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
  const [seleccionado, setSeleccionado] = useState<Sacrament | null>(null);

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
    <>
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
              title={sacramento.nombre}
              subtitle={`${sacramento.fechaCelebracion} · ${sacramento.lugar}`}
              badges={renderTipoBadge(sacramento.tipo)}
              onViewDetail={() => setSeleccionado(sacramento)}
              viewLabel="Ver detalle"
            />
          ))}
        </div>
      </div>

      <AdminRecordDetailSheet
        open={seleccionado !== null}
        title={seleccionado?.nombre ?? 'Registro'}
        subtitle={seleccionado?.fechaCelebracion}
        badges={seleccionado ? renderTipoBadge(seleccionado.tipo) : undefined}
        onClose={() => setSeleccionado(null)}
        primaryAction={
          seleccionado
            ? {
                label: 'Editar',
                icon: <Pencil size={16} />,
                onClick: () => {
                  onEdit(seleccionado);
                  setSeleccionado(null);
                },
              }
            : undefined
        }
        actions={
          seleccionado ? (
            <>
              <button
                type="button"
                className="admin-detail-action admin-detail-action--primary"
                onClick={() => {
                  onViewDetails(seleccionado);
                  setSeleccionado(null);
                }}
              >
                Ver acta
              </button>
              <button
                type="button"
                className="admin-detail-action admin-detail-action--danger"
                onClick={() => {
                  onDelete(seleccionado);
                  setSeleccionado(null);
                }}
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </>
          ) : undefined
        }
      >
        {seleccionado && (
          <div className="admin-detail-fields">
            <p className="admin-detail-field"><strong>Lugar:</strong> {seleccionado.lugar}</p>
            <p className="admin-detail-field"><strong>Tipo:</strong> {seleccionado.tipo}</p>
          </div>
        )}
      </AdminRecordDetailSheet>
    </>
  );
};

export default SacramentTable;
