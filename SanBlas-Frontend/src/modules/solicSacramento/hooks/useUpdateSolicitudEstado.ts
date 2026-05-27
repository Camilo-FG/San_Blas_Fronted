import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveSolicitud } from "../Api/solicSacramentos-service";
import { FormSacramento } from "../../../types/formSacramento";

type UpdateEstadoPayload = {
  id: number | string;
  Estado: "Pendiente" | "Aprobado" | "Rechazado";
  currentRows: FormSacramento[];
};

export const useUpdateSolicitudEstado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, Estado, currentRows }: UpdateEstadoPayload) => {
      const currentData = queryClient.getQueryData<FormSacramento[]>(['solicitudes']) ?? currentRows;

      const updatedData = currentData.map((solicitud) =>
        String(solicitud.id) === String(id) ? { ...solicitud, Estado } : solicitud,
      );

      return saveSolicitud(updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
    },
  });
};
