const dashboardBase = "/dashboard";

const dashboardPath = {
  registroSacramentos: "registro-sacramentos",
  constanciasSacramentos: "constancias-sacramentos",
  solicitudesCatequesis: "catequesis",
  cica: "cica",
  catequesisBautismo: "catequesis-bautismo",
  donaciones: "donaciones",
  eventos: "eventos",
  gestionLanding: "landing",
  gestionUsuarios: "usuarios",
  perfil: "perfil",
};

const Rutas = {
  home: "/",
  sobreNosotros: "/sobre-nosotros",
  historia: "/historia",
  FormsolicitudesCatequesis: "/solicitudes-catequesis",
  solicitudesCica: "/solicitudes-cica",
  FormsolicitudesCatequesisBautismo: "/solicitudes-catequesis-bautismo",
  donacionesPublicas: "/donaciones",
  SolicitudesSacramentos: "/solicitudes-sacramentos",
  bautizos: "/bautizos",
  horarios: "/horarios",
  contacto: "/contacto",
  eventosPublicos: "/eventos",
  login: "/login",
  recuperarContrasena: "/recuperar-contrasena",
  restablecerContrasena: "/reset-password",
  dashboard: dashboardBase,

  dashboardPath,

  dashboardUrl: {
    registroSacramentos: `${dashboardBase}/${dashboardPath.registroSacramentos}`,
    constanciasSacramentos: `${dashboardBase}/${dashboardPath.constanciasSacramentos}`,
    solicitudesCatequesis: `${dashboardBase}/${dashboardPath.solicitudesCatequesis}`,
    cica: `${dashboardBase}/${dashboardPath.cica}`,
    catequesisBautismo: `${dashboardBase}/${dashboardPath.catequesisBautismo}`,
    donaciones: `${dashboardBase}/${dashboardPath.donaciones}`,
    eventos: `${dashboardBase}/${dashboardPath.eventos}`,
    gestionLanding: `${dashboardBase}/${dashboardPath.gestionLanding}`,
    gestionUsuarios: `${dashboardBase}/${dashboardPath.gestionUsuarios}`,
    perfil: `${dashboardBase}/${dashboardPath.perfil}`,
  },
};

export default Rutas;
