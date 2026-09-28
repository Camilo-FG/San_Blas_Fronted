import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../ui/cn";

type ThemeSwitchProps = {
  className?: string;
  id?: string;
};

export function ThemeSwitch({ className, id }: ThemeSwitchProps) {
  const { esOscuro, alternarTema } = useTheme();

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={esOscuro}
      aria-label={
        esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      }
      title={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={alternarTema}
      className={cn(
        "relative inline-flex h-8 w-[60px] shrink-0 cursor-pointer items-center rounded-full border px-1 transition-colors duration-200 ease-out focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none",
        esOscuro
          ? "border-[rgba(220,230,242,0.20)] bg-[#172943]"
          : "border-royal-blue/25 bg-white/10 hover:bg-white/20",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
        <Sun
          size={14}
          className={cn(
            "transition-colors duration-200",
            esOscuro ? "text-[#7F8DA3]" : "text-royal-gold",
          )}
        />
        <Moon
          size={14}
          className={cn(
            "transition-colors duration-200",
            esOscuro ? "text-[#D9A928]" : "text-[#7F8DA3]",
          )}
        />
      </span>
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 550, damping: 38 }}
        className={cn(
          "relative z-10 flex size-6 items-center justify-center rounded-full shadow-sm",
          esOscuro ? "ml-auto bg-[#D9A928]" : "bg-white",
        )}
      />
    </button>
  );
}
