import {
  clasificarErrorAprobacion,
  MENSAJES_APROBACION,
} from "../src/services/constancias/aprobacionErrors.ts";

let fallidos = 0;
const verificar = (nombre, obtenido, esperado) => {
  const ok = obtenido === esperado;
  if (!ok) fallidos += 1;
  console.log(`${ok ? "PASS" : "FAIL"} - ${nombre} (esperado: ${esperado}, obtenido: ${obtenido})`);
};

// 1. Timeout: código ECONNABORTED (lo que axios emite al superar el timeout de 5s)
verificar(
  "ECONNABORTED se clasifica como timeout",
  clasificarErrorAprobacion({ code: "ECONNABORTED", message: "timeout of 5000ms exceeded" }),
  "timeout",
);

// 2. Timeout: mensaje incluye "timeout" sin código
verificar(
  "mensaje con 'timeout' se clasifica como timeout",
  clasificarErrorAprobacion({ message: "timeout of 5000ms exceeded" }),
  "timeout",
);

// 3. Error de servidor: backend responde 500
verificar(
  "respuesta 500 se clasifica como servidor",
  clasificarErrorAprobacion({ message: "Request failed with status code 500", code: "ERR_BAD_RESPONSE" }),
  "servidor",
);

// 4. Error de servidor: backend 409 (solicitud ya procesada)
verificar(
  "respuesta 409 se clasifica como servidor",
  clasificarErrorAprobacion({ message: "Request failed with status code 409" }),
  "servidor",
);

// 5. Error de red genérico (se cortó la conexión a mitad de la llamada)
verificar(
  "error de red se clasifica como servidor",
  clasificarErrorAprobacion({ message: "Network Error" }),
  "servidor",
);

// 6. Error nulo/undefined no rompe
verificar("null se clasifica como servidor", clasificarErrorAprobacion(null), "servidor");
verificar("undefined se clasifica como servidor", clasificarErrorAprobacion(undefined), "servidor");

// 7. Los tres mensajes exigidos por el task existen y son exactos
verificar(
  "mensaje de error de servidor",
  MENSAJES_APROBACION.servidor,
  "No se pudo aprobar la solicitud, intentá de nuevo",
);
verificar(
  "mensaje de timeout",
  MENSAJES_APROBACION.timeout,
  "El servidor tardó demasiado en responder, intentá de nuevo",
);
verificar(
  "mensaje de sin conexión",
  MENSAJES_APROBACION.sinConexion,
  "Sin conexión a internet, verificá tu red e intentá de nuevo",
);

console.log(fallidos === 0 ? "\nTODOS LOS TESTS PASARON" : `\n${fallidos} TESTS FALLARON`);
process.exit(fallidos === 0 ? 0 : 1);
