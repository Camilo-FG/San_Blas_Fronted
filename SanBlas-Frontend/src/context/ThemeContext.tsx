import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type TemaApp = "light" | "dark";

const CLAVE_TEMA = "sb-theme";

interface ThemeContextValue {
  theme: TemaApp;
  esOscuro: boolean;
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

  useEffect(() => {
    const raiz = document.documentElement;
    if (theme === "dark") {
      raiz.classList.add("dark");
    } else {
      raiz.classList.remove("dark");
    }
    raiz.style.colorScheme = theme;
    try {
      window.localStorage.setItem(CLAVE_TEMA, theme);
    } catch {
      // almacenamiento no disponible: el tema solo vive en memoria
    }
  }, [theme]);

  const alternarTema = useCallback(() => {
    setTheme((previo) => (previo === "dark" ? "light" : "dark"));
  }, []);

  const fijarTema = useCallback((tema: TemaApp) => {
    setTheme(tema);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      esOscuro: theme === "dark",
      alternarTema,
      fijarTema,
    }),
    [theme, alternarTema, fijarTema],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return context;
};
