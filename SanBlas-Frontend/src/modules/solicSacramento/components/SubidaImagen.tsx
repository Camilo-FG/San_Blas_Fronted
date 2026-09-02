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

  return (
    <div
      id={id}
      className="col-span-1 flex w-full min-w-0 flex-col gap-2 sm:col-span-2"
    >
      {required && (
        <Label className="text-sm font-bold text-royal-blue" required>
          Comprobante de pago
        </Label>
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
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
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
        className={`relative flex min-h-44 w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-[2px] border-dashed px-4 py-8 text-center transition-colors duration-150 ease-out focus:border-royal-blue focus:shadow-[0_0_0_4px_rgba(28,78,156,0.14)] focus:outline-none ${
          arrastrando
            ? "border-royal-blue bg-royal-blue/5"
            : "border-slate-300 bg-[#fdfdfd] hover:border-royal-blue/70 hover:bg-royal-blue/5"
        }`}
      >
        {value ? (
          <>
            <img
              src={value.preview}
              alt="Vista previa del comprobante"
              className="max-h-32 w-auto max-w-full rounded-lg border border-slate-200 object-contain"
            />
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
        ) : (
          <>
            <div className="flex size-11 items-center justify-center rounded-full bg-royal-blue/10 text-royal-blue">
              <Upload size={22} />
            </div>
            <div className="flex flex-col items-center gap-3">
              <p className="m-0 text-sm font-medium text-slate-700">
                Arrastra y suelta archivos aqui
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
                Browse Files
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
