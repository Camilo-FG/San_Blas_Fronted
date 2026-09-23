import fs from 'node:fs';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';

export const CREDENCIALES_ARCHIVO = 'e2e/.auth/usuario.json';

// apuntamos SOLO a la API de usuarios: ojo que "**/usuario*" también matchea
// la ruta /dashboard/usuarios y rompería la navegación
export const API_BASE = process.env.E2E_API_URL ?? 'http://localhost:3000';
export const USUARIOS_API = `${API_BASE}/usuario`;
export const USUARIOS_API_GLOB = `${API_BASE}/usuario*`;

export const esPeticionUsuarios = (url: string): boolean =>
  url.includes(USUARIOS_API);

// ruta al AGENTS.md de la raíz del workspace (queda fuera del repo, así que no se commitea)
const RUTA_AGENTS_MD = path.resolve(process.cwd(), '../../AGENTS.md');

interface Credenciales {
  email: string;
  password: string;
}

// lee el usuario y la contraseña del bloque "credenciales:" del AGENTS.md.
// así el secreto vive en ese archivo y no se duplica dentro del repo
export function leerCredenciales(): Credenciales {
  if (!fs.existsSync(RUTA_AGENTS_MD)) {
    throw new Error(
      `No encontré el AGENTS.md en ${RUTA_AGENTS_MD}. Sin él no puedo autenticar los tests e2e.`,
    );
  }

  const texto = fs.readFileSync(RUTA_AGENTS_MD, 'utf8');
  const bloque = texto.match(/credenciales:\s*\r?\n(\S+)[ \t]*\r?\n(\S+)/i);

  if (!bloque) {
    throw new Error(
      'El AGENTS.md existe pero no trae el bloque "credenciales:" con usuario y contraseña.',
    );
  }

  return { email: bloque[1], password: bloque[2] };
}

// login por la UI: lo usamos en el setup y en los tests que quieren sesión fresca
export async function iniciarSesion(page: Page): Promise<void> {
  const { email, password } = leerCredenciales();

  await page.goto('/login');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.getByRole('button', { name: 'Ingresar' }).click();

  // salir de /login confirma que el token quedó guardado
  await expect(page).not.toHaveURL(/\/login/, { timeout: 20_000 });
}

// filas de la primera columna (nombre) tal como las pinta la tabla
export async function nombresVisibles(page: Page): Promise<string[]> {
  const celdas = page.locator('table tbody tr td:first-child');
  return (await celdas.allInnerTexts()).map((t) => t.trim()).filter(Boolean);
}

// peticiones a la API de usuarios registradas en orden
export function capturarPeticionesUsuarios(page: Page): URL[] {
  const urls: URL[] = [];
  page.on('request', (req) => {
    if (esPeticionUsuarios(req.url())) urls.push(new URL(req.url()));
  });
  return urls;
}

export const conSearch = (urls: URL[], valor: string): URL[] =>
  urls.filter((u) => u.searchParams.get('search') === valor);

export const sinSearch = (urls: URL[]): URL[] =>
  urls.filter((u) => !u.searchParams.get('search'));

export const sortByDe = (url: URL): string =>
  url.searchParams.get('sortBy') ?? '';

export const sortDirectionDe = (url: URL): string =>
  url.searchParams.get('sortDirection') ?? '';
