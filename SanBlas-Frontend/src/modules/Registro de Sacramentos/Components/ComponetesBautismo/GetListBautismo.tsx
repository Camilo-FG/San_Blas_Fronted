import { useGetListBautismo } from '../../hooks/hooksBautismo/useGetListBautismo';
import { AdminTable, AdminTableCell, AdminTableHead, AdminTableHeaderCell, AdminTablePanel, AdminTableRow } from '../../../../shared/ui';

const formatearHora = (hora: any): string => {
  if (!hora) return '';
  if (typeof hora === 'string') return hora;
  const horas = String(hora.hours ?? hora.Hours ?? hora.hour ?? '00').padStart(2, '0');
  const minutos = String(hora.minutes ?? hora.Minutes ?? hora.minute ?? '00').padStart(2, '0');
  return `${horas}:${minutos}`;
};

const GetListBautismo = () => {
  const { data, isPending, error } = useGetListBautismo();

  if (isPending) return <p className="text-text-secondary dark:text-[#b7c3d4]">Cargando bautismos...</p>;
  if (error) return <p className="text-sm font-medium text-danger dark:text-[#e66a6a]">Error: {error.message}</p>;
  if (!data || data.length === 0) return <p className="text-text-secondary dark:text-[#b7c3d4]">No hay bautismos registrados</p>;

  return (
    <AdminTablePanel className="w-full overflow-x-auto">
      <h2 className="px-4 pt-4 font-heading text-xl font-extrabold text-royal-blue">Lista de Bautismos</h2>
      <AdminTable className="min-w-[1200px]">
        <AdminTableHead>
          <tr>
            <AdminTableHeaderCell>ID</AdminTableHeaderCell>
            <AdminTableHeaderCell>Nombre</AdminTableHeaderCell>
            <AdminTableHeaderCell>Cédula</AdminTableHeaderCell>
            <AdminTableHeaderCell>Primer Apellido</AdminTableHeaderCell>
            <AdminTableHeaderCell>Segundo Apellido</AdminTableHeaderCell>
            <AdminTableHeaderCell>Parroquia</AdminTableHeaderCell>
            <AdminTableHeaderCell>Fecha Bautismo</AdminTableHeaderCell>
            <AdminTableHeaderCell>Año Bautismo</AdminTableHeaderCell>
            <AdminTableHeaderCell>Prebísptero</AdminTableHeaderCell>
            <AdminTableHeaderCell>Fecha Nacimiento</AdminTableHeaderCell>
            <AdminTableHeaderCell>Hora Nacimiento</AdminTableHeaderCell>
            <AdminTableHeaderCell>Abuelos Paternos</AdminTableHeaderCell>
            <AdminTableHeaderCell>Abuelos Maternos</AdminTableHeaderCell>
          </tr>
        </AdminTableHead>
        <tbody>
          {data.map((bautismo) => (
            <AdminTableRow key={bautismo.id}>
              <AdminTableCell>{bautismo.id}</AdminTableCell>
              <AdminTableCell>{bautismo.Nombre}</AdminTableCell>
              <AdminTableCell>{bautismo.cedula}</AdminTableCell>
              <AdminTableCell>{bautismo.PrimerApellido}</AdminTableCell>
              <AdminTableCell>{bautismo.SegundoApellido}</AdminTableCell>
              <AdminTableCell>{bautismo.NombreParroquia}</AdminTableCell>
              <AdminTableCell>{bautismo.FechaBautismo}</AdminTableCell>
              <AdminTableCell>{bautismo.AnnioBautismo}</AdminTableCell>
              <AdminTableCell>{bautismo.Prebispero}</AdminTableCell>
              <AdminTableCell>{bautismo.fechaNacimiento}</AdminTableCell>
              <AdminTableCell>{formatearHora(bautismo.horaNacimiento)}</AdminTableCell>
              <AdminTableCell>{bautismo.NombreAbuelosPaternos}</AdminTableCell>
              <AdminTableCell>{bautismo.NombreAbuelosMaternos}</AdminTableCell>
            </AdminTableRow>
          ))}
        </tbody>
      </AdminTable>
    </AdminTablePanel>
  );
};

export default GetListBautismo;
