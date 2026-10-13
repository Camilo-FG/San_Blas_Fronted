import { Suspense, useEffect } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

import Navbar from "../shared/components/Navbar";
import Footer from "../modules/landing/components/Footer";
import { PageLoader, useToast } from "../shared/ui";
import LandingLoader from "../modules/landing/components/LandingLoader";
import Rutas from "./Rutas";
import {
  getCurrentUser,
  tienePermiso,
  type AuthUser,
} from "../services/authSession";
import { restoreSession } from "../services/authService";
import { lazyWithRetry } from "../utils/lazyWithRetry";
import { useTheme } from "../context/ThemeContext";

const Home = lazyWithRetry(() => import("../modules/landing/pages/HomePage"));

const HistoriaPage = lazyWithRetry(
  () => import("../modules/landing/pages/HistoriaPage"),
);
const SobreNosotrosPage = lazyWithRetry(
  () => import("../modules/landing/pages/SobreNosotrosPage"),
);
const BautizosPage = lazyWithRetry(() => import("../modules/landing/pages/BautizosPage"));
const HorariosPage = lazyWithRetry(() => import("../modules/landing/pages/HorariosPage"));
const ContactoPage = lazyWithRetry(() => import("../modules/landing/pages/ContactoPage"));
const DonacionesPage = lazyWithRetry(() => import("../modules/donaciones/pages/donaciones"));
const SolicSacramento = lazyWithRetry(
  () => import("../modules/solicSacramento/pages/solicSacramento"),
);
const CatequesisPage = lazyWithRetry(
  () => import("../modules/catequesis/pages/CatequesisPage"),
);
const CicaPage = lazyWithRetry(() => import("../modules/cica/pages/CicaPage"));
const CatequesisBautismoPage = lazyWithRetry(
  () => import("../modules/catequesisBautismo/pages/CatequesisBautismoPage"),
);
const LoginPage = lazyWithRetry(() => import("../modules/auth/pages/LoginPage"));
const RecuperarContrasenaPage = lazyWithRetry(
  () => import("../modules/auth/pages/RecuperarContrasenaPage"),
);
const RestablecerContrasenaPage = lazyWithRetry(
  () => import("../modules/auth/pages/RestablecerContrasenaPage"),
);
const EventosPublicPage = lazyWithRetry(
  () => import("../modules/eventos/pages/EventosPublicPage"),
);
const Dashboard = lazyWithRetry(() => import("../modules/dashboard/pages/Dashboard"));
const DashboardHome = lazyWithRetry(
  () => import("../modules/dashboard/pages/DashboardHome"),
);
const GestionSolicitudesCatequesis = lazyWithRetry(
  () =>
    import("../modules/dashboard/catequesis/pages/GestionSolicitudesCatequesis"),
);
const GestionSolicitudesCica = lazyWithRetry(
  () => import("../modules/dashboard/cica/pages/GestionSolicitudesCica"),
);
const GestionCatequesisBautismo = lazyWithRetry(
  () =>
    import("../modules/dashboard/catequesisBautismo/pages/GestionCatequesisBautismo"),
);
const DashSacra = lazyWithRetry(() => import("../modules/dashboardSacramento/dashSacra"));
const GestionDonaciones = lazyWithRetry(
  () => import("../modules/donaciones/pages/GestionDonaciones"),
);
const GestionSacramentos = lazyWithRetry(
  () => import("../modules/Registro de Sacramentos/Components/GestionSacramentos"),
);
const GestionEventos = lazyWithRetry(
  () => import("../modules/dashboard/eventos/pages/GestionEventos"),
);
const GestionLanding = lazyWithRetry(
  () => import("../modules/dashboard/landing/GestionLanding"),
);
const GestionUsuarios = lazyWithRetry(
  () => import("../modules/Gestión de Usuarios/pages/GestionUsuarios"),
);
const MiPerfil = lazyWithRetry(
  () => import("../modules/dashboard/pages/MiPerfil"),
);
function withSuspense(
  Component: React.LazyExoticComponent<() => React.JSX.Element>,
  Fallback: React.ComponentType = PageLoader,
) {
  return function SuspenseRoute() {
    return (
      <Suspense fallback={<Fallback />}>
        <Component />
      </Suspense>
    );
  };
}

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isDashboard = pathname.startsWith(Rutas.dashboard);
  const isAuthPublica =
    pathname === Rutas.login ||
    pathname.startsWith(`${Rutas.login}/`) ||
    pathname === Rutas.recuperarContrasena ||
    pathname === Rutas.restablecerContrasena;
  const { theme } = useTheme();

  useEffect(() => {
    // El modo oscuro solo existe dentro del dashboard administrativo:
    // en el sitio público y el login siempre va claro.
    const raiz = document.documentElement;
    const oscuro = theme === "dark" && isDashboard;
    raiz.classList.toggle("dark", oscuro);
    raiz.style.colorScheme = oscuro ? "dark" : "light";
  }, [theme, isDashboard]);

  return (
    <div className="flex min-h-screen flex-col">
      {!isDashboard && !isAuthPublica && <Navbar />}

      <main className="min-w-0 flex-1">
        <Suspense fallback={isDashboard ? <PageLoader /> : <LandingLoader />}>
          <Outlet />
        </Suspense>
      </main>

      {!isDashboard && !isAuthPublica && <Footer />}
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

let avisoDeRutaMostrado = false;

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.home,
  validateSearch: (search: Record<string, unknown>) => ({
    aviso: search.aviso === "ruta" ? ("ruta" as const) : undefined,
  }),
  component: function InicioConAviso() {
    const { aviso } = homeRoute.useSearch();
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
      if (aviso !== "ruta") {
        avisoDeRutaMostrado = false;
        return;
      }
      if (avisoDeRutaMostrado) return;
      avisoDeRutaMostrado = true;
      showToast(
        "Esa dirección no existe. Le mostramos los servicios de la parroquia.",
        "warning",
      );
      navigate({
        to: Rutas.home,
        hash: "servicios",
        search: { aviso: undefined },
        replace: true,
      });
    }, [aviso, navigate, showToast]);

    return (
      <Suspense fallback={<LandingLoader />}>
        <Home />
      </Suspense>
    );
  },
});

const sobreNosotrosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.sobreNosotros,
  component: withSuspense(SobreNosotrosPage, LandingLoader),
});

const historiaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.historia,
  component: withSuspense(HistoriaPage, LandingLoader),
});

const solicitudesSacramentosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.SolicitudesSacramentos,
  validateSearch: (search: Record<string, unknown>) => ({
    accessDenied:
      search.accessDenied === "admin" ? ("admin" as const) : undefined,
  }),
  component: withSuspense(SolicSacramento, LandingLoader),
});

const donacionesPublicasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.donacionesPublicas,
  component: withSuspense(DonacionesPage, LandingLoader),
});

const formsolicitudesCatequesisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.FormsolicitudesCatequesis,
  component: withSuspense(CatequesisPage, LandingLoader),
});

const solicitudesCicaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.solicitudesCica,
  component: withSuspense(CicaPage, LandingLoader),
});

const solicitudesCatequesisBautismoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.FormsolicitudesCatequesisBautismo,
  component: withSuspense(CatequesisBautismoPage, LandingLoader),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.login,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: function LoginRouteComponent() {
    const { redirect: redirectTo } = loginRoute.useSearch();

    return (
      <Suspense fallback={<LandingLoader />}>
        <LoginPage redirectTo={redirectTo} />
      </Suspense>
    );
  },
});

const recuperarContrasenaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.recuperarContrasena,
  component: withSuspense(RecuperarContrasenaPage, LandingLoader),
});

const restablecerContrasenaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.restablecerContrasena,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: function RestablecerContrasenaRoute() {
    const { token } = restablecerContrasenaRoute.useSearch();
    return (
      <Suspense fallback={<LandingLoader />}>
        <RestablecerContrasenaPage token={token} />
      </Suspense>
    );
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.dashboard,
  component: withSuspense(Dashboard),
  beforeLoad: async ({ location }) => {
    const usuario = await restoreSession();
    if (!usuario) {
      throw redirect({
        to: Rutas.login,
        search: { redirect: location.pathname },
      });
    }

    if (!usuario.accesoPanel) {
      throw redirect({
        to: Rutas.SolicitudesSacramentos,
        search: { accessDenied: "admin" },
      });
    }
  },
});

const RUTAS_POR_PERMISO: { permiso: string; to: string }[] = [
  { permiso: "panel", to: Rutas.dashboard },
  { permiso: "sacramentos", to: Rutas.dashboardUrl.registroSacramentos },
  { permiso: "constancias", to: Rutas.dashboardUrl.constanciasSacramentos },
  { permiso: "catequesis", to: Rutas.dashboardUrl.solicitudesCatequesis },
  { permiso: "donaciones", to: Rutas.dashboardUrl.donaciones },
  { permiso: "eventos", to: Rutas.dashboardUrl.eventos },
  { permiso: "landing", to: Rutas.dashboardUrl.gestionLanding },
  { permiso: "usuarios", to: Rutas.dashboardUrl.gestionUsuarios },
];

const primeraRutaPermitida = (usuario: AuthUser | null): string => {
  if (!usuario) return Rutas.SolicitudesSacramentos;
  const hallada = RUTAS_POR_PERMISO.find((item) =>
    tienePermiso(usuario, item.permiso),
  );
  return hallada ? hallada.to : Rutas.SolicitudesSacramentos;
};

const requierePermiso = (permiso: string) => async () => {
  const usuario = (await restoreSession()) ?? getCurrentUser();
  if (!usuario || !tienePermiso(usuario, permiso)) {
    const destino = primeraRutaPermitida(usuario);
    if (destino === Rutas.SolicitudesSacramentos) {
      throw redirect({
        to: Rutas.SolicitudesSacramentos,
        search: { accessDenied: "admin" },
      });
    }
    throw redirect({ to: destino });
  }
};

const dashboardHomeRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  component: withSuspense(DashboardHome),
  beforeLoad: requierePermiso("panel"),
});

const registroSacramentosRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.registroSacramentos,
  component: withSuspense(GestionSacramentos),
  beforeLoad: requierePermiso("sacramentos"),
});

const constanciasSacramentosRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.constanciasSacramentos,
  component: withSuspense(DashSacra),
  beforeLoad: requierePermiso("constancias"),
});

const solicitudesCatequesisRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.solicitudesCatequesis,
  component: withSuspense(GestionSolicitudesCatequesis),
  beforeLoad: requierePermiso("catequesis"),
});

const cicaAdminRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.cica,
  component: withSuspense(GestionSolicitudesCica),
  beforeLoad: requierePermiso("catequesis"),
});

const catequesisBautismoAdminRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.catequesisBautismo,
  component: withSuspense(GestionCatequesisBautismo),
  beforeLoad: requierePermiso("catequesis"),
});

const donacionesAdminRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.donaciones,
  component: withSuspense(GestionDonaciones),
  beforeLoad: requierePermiso("donaciones"),
});

const bautizosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.bautizos,
  component: withSuspense(BautizosPage, LandingLoader),
});

const horariosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.horarios,
  component: withSuspense(HorariosPage, LandingLoader),
});

const contactoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.contacto,
  component: withSuspense(ContactoPage, LandingLoader),
});

const eventosPublicosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.eventosPublicos,
  component: withSuspense(EventosPublicPage, LandingLoader),
});

const eventosRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.eventos,
  component: withSuspense(GestionEventos),
  beforeLoad: requierePermiso("eventos"),
});

const gestionLandingRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.gestionLanding,
  component: withSuspense(GestionLanding),
  beforeLoad: requierePermiso("landing"),
});

const gestionUsuariosRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.gestionUsuarios,
  component: withSuspense(GestionUsuarios),
  beforeLoad: requierePermiso("usuarios"),
});

const perfilRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.perfil,
  component: withSuspense(MiPerfil),
});

const rutaDesconocidaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
  beforeLoad: () => {
    throw redirect({
      to: Rutas.home,
      hash: "servicios",
      search: { aviso: "ruta" },
      replace: true,
    });
  },
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  sobreNosotrosRoute,
  contactoRoute,
  historiaRoute,
  donacionesPublicasRoute,
  solicitudesSacramentosRoute,
  formsolicitudesCatequesisRoute,
  solicitudesCicaRoute,
  solicitudesCatequesisBautismoRoute,
  bautizosRoute,
  horariosRoute,
  eventosPublicosRoute,
  loginRoute,
  recuperarContrasenaRoute,
  restablecerContrasenaRoute,
  rutaDesconocidaRoute,
  dashboardRoute.addChildren([
    dashboardHomeRoute,
    solicitudesCatequesisRoute,
    cicaAdminRoute,
    catequesisBautismoAdminRoute,
    registroSacramentosRoute,
    constanciasSacramentosRoute,
    donacionesAdminRoute,
    eventosRoute,
    gestionLandingRoute,
    gestionUsuariosRoute,
    perfilRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: false,
});
