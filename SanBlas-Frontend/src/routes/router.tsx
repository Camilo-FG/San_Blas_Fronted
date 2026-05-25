import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import Navbar from "../shared/components/Navbar";
import Home from "../modules/landing/pages/HomePage";
import Footer from "../modules/landing/components/Footer";

import Dashboard from "../modules/dashboard/pages/Dashboard";

import Rutas from "./Rutas";

import Donaciones from "../modules/donaciones/pages/donaciones";
import DashSacra from "../modules/dashboardSacramento/dashSacra";
import DashboardHome from "../modules/dashboard/pages/DashboardHome";

// Luego cambia estos imports por tus páginas reales cuando las tengas
function Placeholder({ title }: { title: string }) {
  return (
    <div className="dashboard__placeholder">
      <h2>{title}</h2>
      <p>Este módulo está pendiente de integración.</p>
    </div>
  );
}

function RootLayout() {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="app-main">
        <Outlet />
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
  component: Home,
});

const sobreNosotrosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.sobreNosotros,
  component: () => <h1>Sobre Nosotros</h1>,
});

const historiaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.historia,
  component: () => <h1>Historia</h1>,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.dashboard,
  component: Dashboard,
});

const dashboardHomeRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  component: DashboardHome,
});

const registroSacramentosRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.registroSacramentos,
  component: () => <Placeholder title="Registro de sacramentos" />,
});

const constanciasSacramentosRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.constanciasSacramentos,
  component: DashSacra,
});

const solicitudesCatequesisRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.solicitudesCatequesis,
  component: () => <Placeholder title="Solicitudes de catequesis" />,
});

const donacionesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.donaciones,
  component: Donaciones,
});

const eventosRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.eventos,
  component: () => <Placeholder title="Gestión de eventos" />,
});

const gestionLandingRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.gestionLanding,
  component: () => <Placeholder title="Gestión del landing" />,
});

const gestionUsuariosRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.gestionUsuarios,
  component: () => <Placeholder title="Gestión de usuarios" />,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  sobreNosotrosRoute,
  historiaRoute,

  dashboardRoute.addChildren([
    dashboardHomeRoute,
    registroSacramentosRoute,
    constanciasSacramentosRoute,
    solicitudesCatequesisRoute,
    donacionesRoute,
    eventosRoute,
    gestionLandingRoute,
    gestionUsuariosRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
});
