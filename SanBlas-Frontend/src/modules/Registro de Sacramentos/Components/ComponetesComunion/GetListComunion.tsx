import { useGetListComunion } from '../../hooks/hooksComunion/useGetListComunion';
import { AdminTable, AdminTableCell, AdminTableHead, AdminTableHeaderCell, AdminTablePanel, AdminTableRow } from '../../../../shared/ui';

const GetListComunion = () => {
  const { data, isPending, error } = useGetListComunion();

  if (isPending) return <p>Cargando comuniones...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data || data.length === 0) return <p>No hay comuniones registradas</p>;

  return (
    <AdminTablePanel className="w-full overflow-x-auto">
      <h2 className="px-4 pt-4 font-heading text-xl font-extrabold text-royal-blue">Lista de Comuniones</h2>
      <AdminTable className="min-w-[800px]">
        <AdminTableHead>
          <tr>
            <AdminTableHeaderCell>ID</AdminTableHeaderCell>
            <AdminTableHeaderCell>Nombre</AdminTableHeaderCell>
            <AdminTableHeaderCell>Día</AdminTableHeaderCell>
            <AdminTableHeaderCell>Mes</AdminTableHeaderCell>
            <AdminTableHeaderCell>Año</AdminTableHeaderCell>
            <AdminTableHeaderCell>Lugar</AdminTableHeaderCell>
          </tr>
        </AdminTableHead>
        <tbody>
          {data.map((comunion) => (
            <AdminTableRow key={comunion.id}>
              <AdminTableCell>{comunion.id}</AdminTableCell>
              <AdminTableCell>{comunion.Nombre}</AdminTableCell>
              <AdminTableCell>{comunion.DiaComunion}</AdminTableCell>
              <AdminTableCell>{comunion.MesComunion}</AdminTableCell>
              <AdminTableCell>{comunion.AnnioComunion}</AdminTableCell>
              <AdminTableCell>{comunion.LugarComunion}</AdminTableCell>
            </AdminTableRow>
          ))}
        </tbody>
      </AdminTable>
    </AdminTablePanel>
  );
};

export default GetListComunion;
