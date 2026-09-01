import { useRef, useState, type DragEvent } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
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
}

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const formatearTamano = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const SubidaImagen = ({
  value,
  onChange,
  required,
  maxSizeMB = 5,
}: SubidaImagenProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxBytes = maxSizeMB * 1024 * 1024;

  const validarArchivo = (file: File): string | null => {
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return "Formato no permitido. Usá JPG, PNG, WEBP o GIF.";
    }
    if (file.size > maxBytes) {
      return `El archivo supera el tamaño máximo de ${maxSizeMB} MB.`;
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
    if (value?.preview) URL.revokeObjectURL(value.preview);
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
    <div className="col-span-1 flex w-full min-w-0 flex-col gap-2 sm:col-span-2">
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

      {!value ? (
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
          className={`flex min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-[1.5px] border-dashed px-4 py-6 text-center transition-colors duration-150 ease-out focus:border-royal-gold focus:shadow-[0_0_0_4px_rgba(212,175,55,0.14)] focus:outline-none ${
            arrastrando
              ? "border-royal-gold bg-royal-gold/5"
              : "border-slate-300 bg-[#fdfdfd] hover:border-royal-gold/60 hover:bg-royal-gold/5"
          }`}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-royal-blue/10 text-royal-blue">
            <ImagePlus size={24} />
          </div>
          <div className="space-y-0.5">
            <p className="m-0 text-sm font-semibold text-slate-800">
              Arrastrá una imagen o{" "}
              <span className="text-royal-blue underline">hacé clic</span>
            </p>
            <p className="m-0 text-xs text-text-secondary">
              JPG, PNG, WEBP o GIF · máx. {maxSizeMB} MB
            </p>
          </div>
        </div>
      ) : (
        <div className="flex w-full items-center gap-4 rounded-xl border-[1.5px] border-slate-300 bg-[#fdfdfd] p-3">
          <img
            src={value.preview}
            alt="Vista previa del comprobante"
            className="size-20 shrink-0 rounded-lg border border-slate-200 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-sm font-semibold text-slate-800">
              {value.file.name}
            </p>
            <p className="m-0 text-xs text-text-secondary">
              {formatearTamano(value.file.size)} · Archivo listo
            </p>
            <div className="mt-2 inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-150 ease-out hover:bg-slate-100"
              >
                <Upload size={14} />
                Cambiar
              </button>
              <button
                type="button"
                onClick={limpiar}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors duration-150 ease-out hover:bg-red-50"
              >
                <X size={14} />
                Quitar
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <span role="alert" className="text-[0.84rem] font-semibold text-red-500">
          ⚠ {error}
        </span>
      )}
    </div>
  );
};
