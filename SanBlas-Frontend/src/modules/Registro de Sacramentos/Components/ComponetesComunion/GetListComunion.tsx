import { useGetListComunion } from '../../hooks/hooksComunion/useGetListComunion';
import '../styles/GetListComunion.css';

const GetListComunion = () => {
  const { data, isPending, error } = useGetListComunion();

  if (isPending) return <p>Cargando comuniones...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data || data.length === 0) return <p>No hay comuniones registradas</p>;

  return (
    <div className="comunion-table-container">
      <h2>Lista de Comuniones</h2>
      <table className="comunion-table">
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
          {data.map((comunion) => (
            <tr key={comunion.id}>
              <td>{comunion.id}</td>
              <td>{comunion.Nombre}</td>
              <td>{comunion.DiaComunion}</td>
              <td>{comunion.MesComunion}</td>
              <td>{comunion.AnnioComunion}</td>
              <td>{comunion.LugarComunion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GetListComunion;