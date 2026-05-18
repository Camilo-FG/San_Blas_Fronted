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
    path: "/",
    component: () => <Home />,
});

const sobreNosotrosRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/sobre-nosotros",
    component: () => <h1>Sobre Nosotros</h1>,
});

const historiaRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/historia",
    component: () => <h1>Historia</h1>,
});

const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/dashboard",
    component: () => <Dashboard></Dashboard>,
});

const routeTree = rootRoute.addChildren([
    homeRoute,
    sobreNosotrosRoute,
    historiaRoute,
    dashboardRoute,
]);

export const router = createRouter({
    routeTree,
});