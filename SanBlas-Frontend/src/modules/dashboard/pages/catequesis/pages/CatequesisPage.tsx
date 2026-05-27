import { useState } from "react";
import CatequesisForm from "../components/CatequesisForm";
import type { CatequesisEnrollmentData } from "../types/CatequesisEnrollmentData";

const CatequesisPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CatequesisEnrollmentData) => {
    setLoading(true);

    try {
      console.log("Solicitud de catequesis enviada:", data);
      alert("Solicitud de catequesis enviada correctamente.");
    } catch (error) {
      console.error(error);
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
