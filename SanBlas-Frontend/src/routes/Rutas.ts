const dashboardBase = "/dashboard";

const dashboardPath = {
  registroSacramentos: "registro-sacramentos",
  constanciasSacramentos: "constancias-sacramentos",
  solicitudesCatequesis: "catequesis",
  donaciones: "donaciones",
  eventos: "eventos",
  gestionLanding: "landing",
  gestionUsuarios: "usuarios",
};

const Rutas = {
  home: "/",
  sobreNosotros: "/sobre-nosotros",
  historia: "/historia",
  FormsolicitudesCatequesis: "/solicitudes-catequesis",
  donacionesPublicas: "/donaciones",
  SolicitudesSacramentos: "/solicitudes-sacramentos",
  bautizos: "/bautizos",
  horarios: "/horarios",
  contacto: "/contacto",
  eventosPublicos: "/eventos",
  login: "/login",
  dashboard: dashboardBase,

  dashboardPath,

  dashboardUrl: {
    registroSacramentos: `${dashboardBase}/${dashboardPath.registroSacramentos}`,
    constanciasSacramentos: `${dashboardBase}/${dashboardPath.constanciasSacramentos}`,
    solicitudesCatequesis: `${dashboardBase}/${dashboardPath.solicitudesCatequesis}`,
    donaciones: `${dashboardBase}/${dashboardPath.donaciones}`,
    eventos: `${dashboardBase}/${dashboardPath.eventos}`,
    gestionLanding: `${dashboardBase}/${dashboardPath.gestionLanding}`,
    gestionUsuarios: `${dashboardBase}/${dashboardPath.gestionUsuarios}`,
  },
};

export default Rutas;
