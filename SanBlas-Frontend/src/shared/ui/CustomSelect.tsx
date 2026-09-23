import { useCallback, useEffect, useRef, useState, type Ref } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "./cn";

export type CustomSelectOption = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  hasError?: boolean;
  disabled?: boolean;
  maxVisibleOptions?: number;
  ref?: Ref<HTMLButtonElement>;
};

const OPTION_HEIGHT = 40;
const DROPDOWN_PADDING = 8;
const GAP = 6;

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccione",
  className,
  hasError,
  disabled,
  maxVisibleOptions,
  ref,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [maxHeight, setMaxHeight] = useState<number>(240);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  const calcMaxHeight = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const triggerBottom = rect.bottom + window.scrollY;
    const viewportBottom = window.scrollY + window.innerHeight;
    const footer = document.querySelector("footer");
    const footerTop = footer ? footer.getBoundingClientRect().top + window.scrollY : viewportBottom;
    const available = footerTop - triggerBottom - GAP;
    const fullHeight = options.length * OPTION_HEIGHT + DROPDOWN_PADDING * 2;
    const cappedHeight = maxVisibleOptions
      ? maxVisibleOptions * OPTION_HEIGHT + DROPDOWN_PADDING * 2
      : fullHeight;
    setMaxHeight(Math.min(cappedHeight, Math.max(available, OPTION_HEIGHT * 2)));
  }, [options.length, maxVisibleOptions]);

  const closeAndRefocus = useCallback(() => {
    setOpen(false);
    setFocusIndex(-1);
    triggerRef.current?.focus();
  }, []);

  const asignarTriggerRef = useCallback(
    (nodo: HTMLButtonElement | null) => {
      triggerRef.current = nodo;
      if (typeof ref === "function") {
        ref(nodo);
      } else if (ref) {
        ref.current = nodo;
      }
    },
    [ref],
  );

  const selectOption = useCallback(
    (val: string) => {
      onChange(val);
      closeAndRefocus();
    },
    [onChange, closeAndRefocus],
  );

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusIndex(-1);
      }
    },
    [],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (!open) return;
    const cerrarAlDesplazar = (event: Event) => {
      const contenedor = contenedorRef.current;
      const destino = event.target;
      if (
        contenedor &&
        destino instanceof Node &&
        contenedor.contains(destino)
      ) {
        return;
      }
      setOpen(false);
      setFocusIndex(-1);
    };
    window.addEventListener("scroll", cerrarAlDesplazar, {
      capture: true,
      passive: true,
    });
    return () =>
      window.removeEventListener("scroll", cerrarAlDesplazar, {
        capture: true,
      });
  }, [open]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        closeAndRefocus();
      }
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        calcMaxHeight();
        setOpen(true);
        const idx = options.findIndex((o) => o.value === value);
        setFocusIndex(idx >= 0 ? idx : 0);
      } else {
        setFocusIndex((prev) => {
          if (e.key === "ArrowDown") {
            return prev < options.length - 1 ? prev + 1 : 0;
          }
          return prev > 0 ? prev - 1 : options.length - 1;
        });
      }
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open && focusIndex >= 0) {
        selectOption(options[focusIndex].value);
      } else {
        calcMaxHeight();
        setOpen(true);
        const idx = options.findIndex((o) => o.value === value);
        setFocusIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === "Tab") {
      if (open) {
        e.preventDefault();
        setFocusIndex((prev) => {
          const base = prev >= 0 ? prev : 0;
          return e.shiftKey
            ? base > 0
              ? base - 1
              : options.length - 1
            : base < options.length - 1
              ? base + 1
              : 0;
        });
      }
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, optValue: string) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeAndRefocus();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectOption(optValue);
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      setFocusIndex((prev) => {
        if (e.shiftKey) {
          return prev > 0 ? prev - 1 : options.length - 1;
        }
        return prev < options.length - 1 ? prev + 1 : 0;
      });
    }
  };

  useEffect(() => {
    if (open && focusIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"] button');
      items[focusIndex]?.focus();
    }
  }, [open, focusIndex]);

  return (
    <div className={cn("relative", className)} ref={contenedorRef}>
      <button
        type="button"
        ref={asignarTriggerRef}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (!open) calcMaxHeight();
          setOpen((prev) => !prev);
          if (!open) {
            const idx = options.findIndex((o) => o.value === value);
            setFocusIndex(idx >= 0 ? idx : 0);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-2 rounded-[8px] border-2 bg-white px-3 py-2.5 text-sm font-medium text-[#16243c] transition-colors duration-100 ease-out focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
          hasError
            ? "border-red-400"
            : "border-[#16243c]/25 hover:bg-slate-200",
        )}
      >
        <span className={selected ? "" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2.5}
          className={cn(
            "shrink-0 transition-transform duration-200",
            open ? "rotate-180" : "",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-full left-0 z-[9999] mt-1.5 w-full overflow-auto rounded-[8px] border-2 border-[#16243c]/25 bg-white p-1 shadow-[0_16px_35px_rgba(6,15,32,0.18)]"
            style={{ maxHeight }}
          >
            {options.map((option, index) => {
              const activo = value === option.value;
              const enfocado = open && focusIndex === index;
              return (
                <li key={option.value} role="option" aria-selected={activo}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => selectOption(option.value)}
                    onKeyDown={(e) => handleOptionKeyDown(e, option.value)}
                    className={cn(
                      "flex w-full cursor-pointer items-center rounded-[6px] px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:outline-none",
                      enfocado
                        ? "bg-[#aa7323]/20 text-[#aa7323]"
                        : activo
                          ? "bg-[#aa7323]/10 text-[#16243c]"
                          : "text-[#16243c] hover:bg-[#aa7323]/15 hover:text-[#aa7323]",
                    )}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
