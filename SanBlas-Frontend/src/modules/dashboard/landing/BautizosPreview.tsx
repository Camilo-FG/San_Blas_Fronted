interface BautizosPreviewProps {
  title: string;
  intro: string;
  requisitos: string;
  charlas: string;
  solicitud: string;
  ampliadas?: boolean;
}

// miniatura de la página de bautizos pa la vista previa del editor
export function BautizosPreview({
  title,
  intro,
  requisitos,
  charlas,
  solicitud,
  ampliadas = false,
}: BautizosPreviewProps) {
  const lista = requisitos
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);

  return (
    <div
      className={`flex h-full flex-col overflow-y-auto bg-surface text-center ${
        ampliadas ? "p-10" : "p-6"
      }`}
    >
      <h2 className="m-0 mb-4 font-heading text-2xl text-royal-blue">
        {title || "Título"}
      </h2>
      <p className="m-0 mb-6 text-sm leading-relaxed text-text-muted">
        {intro || "La introducción aparecerá aquí."}
      </p>

      <div className="rounded-lg bg-slate-50 p-5 text-left">
        <h3 className="m-0 mb-2 font-heading text-base text-royal-blue">
          Requisitos para el Bautismo
        </h3>
        <ul className="m-0 list-disc pl-5 text-sm leading-relaxed text-text-muted">
          {(lista.length ? lista : ["Requisito"]).map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>

        <h3 className="mt-5 mb-2 font-heading text-base text-royal-blue">
          Charlas Bautismales
        </h3>
        <p className="m-0 text-sm leading-relaxed text-text-muted">
          {charlas || "Las charlas aparecerán aquí."}
        </p>

        <h3 className="mt-5 mb-2 font-heading text-base text-royal-blue">
          Solicitud de Bautizo
        </h3>
        <p className="m-0 text-sm leading-relaxed text-text-muted">
          {solicitud || "El texto de solicitud aparecerá aquí."}
        </p>
      </div>
    </div>
  );
}

export default BautizosPreview;
