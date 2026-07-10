import { useGetListMatrimonio } from '../../hooks/hooksMatrimonio/useGetListMatrimonio';
import { AdminTable, AdminTableCell, AdminTableHead, AdminTableHeaderCell, AdminTablePanel, AdminTableRow } from '../../../../shared/ui';

const GetListMatrimonio = () => {
  const { data, isPending, error } = useGetListMatrimonio();

  if (isPending) return <p>Cargando matrimonios...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data || data.length === 0) return <p>No hay matrimonios registrados</p>;

  return (
    <AdminTablePanel className="w-full overflow-x-auto">
      <h2 className="px-4 pt-4 font-heading text-xl font-extrabold text-royal-blue">Lista de Matrimonios</h2>
      <AdminTable className="min-w-[1000px]">
        <AdminTableHead>
          <tr>
            <AdminTableHeaderCell>ID</AdminTableHeaderCell>
            <AdminTableHeaderCell>Contrayente 1</AdminTableHeaderCell>
            <AdminTableHeaderCell>Contrayente 2</AdminTableHeaderCell>
            <AdminTableHeaderCell>Día</AdminTableHeaderCell>
            <AdminTableHeaderCell>Mes</AdminTableHeaderCell>
            <AdminTableHeaderCell>Año</AdminTableHeaderCell>
            <AdminTableHeaderCell>Lugar</AdminTableHeaderCell>
            <AdminTableHeaderCell>Tomo</AdminTableHeaderCell>
            <AdminTableHeaderCell>Folio</AdminTableHeaderCell>
          </tr>
        </AdminTableHead>
        <tbody>
          {data.map((matrimonio) => (
            <AdminTableRow key={matrimonio.id}>
              <AdminTableCell>{matrimonio.id}</AdminTableCell>
              <AdminTableCell>{matrimonio.NombreContrayente}</AdminTableCell>
              <AdminTableCell>{matrimonio.NombreContrayente2}</AdminTableCell>
              <AdminTableCell>{matrimonio.DiaMatrimonio}</AdminTableCell>
              <AdminTableCell>{matrimonio.MesMatrimonio}</AdminTableCell>
              <AdminTableCell>{matrimonio.AnnioMatrimonio}</AdminTableCell>
              <AdminTableCell>{matrimonio.LugarMatrimonio}</AdminTableCell>
              <AdminTableCell>{matrimonio.Tomo}</AdminTableCell>
              <AdminTableCell>{matrimonio.Folio}</AdminTableCell>
            </AdminTableRow>
          ))}
        </tbody>
      </AdminTable>
    </AdminTablePanel>
  );
};

export default GetListMatrimonio;
