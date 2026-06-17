import { useGetListMatrimonio } from '../../hooks/hooksMatrimonio/useGetListMatrimonio';
import '../styles/GetListMatrimonio.css';

const GetListMatrimonio = () => {
  const { data, isPending, error } = useGetListMatrimonio();

  if (isPending) return <p>Cargando matrimonios...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data || data.length === 0) return <p>No hay matrimonios registrados</p>;

  return (
    <div className="matrimonio-table-container">
      <h2>Lista de Matrimonios</h2>
      <table className="matrimonio-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Contrayente 1</th>
            <th>Contrayente 2</th>
            <th>Día</th>
            <th>Mes</th>
            <th>Año</th>
            <th>Lugar</th>
            <th>Tomo</th>
            <th>Folio</th>
          </tr>
        </thead>
        <tbody>
          {data.map((matrimonio) => (
            <tr key={matrimonio.id}>
              <td>{matrimonio.id}</td>
              <td>{matrimonio.NombreContrayente}</td>
              <td>{matrimonio.NombreContrayente2}</td>
              <td>{matrimonio.DiaMatrimonio}</td>
              <td>{matrimonio.MesMatrimonio}</td>
              <td>{matrimonio.AnnioMatrimonio}</td>
              <td>{matrimonio.LugarMatrimonio}</td>
              <td>{matrimonio.Tomo}</td>
              <td>{matrimonio.Folio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GetListMatrimonio;