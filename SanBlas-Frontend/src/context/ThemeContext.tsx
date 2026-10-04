import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";

export type TemaApp = "light" | "dark";

const CLAVE_TEMA = "sb-theme";

interface ThemeContextValue {
  theme: TemaApp;
  esOscuro: boolean;
  cambiandoTema: boolean;
  alternarTema: () => void;
  fijarTema: (tema: TemaApp) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const leerTemaInicial = (): TemaApp => {
  try {
    const guardado = window.localStorage.getItem(CLAVE_TEMA);
    if (guardado === "light" || guardado === "dark") return guardado;
  } catch {
    // sin acceso a localStorage: se usa la preferencia del sistema
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<TemaApp>(() => leerTemaInicial());
  const [flashId, setFlashId] = useState(0);
  const [flashVisible, setFlashVisible] = useState(false);
  const [cambiandoTema, setCambiandoTema] = useState(false);
  const cambioTemaRef = useRef<number | null>(null);
  const finTransicionRef = useRef<number | null>(null);
  // Candado: ignora clicks mientras la transición anterior sigue en curso.
  const ocupadoRef = useRef(false);

  useEffect(
    () => () => {
      if (cambioTemaRef.current !== null) {
        window.clearTimeout(cambioTemaRef.current);
      }
      if (finTransicionRef.current !== null) {
        window.clearTimeout(finTransicionRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    // Solo persiste la preferencia; la clase `dark` la aplica RootLayout
    // únicamente bajo /dashboard para que lo público siempre vaya claro.
    try {
      window.localStorage.setItem(CLAVE_TEMA, theme);
    } catch {
      // almacenamiento no disponible: el tema solo vive en memoria
    }
  }, [theme]);

  const alternarTema = useCallback(() => {
    // Sin animación si el usuario prefiere movimiento reducido.
    const movimientoReducido =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (movimientoReducido) {
      setTheme((previo) => (previo === "dark" ? "light" : "dark"));
      return;
    }
    // Ignora clicks extra hasta que termine la transición en curso:
    // así no se apilan overlays ni cambios de tema contradictorios.
    if (ocupadoRef.current) return;
    ocupadoRef.current = true;
    setCambiandoTema(true);
    // 1. El overlay entra en fundido; 2. cuando ya está negro opaco
    // (fin de la entrada, ~0.21s) recién ahí cambia el tema, así el
    // usuario nunca ve el cambio de colores.
    // Activa la transición gradual de colores durante todo el cambio.
    document.documentElement.classList.add("tema-transicionando");
    setFlashId((id) => id + 1);
    setFlashVisible(true);
    cambioTemaRef.current = window.setTimeout(() => {
      setTheme((previo) => (previo === "dark" ? "light" : "dark"));
      cambioTemaRef.current = null;
    }, 250);
    finTransicionRef.current = window.setTimeout(() => {
      document.documentElement.classList.remove("tema-transicionando");
      finTransicionRef.current = null;
    }, 1600);
  }, []);

  const fijarTema = useCallback((tema: TemaApp) => {
    setTheme(tema);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      esOscuro: theme === "dark",
      cambiandoTema,
      alternarTema,
      fijarTema,
    }),
    [theme, cambiandoTema, alternarTema, fijarTema],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
      {flashVisible && (
        <motion.div
          key={flashId}
          className="pointer-events-none fixed inset-0 z-[9999] bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.4, times: [0, 0.15, 0.45, 1], ease: "easeInOut" }}
          onAnimationComplete={() => {
            setFlashVisible(false);
            ocupadoRef.current = false;
            setCambiandoTema(false);
          }}
          aria-hidden="true"
        />
      )}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return context;
};
