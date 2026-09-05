import { useRef, useState, type DragEvent } from "react";
import { Upload, X } from "lucide-react";
import { Label } from "../../../shared/ui";

export interface ArchivoImagen {
  file: File;
  preview: string;
}

interface SubidaImagenProps {
  value: ArchivoImagen | null;
  onChange: (archivo: ArchivoImagen | null) => void;
  required?: boolean;
  maxSizeMB?: number;
  id?: string;
  errorExterno?: string | null;
  label?: string;
  hint?: string;
  existingPreview?: string | null;
  onClearExisting?: () => void;
  textoArrastrar?: string;
  textoBoton?: string;
  mostrarVistaPrevia?: boolean;
}

const TIPOS_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const MAX_DEFAULT_MB = 5;

export const SubidaImagen = ({
  value,
  onChange,
  required,
  maxSizeMB = MAX_DEFAULT_MB,
  id,
  errorExterno,
  label,
  hint,
  existingPreview,
  onClearExisting,
  textoArrastrar = "Arrastra y suelta archivos aqui",
  textoBoton = "Browse Files",
  mostrarVistaPrevia = true,
}: SubidaImagenProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxBytes = maxSizeMB * 1024 * 1024;

  const validarArchivo = (file: File): string | null => {
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return "Formato no permitido";
    }
    if (file.size > maxBytes) {
      return `El archivo excede ${maxSizeMB}MB`;
    }
    return null;
  };

  const procesarArchivo = (file: File) => {
    const errorValidacion = validarArchivo(file);
    if (errorValidacion) {
      setError(errorValidacion);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    onChange({ file, preview: url });
  };

  const limpiar = () => {
    if (value?.preview) URL.revokeObjectURL(value.preview);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setArrastrando(false);
    const file = event.dataTransfer.files?.[0];
    if (file) procesarArchivo(file);
  };

  const archivoListo = Boolean(value || existingPreview);
  const cancelarSubida = () => {
    if (value) limpiar();
    else onClearExisting?.();
  };

  return (
    <div
      id={id}
      className="col-span-1 flex w-full min-w-0 flex-col gap-2 sm:col-span-2"
    >
      {(label || required) && (
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <Label className="text-sm font-bold text-royal-blue" required={required}>
            {label ?? "Comprobante de pago"}
          </Label>
          {hint ? (
            <span className="text-xs text-gray-500">{hint}</span>
          ) : required && !label ? (
            <span className="text-xs text-gray-500">
              sinpe de la parroquia: 2685-3540
            </span>
          ) : null}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={TIPOS_PERMITIDOS.join(",")}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) procesarArchivo(file);
        }}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (archivoListo && !mostrarVistaPrevia) return;
          inputRef.current?.click();
        }}
        onKeyDown={(event) => {
          if (archivoListo && !mostrarVistaPrevia) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={handleDrop}
        className={`relative flex min-h-44 w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-[2px] border-dashed px-4 py-8 text-center transition-colors duration-150 ease-out focus:shadow-[0_0_0_4px_rgba(28,78,156,0.14)] focus:outline-none ${
          archivoListo && !mostrarVistaPrevia
            ? "border-emerald-500 bg-emerald-50"
            : arrastrando
              ? "border-royal-blue bg-royal-blue/5"
              : "border-slate-300 bg-[#fdfdfd] hover:border-royal-blue/70 hover:bg-royal-blue/5"
        }`}
      >
        {archivoListo && !mostrarVistaPrevia ? (
          <>
            <div className="flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Upload size={22} />
            </div>
            <p className="m-0 max-w-full truncate text-sm font-semibold text-slate-700">
              {value?.file.name ?? "Imagen adjunta"}
            </p>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                cancelarSubida();
              }}
              aria-label="Cancelar subida"
              className="absolute top-2.5 right-2.5 inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition-colors hover:bg-black"
            >
              <X size={16} />
            </button>
          </>
        ) : value ? (
          <>
            {mostrarVistaPrevia && (
              <img
                src={value.preview}
                alt="Vista previa de la imagen"
                className="max-h-32 w-auto max-w-full rounded-lg border border-slate-200 object-contain"
              />
            )}
            <span className="max-w-full truncate text-sm font-medium text-slate-700">
              {value.file.name}
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                limpiar();
              }}
              aria-label="Eliminar imagen"
              className="absolute right-2 top-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-slate-900/70 text-white transition-colors duration-150 ease-out hover:bg-red-600"
            >
              <X size={15} />
            </button>
          </>
        ) : existingPreview ? (
          <>
            {mostrarVistaPrevia && (
              <img
                src={existingPreview}
                alt="Imagen actual"
                className="max-h-32 w-auto max-w-full rounded-lg border border-slate-200 object-contain"
              />
            )}
            <span className="text-sm font-medium text-slate-700">
              Imagen actual
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClearExisting?.();
              }}
              aria-label="Eliminar imagen"
              className="absolute right-2 top-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-slate-900/70 text-white transition-colors duration-150 ease-out hover:bg-red-600"
            >
              <X size={15} />
            </button>
          </>
        ) : (
          <>
            <div className="flex size-11 items-center justify-center rounded-full bg-royal-blue/10 text-royal-blue">
              <Upload size={22} />
            </div>
            <div className="flex flex-col items-center gap-3">
              <p className="m-0 text-sm font-medium text-slate-700">
                {textoArrastrar}
              </p>
              <p className="m-0 text-xs text-text-secondary">o</p>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  inputRef.current?.click();
                }}
                className="cursor-pointer rounded-md border-2 border-solid border-royal-blue px-4 py-1.5 font-[Arial,Helvetica,sans-serif] text-[0.8rem] font-bold text-royal-blue transition-colors duration-200 ease-out hover:border-royal-blue hover:bg-royal-blue hover:text-white"
              >
                {textoBoton}
              </button>
            </div>
          </>
        )}
      </div>

      {error && (
        <span role="alert" className="text-[0.84rem] font-semibold text-red-500">
          ⚠ {error}
        </span>
      )}
      {errorExterno && (
        <span role="alert" className="text-[0.84rem] font-semibold text-red-500">
          ⚠ {errorExterno}
        </span>
      )}
    </div>
  );
};
