import { useState } from "react";
import CatequesisForm from "../components/CatequesisForm";
import { crearSolicitudCatequesis } from "../../../services/catequesis/catequesisService";
import { ApiError } from "../../../services/apiClient";
import type { CatequesisEnrollmentData } from "../types/CatequesisEnrollmentData";

const CatequesisPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CatequesisEnrollmentData) => {
    setLoading(true);

    try {
      const response = await crearSolicitudCatequesis(data);
      alert(response.mensaje);
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);

      if (error instanceof ApiError) {
        alert(error.message);
      } else {
        alert("Ocurrió un error al enviar la solicitud.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CatequesisForm
      loading={loading}
      onSubmit={handleSubmit}
    />
  );
};

export default CatequesisPage;
