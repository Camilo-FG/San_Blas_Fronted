import { lazy, Suspense } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import Navbar from "../shared/components/Navbar";
import Footer from "../modules/landing/components/Footer";
import Rutas from "./Rutas";
import { clearAuthToken, getAuthToken } from "../utils/authToken";
import { isTokenExpired } from "../utils/jwt";
import { isAuthenticatedAdmin } from "../utils/authRouting";

const Home = lazy(() => import("../modules/landing/pages/HomePage"));

const HistoriaPage = lazy(
  () => import("../modules/landing/pages/HistoriaPage"),
);
const SobreNosotrosPage = lazy(
  () => import("../modules/landing/pages/SobreNosotrosPage"),
);
const BautizosPage = lazy(() => import("../modules/landing/pages/BautizosPage"));
const HorariosPage = lazy(() => import("../modules/landing/pages/HorariosPage"));
const ContactoPage = lazy(() => import("../modules/landing/pages/ContactoPage"));
const DonacionesPage = lazy(() => import("../modules/donaciones/pages/donaciones"));
const SolicSacramento = lazy(
  () => import("../modules/solicSacramento/pages/solicSacramento"),
);
const CatequesisPage = lazy(
  () => import("../modules/catequesis/pages/CatequesisPage"),
);
const LoginPage = lazy(() => import("../modules/auth/pages/LoginPage"));
const EventosPublicPage = lazy(
  () => import("../modules/eventos/pages/EventosPublicPage"),
);
const Dashboard = lazy(() => import("../modules/dashboard/pages/Dashboard"));
const DashboardHome = lazy(
  () => import("../modules/dashboard/pages/DashboardHome"),
);
const GestionSolicitudesCatequesis = lazy(
  () =>
    import("../modules/dashboard/catequesis/pages/GestionSolicitudesCatequesis"),
);
const DashSacra = lazy(() => import("../modules/dashboardSacramento/dashSacra"));
const GestionDonaciones = lazy(
  () => import("../modules/donaciones/pages/GestionDonaciones"),
);
const GestionSacramentos = lazy(
  () => import("../modules/Registro de Sacramentos/Components/GestionSacramentos"),
);
const GestionEventos = lazy(
  () => import("../modules/dashboard/eventos/pages/GestionEventos"),
);
const GestionLanding = lazy(
  () => import("../modules/dashboard/landing/GestionLanding"),
);
const GestionUsuarios = lazy(
  () => import("../modules/Gestión de Usuarios/pages/GestionUsuarios"),
);

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      Cargando...
    </div>
  );
}

function withSuspense(Component: React.LazyExoticComponent<() => React.JSX.Element>) {
  return function SuspenseRoute() {
    return (
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    );
  };
}

function RootLayout() {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="app-main">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.home,
  component: withSuspense(Home),
});

const sobreNosotrosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.sobreNosotros,
  component: withSuspense(SobreNosotrosPage),
});

const historiaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.historia,
  component: withSuspense(HistoriaPage),
});

const solicitudesSacramentosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.SolicitudesSacramentos,
  validateSearch: (search: Record<string, unknown>) => ({
    accessDenied:
      search.accessDenied === "admin" ? ("admin" as const) : undefined,
  }),
  component: withSuspense(SolicSacramento),
});

const donacionesPublicasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.donacionesPublicas,
  component: withSuspense(DonacionesPage),
});

const formsolicitudesCatequesisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.FormsolicitudesCatequesis,
  component: withSuspense(CatequesisPage),
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
      <Suspense fallback={<PageLoader />}>
        <LoginPage redirectTo={redirectTo} />
      </Suspense>
    );
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.dashboard,
  component: withSuspense(Dashboard),
  beforeLoad: ({ location }) => {
    const token = getAuthToken();
    if (!token || isTokenExpired(token)) {
      if (token) clearAuthToken();
      throw redirect({
        to: Rutas.login,
        search: { redirect: location.pathname },
      });
    }

    if (!isAuthenticatedAdmin()) {
      throw redirect({
        to: Rutas.SolicitudesSacramentos,
        search: { accessDenied: "admin" },
      });
    }
  },
});

const dashboardHomeRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  component: withSuspense(DashboardHome),
});

const registroSacramentosRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.registroSacramentos,
  component: withSuspense(GestionSacramentos),
});

const constanciasSacramentosRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.constanciasSacramentos,
  component: withSuspense(DashSacra),
});

const solicitudesCatequesisRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.solicitudesCatequesis,
  component: withSuspense(GestionSolicitudesCatequesis),
});

const donacionesAdminRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.donaciones,
  component: withSuspense(GestionDonaciones),
});

const bautizosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.bautizos,
  component: withSuspense(BautizosPage),
});

const horariosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.horarios,
  component: withSuspense(HorariosPage),
});

const contactoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.contacto,
  component: withSuspense(ContactoPage),
});

const eventosPublicosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.eventosPublicos,
  component: withSuspense(EventosPublicPage),
});

const eventosRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.eventos,
  component: withSuspense(GestionEventos),
});

const gestionLandingRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.gestionLanding,
  component: withSuspense(GestionLanding),
});

const gestionUsuariosRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.gestionUsuarios,
  component: withSuspense(GestionUsuarios),
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  sobreNosotrosRoute,
  contactoRoute,
  historiaRoute,
  donacionesPublicasRoute,
  solicitudesSacramentosRoute,
  formsolicitudesCatequesisRoute,
  bautizosRoute,
  horariosRoute,
  eventosPublicosRoute,
  loginRoute,
  dashboardRoute.addChildren([
    dashboardHomeRoute,
    solicitudesCatequesisRoute,
    registroSacramentosRoute,
    constanciasSacramentosRoute,
    donacionesAdminRoute,
    eventosRoute,
    gestionLandingRoute,
    gestionUsuariosRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: false,
});
