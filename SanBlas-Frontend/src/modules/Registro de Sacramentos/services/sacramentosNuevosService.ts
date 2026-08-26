import { apiClient } from '../../../services/apiClient';
import {
  ActualizarSacramentoInput,
  BuscarSacramentosParams,
  CrearSacramentoInput,
  ParroquiaCatalogo,
  PersonaSacramental,
  PresbiteroCatalogo,
  SacramentoDetalle,
  SacramentoListaResponse,
} from '../../../types/sacramentosNuevos';

// Listado paginado con filtros, todo resuelto en el backend.
export const buscarSacramentos = async (
  filtros: BuscarSacramentosParams,
): Promise<SacramentoListaResponse> => {
  const response = await apiClient.get('/Sacramentos-nuevos/buscar', {
    params: filtros,
  });
  return response.data;
};

// Detalle completo de un sacramento con sus relaciones.
export const obtenerSacramento = async (id: number): Promise<SacramentoDetalle> => {
  const response = await apiClient.get(`/Sacramentos-nuevos/${id}`);
  return response.data;
};

// Todos los sacramentos de una persona, buscada por cédula.
export const obtenerSacramentosPersona = async (
  cedula: string,
): Promise<PersonaSacramental> => {
  const response = await apiClient.get(
    `/Sacramentos-nuevos/persona/cedula/${encodeURIComponent(cedula)}`,
  );
  return response.data;
};

// Crea el sacramento y sus personas automáticamente en el backend.
export const crearSacramento = async (
  dto: CrearSacramentoInput,
): Promise<SacramentoDetalle> => {
  const response = await apiClient.post('/Sacramentos-nuevos', dto);
  return response.data;
};

export const actualizarSacramento = async ({
  id,
  dto,
}: {
  id: number;
  dto: ActualizarSacramentoInput;
}): Promise<SacramentoDetalle> => {
  const response = await apiClient.put(`/Sacramentos-nuevos/${id}`, dto);
  return response.data;
};

export const eliminarSacramento = async (id: number): Promise<void> => {
  await apiClient.delete(`/Sacramentos-nuevos/${id}`);
};

// Catálogos para los selectores del formulario.
export const listarParroquias = async (): Promise<ParroquiaCatalogo[]> => {
  const response = await apiClient.get('/Sacramentos-nuevos/parroquias');
  return response.data;
};

export const listarPresbiteros = async (): Promise<PresbiteroCatalogo[]> => {
  const response = await apiClient.get('/Sacramentos-nuevos/presbiteros');
  return response.data;
};