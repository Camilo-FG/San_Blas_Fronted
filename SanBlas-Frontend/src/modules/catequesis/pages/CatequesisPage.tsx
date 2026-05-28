import { useState } from "react";
import CatequesisForm from "../components/CatequesisForm";
import { crearSolicitudCatequesis } from "../../dashboard/catequesis/services/catequesisService";
import type { CatequesisEnrollmentRecord } from "../../dashboard/catequesis/Types/catequesis";

const CatequesisPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CatequesisEnrollmentRecord) => {
    setLoading(true);

    try {
      console.log("Solicitud lista para enviar:", data);

      await crearSolicitudCatequesis(data);

      alert("Solicitud de catequesis enviada correctamente.");
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      alert("Ocurrió un error al enviar la solicitud.");
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
