import { useGetListBautismo } from '../../hooks/hooksBautismo/useGetListBautismo';
import '../styles/GetListBautismo.css';

const GetListBautismo = () => {
  const { data, isPending, error } = useGetListBautismo();

  if (isPending) return <p>Cargando bautismos...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data || data.length === 0) return <p>No hay bautismos registrados</p>;

  return (
    <div className="bautismo-table-container">
      <h2>Lista de Bautismos</h2>
      <table className="bautismo-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Cédula</th>
            <th>Primer Apellido</th>
            <th>Segundo Apellido</th>
            <th>Parroquia</th>
            <th>Fecha Bautismo</th>
            <th>Año Bautismo</th>
            <th>Prebísptero</th>
            <th>Fecha Nacimiento</th>
            <th>Hora Nacimiento</th>
            <th>Abuelos Paternos</th>
            <th>Abuelos Maternos</th>
          </tr>
        </thead>
        <tbody>
          {data.map((bautismo) => (
            <tr key={bautismo.id}>
              <td>{bautismo.id}</td>
              <td>{bautismo.Nombre}</td>
              <td>{bautismo.cedula}</td>
              <td>{bautismo.PrimerApellido}</td>
              <td>{bautismo.SegundoApellido}</td>
              <td>{bautismo.NombreParroquia}</td>
              <td>{bautismo.FechaBautismo}</td>
              <td>{bautismo.AnnioBautismo}</td>
              <td>{bautismo.Prebispero}</td>
              <td>{bautismo.fechaNacimiento}</td>
              <td>{bautismo.horaNacimiento}</td>
              <td>{bautismo.NombreAbuelosPaternos}</td>
              <td>{bautismo.NombreAbuelosMaternos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GetListBautismo;