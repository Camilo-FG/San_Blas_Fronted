import { useGetListConfirma } from '../../hooks/hooksConfirma/useGetListConfirma';
import '../styles/GetListConfirmacion.css';

const GetListConfirmacion = () => {
  const { data, isPending, error } = useGetListConfirma();

  if (isPending) return <p>Cargando confirmaciones...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data || data.length === 0) return <p>No hay confirmaciones registradas</p>;

  return (
    <div className="confirmacion-table-container">
      <h2>Lista de Confirmaciones</h2>
      <table className="confirmacion-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Día</th>
            <th>Mes</th>
            <th>Año</th>
            <th>Lugar</th>
          </tr>
        </thead>
        <tbody>
          {data.map((confirmacion) => (
            <tr key={confirmacion.id}>
              <td>{confirmacion.id}</td>
              <td>{confirmacion.Nombre}</td>
              <td>{confirmacion.DiaConfirmacion}</td>
              <td>{confirmacion.MesConfirmacion}</td>
              <td>{confirmacion.AnnioConfirmacion}</td>
              <td>{confirmacion.LugarConfirmacion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GetListConfirmacion;