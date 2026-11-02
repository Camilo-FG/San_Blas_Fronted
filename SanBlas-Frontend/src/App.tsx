import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { router } from "./routes/router";
import { ToastProvider } from "./shared/ui";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status =
          typeof error === "object" && error !== null && "status" in error
            ? Number(error.status)
            : 0;
        return status !== 429 && status < 500 && failureCount < 1;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <div
              onSubmitCapture={(event) => {
                const formulario = event.target;
                if (!(formulario instanceof HTMLFormElement)) return;

                requestAnimationFrame(() => {
                  const primerCampoInvalido = formulario.querySelector('[aria-invalid="true"]');
                  if (!(primerCampoInvalido instanceof HTMLElement)) return;

                  const movimientoReducido =
                    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
                  primerCampoInvalido.focus({ preventScroll: true });
                  primerCampoInvalido.scrollIntoView?.({
                    behavior: movimientoReducido ? "auto" : "smooth",
                    block: "center",
                  });
                });
              }}
            >
              <RouterProvider router={router} />
            </div>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
