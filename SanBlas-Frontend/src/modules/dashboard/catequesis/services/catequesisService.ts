import axios from "axios";
import type { CatequesisEnrollmentRecord } from "../Types/catequesis";

const BIN_ID = "6a1845da21f9ee59d2956424";
const ACCESS_KEY =
  "$2a$10$PCcROcu02aqDOpmdXKrO.ORASbSg0Tn672qSy.EHXmLPCckJibfZ6";

const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export const getSolicitudesCatequesis = async (): Promise<
  CatequesisEnrollmentRecord[]
> => {
  const response = await axios.get(API_URL, {
    headers: {
      "X-Access-Key": ACCESS_KEY,
    },
  });

  console.log("RESPUESTA COMPLETA JSONBIN:", response.data);
  console.log("RECORD JSONBIN:", response.data.record);
  console.log("SOLICITUDES:", response.data.record?.solicitudesCatequesis);

  return response.data.record.solicitudesCatequesis;
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

  return response.data.record.solicitudesCatequesis;
};
