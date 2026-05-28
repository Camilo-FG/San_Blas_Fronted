import axios from "axios";
import type { CatequesisEnrollmentRecord } from "../Types/catequesis";

const BIN_ID = import.meta.env.VITE_CATEQUESIS_BIN_ID;
const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY_CATEQUESIS;

const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export const getSolicitudesCatequesis = async (): Promise<
  CatequesisEnrollmentRecord[]
> => {
  const response = await axios.get(API_URL, {
    headers: {
      "X-Access-Key": ACCESS_KEY,
    },
  });

  const solicitudes = response.data.record?.solicitudesCatequesis;

  if (!Array.isArray(solicitudes)) {
    console.error("Formato incorrecto en JSONBin:", response.data.record);
    return [];
  }

  return solicitudes;
};

export const updateSolicitudesCatequesis = async (
  solicitudes: CatequesisEnrollmentRecord[],
): Promise<CatequesisEnrollmentRecord[]> => {
  const response = await axios.put(
    API_URL,
    {
      solicitudesCatequesis: solicitudes,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-Access-Key": ACCESS_KEY,
      },
    },
  );

  const solicitudesActualizadas = response.data.record?.solicitudesCatequesis;

  if (!Array.isArray(solicitudesActualizadas)) {
    console.error("Error actualizando JSONBin:", response.data.record);
    return [];
  }

  return solicitudesActualizadas;
};

export const crearSolicitudCatequesis = async (
  nuevaSolicitud: CatequesisEnrollmentRecord,
): Promise<CatequesisEnrollmentRecord[]> => {
  const solicitudesActuales = await getSolicitudesCatequesis();

  const solicitudesActualizadas = [...solicitudesActuales, nuevaSolicitud];

  const response = await axios.put(
    API_URL,
    {
      solicitudesCatequesis: solicitudesActualizadas,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-Access-Key": ACCESS_KEY,
      },
    },
  );

  const solicitudesGuardadas = response.data.record?.solicitudesCatequesis;

  if (!Array.isArray(solicitudesGuardadas)) {
    console.error("Error guardando nueva solicitud:", response.data.record);
    return [];
  }

  return solicitudesGuardadas;
};
