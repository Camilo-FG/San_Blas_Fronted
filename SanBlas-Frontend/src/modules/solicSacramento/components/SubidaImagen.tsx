import { useRef, useState, type DragEvent } from "react";
import { FileText, Upload, X } from "lucide-react";
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
  tiposPermitidos?: string[];
  varianteVistaPrevia?: "predeterminada" | "tarjeta";
}

const TIPOS_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

// Extensiones explícitas: si el input usa image/jpeg, Windows muestra
// también .pjp, .jfif, .jpe y .pjpeg en el explorador.
const EXTENSIONES_POR_TIPO: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
};

const acceptDesdeTipos = (tipos: string[]) =>
  tipos.flatMap((tipo) => EXTENSIONES_POR_TIPO[tipo] ?? [tipo]).join(",");

const ETIQUETAS_TIPO: Record<string, string> = {
  "image/jpeg": "JPG, JPEG",
  "image/png": "PNG",
  "image/webp": "WEBP",
  "application/pdf": "PDF",
};

const textoFormatosAceptados = (tipos: string[], maxSizeMB: number) => {
  const nombres = tipos.flatMap((tipo) =>
    ETIQUETAS_TIPO[tipo] ? [ETIQUETAS_TIPO[tipo]] : [],
  );
  if (nombres.length === 0) return null;
  const lista =
    nombres.length === 1
      ? nombres[0]
      : `${nombres.slice(0, -1).join(", ")} o ${nombres[nombres.length - 1]}`;
  return `${lista} (máx. ${maxSizeMB} MB)`;
};

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
  tiposPermitidos = TIPOS_PERMITIDOS,
  varianteVistaPrevia = "predeterminada",
}: SubidaImagenProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxBytes = maxSizeMB * 1024 * 1024;
  const formatosAceptados = textoFormatosAceptados(tiposPermitidos, maxSizeMB);

  const validarArchivo = (file: File): string | null => {
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const extensiones = EXTENSIONES_POR_TIPO[file.type];
    if (
      !tiposPermitidos.includes(file.type) ||
      (extensiones && !extensiones.includes(extension))
    ) {
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
  const usarTarjeta =
    varianteVistaPrevia === "tarjeta" && Boolean(value || existingPreview);
  const vistaTarjeta = value?.preview ?? existingPreview ?? null;
  const esImagenTarjeta = value ? value.file.type.startsWith("image/") : true;

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
        accept={acceptDesdeTipos(tiposPermitidos)}
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
        {usarTarjeta ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                cancelarSubida();
              }}
              aria-label="Eliminar imagen"
              className="absolute top-2.5 right-2.5 inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-slate-400 text-white shadow-sm transition-colors hover:bg-slate-500"
            >
              <X size={16} />
            </button>
            <div className="flex w-full max-w-md items-center gap-3 text-left">
            {vistaTarjeta && esImagenTarjeta ? (
              <img
                src={vistaTarjeta}
                alt={value?.file.name ?? "Vista previa de la imagen"}
                className="size-20 shrink-0 rounded-lg border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-500">
                <FileText size={28} />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate text-sm font-semibold text-[#16243c]">
                {value?.file.name ?? "Imagen actual"}
              </p>
              {value && (
                <p className="m-0 text-[0.72rem] text-text-muted">
                  {(value.file.size / 1024).toFixed(0)} KB
                </p>
              )}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  cancelarSubida();
                }}
                aria-label="Quitar archivo"
                className="cursor-pointer self-start rounded-lg border-0 bg-transparent p-0 text-xs font-extrabold text-red-600 transition-colors hover:text-red-700 hover:underline"
              >
                Quitar archivo
              </button>
            </div>
          </div>
          </>
        ) : archivoListo && !mostrarVistaPrevia ? (
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
                Buscar archivo
              </button>
            </div>
          </>
        )}
      </div>

      {formatosAceptados && (
        <p className="m-0 text-xs text-text-secondary">{formatosAceptados}</p>
      )}

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
