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
import SolicSacramento from "../modules/solicSacramento/pages/solicSacramento";
import GestionUsuarios from "../modules/Gestión de Usuarios/pages/GestionUsuarios";
import Donaciones from "../modules/donaciones/pages/donaciones";
import dashSacra from "../modules/dashboardSacramento/dashSacra";


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
    component: () => Home(),
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
    component: () => Dashboard(),
});
const solicSacramentoRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: Rutas.solicitudesSacramentos,
    component: () => dashSacra(),
});

const donacionesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: Rutas.donaciones,
    component: () => Donaciones(),
});
const GestionUsuariosRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: Rutas.GestionUsuarios,
    component: () => GestionUsuarios()
});
const routeTree = rootRoute.addChildren([
    homeRoute,
    sobreNosotrosRoute,
    historiaRoute,
    dashboardRoute,
    solicSacramentoRoute,
    GestionUsuariosRoute,
    donacionesRoute,
]);

export const router = createRouter({
    routeTree,
});