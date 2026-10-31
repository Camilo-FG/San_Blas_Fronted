/** API estática de división territorial CR (MIT): https://ubicaciones.paginasweb.cr */

const BASE = "https://ubicaciones.paginasweb.cr";

type MapaUbicacion = Record<string, string>;

export type OpcionUbicacion = {
  id: string;
  nombre: string;
};

const cache = new Map<string, OpcionUbicacion[]>();

function mapaAOpciones(mapa: MapaUbicacion): OpcionUbicacion[] {
  return Object.entries(mapa)
    .map(([id, nombre]) => ({ id, nombre }))
    // Orden oficial por código (provincias 1–7: San José … Limón).
    .sort((a, b) => Number(a.id) - Number(b.id));
}

async function fetchMapa(ruta: string): Promise<OpcionUbicacion[]> {
  const cacheKey = ruta;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const respuesta = await fetch(`${BASE}${ruta}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!respuesta.ok) {
    throw new Error(`No se pudieron cargar las ubicaciones (${respuesta.status}).`);
  }

  const data = (await respuesta.json()) as MapaUbicacion;
  const opciones = mapaAOpciones(data);
  cache.set(cacheKey, opciones);
  return opciones;
}

export const obtenerProvinciasCR = () => fetchMapa("/provincias.json");

export const obtenerCantonesCR = (provinciaId: string) =>
  fetchMapa(`/provincia/${provinciaId}/cantones.json`);

export const obtenerDistritosCR = (provinciaId: string, cantonId: string) =>
  fetchMapa(`/provincia/${provinciaId}/canton/${cantonId}/distritos.json`);

export function idPorNombre(
  opciones: OpcionUbicacion[],
  nombre: string,
): string | undefined {
  const normalizado = nombre.trim().toLowerCase();
  return opciones.find((opcion) => opcion.nombre.toLowerCase() === normalizado)
    ?.id;
}
