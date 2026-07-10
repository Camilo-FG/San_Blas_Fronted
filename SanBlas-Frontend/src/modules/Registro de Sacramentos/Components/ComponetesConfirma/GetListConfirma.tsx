import { useGetListConfirma } from '../../hooks/hooksConfirma/useGetListConfirma';
import { AdminTable, AdminTableCell, AdminTableHead, AdminTableHeaderCell, AdminTablePanel, AdminTableRow } from '../../../../shared/ui';

const GetListConfirmacion = () => {
  const { data, isPending, error } = useGetListConfirma();

  if (isPending) return <p>Cargando confirmaciones...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data || data.length === 0) return <p>No hay confirmaciones registradas</p>;

  return (
    <AdminTablePanel className="w-full overflow-x-auto">
      <h2 className="px-4 pt-4 font-heading text-xl font-extrabold text-royal-blue">Lista de Confirmaciones</h2>
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
          {data.map((confirmacion) => (
            <AdminTableRow key={confirmacion.id}>
              <AdminTableCell>{confirmacion.id}</AdminTableCell>
              <AdminTableCell>{confirmacion.Nombre}</AdminTableCell>
              <AdminTableCell>{confirmacion.DiaConfirmacion}</AdminTableCell>
              <AdminTableCell>{confirmacion.MesConfirmacion}</AdminTableCell>
              <AdminTableCell>{confirmacion.AnnioConfirmacion}</AdminTableCell>
              <AdminTableCell>{confirmacion.LugarConfirmacion}</AdminTableCell>
            </AdminTableRow>
          ))}
        </tbody>
      </AdminTable>
    </AdminTablePanel>
  );
};

export default GetListConfirmacion;
