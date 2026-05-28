import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import Navbar from "../shared/components/Navbar";
import Home from "../modules/landing/pages/HomePage";
import HistoriaPage from "../modules/landing/pages/HistoriaPage";
import SobreNosotrosPage from "../modules/landing/pages/SobreNosotrosPage";
import Footer from "../modules/landing/components/Footer";

import Dashboard from "../modules/dashboard/pages/Dashboard";
import DashboardHome from "../modules/dashboard/pages/DashboardHome";
import donaciones from "../modules/donaciones/pages/donaciones";
import Rutas from "./Rutas";
import SolicSacramento from "../modules/solicSacramento/pages/solicSacramento";
import GestionUsuarios from "../modules/Gestión de Usuarios/pages/GestionUsuarios";

import solicSacrametos from "../modules/solicSacramento/pages/solicSacramento";
import formSolic from "../modules/solicSacramento/components/FormSolic";
import DashSacra from "../modules/dashboardSacramento/dashSacra";
import DonacionInfo from "../modules/donaciones/components/DonacionInfo";
import GestionDonaciones from "../modules/donaciones/pages/GestionDonaciones";
import GestionSacramentos from "../modules/Registro de Sacramentos/Components/GestionSacramentos";
import { UserList } from "src/modules/Gestión de Usuarios/components/UserList/UserList";
import CatequesisForm from "../modules/dashboard/pages/catequesis/components/CatequesisForm";
import CatequesisPage from "../modules/dashboard/pages/catequesis/pages/CatequesisPage";
// import Donaciones from "../modules/donaciones/pages/donaciones";

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
  component: SobreNosotrosPage,
});

const historiaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.historia,
  component: HistoriaPage,
});
const solicitudesSacramentosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.SolicitudesSacramentos,
  component: SolicSacramento,
});

const donacionesPublicasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.donacionesPublicas,
  component: donaciones,
});
const formsolicitudesCatequesisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Rutas.FormsolicitudesCatequesis,
  component: CatequesisPage,
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
  component: () => <GestionSacramentos />,
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

const donacionesAdminRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: Rutas.dashboardPath.donaciones,
  component: GestionDonaciones, // <-- Tu nuevo componente
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
  component: GestionUsuarios,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  sobreNosotrosRoute,
  historiaRoute,
  donacionesPublicasRoute,
  solicitudesSacramentosRoute,
  formsolicitudesCatequesisRoute,
  dashboardRoute.addChildren([
    dashboardHomeRoute,
    registroSacramentosRoute,
    constanciasSacramentosRoute,
    solicitudesCatequesisRoute,
    donacionesAdminRoute,
    eventosRoute,
    gestionLandingRoute,
    gestionUsuariosRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
});
