import { Search } from "lucide-react";

const SacramentoEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
        <Search size={28} strokeWidth={1.5} className="text-text-muted" />
      </span>
      <p className="m-0 max-w-md text-lg font-semibold text-text-secondary">
        No se encontraron sacramentos con los criterios seleccionados
      </p>
      <p className="m-0 max-w-md text-sm text-text-muted">
        Intente con menos filtros o verifique la información ingresada
      </p>
    </div>
  );
};

export default SacramentoEmptyState;