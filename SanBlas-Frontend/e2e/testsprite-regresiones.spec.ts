import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const requireBackend = createRequire(new URL("../../../ing_san_blas_back/package.json", import.meta.url));
const { Workbook } = requireBackend("exceljs");

// Impide que las pruebas hablen con el backend real; tampoco necesitan contraseñas.
async function aislarApi(page: Page) {
  await page.route("http://localhost:3000/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let json: unknown = [];
    if (path === "/auth/session") json = {
      user: { id: 99, email: "prueba@example.test", role: "admin", roles: ["secretario"], permisos: [], accesoPanel: true },
    };
    else if (path === "/Donacion/historial") json = {
      total: 1,
      historial: [{ id: 1, nombre: "Donante de prueba", correo: "prueba@example.test", telefono: "8888-8888", detalle: "Arroz; frijoles", estado: "Aprobado", fechaIngreso: "2026-11-01" }],
    };
    else if (["/cica", "/catequesis-bautismo", "/inscripciones-catequesis", "/solic-sacramento"].includes(path)) {
      json = { data: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
    }
    else if (path === "/cica/exportar") {
      const workbook = new Workbook();
      workbook.addWorksheet("Solicitudes").addRows([["Nombre", "Estado"], ["Persona de prueba", "Pendiente"]]);
      return route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="cica-prueba.xlsx"',
          "Access-Control-Expose-Headers": "Content-Disposition",
        },
        body: Buffer.from(await workbook.xlsx.writeBuffer()),
      });
    }
    else if (path.includes("notificaciones")) json = {};
    else if (path === "/landing") json = {};
    await route.fulfill({ status: 200, json });
  });
}

test.beforeEach(async ({ page }) => {
  await aislarApi(page);
});

test("Donaciones: exporta CSV del historial y cierra el modal", async ({ page }) => {
  await page.goto("/dashboard/donaciones");
  await page.getByRole("button", { name: "Historial", exact: true }).click();
  await expect(page.getByText("Donante de prueba").first()).toBeVisible();
  await page.getByRole("button", { name: "Exportar tabla", exact: true }).click();
  const modal = page.getByRole("dialog", { name: "Exportar tabla" });
  const descarga = page.waitForEvent("download");
  await modal.getByRole("button", { name: "Exportar", exact: true }).click();
  const archivo = await descarga;
  expect(await archivo.failure()).toBeNull();
  const csv = await readFile((await archivo.path())!, "utf8");
  expect(csv).toContain("Donante de prueba");
  expect(csv).toContain('"Arroz; frijoles"');
  expect(csv).toContain("Aprobado");
  await expect(modal).not.toBeVisible();
});

test("CICA: Todos sin fechas descarga un Excel válido y cierra el modal", async ({ page }) => {
  await page.goto("/dashboard/cica");
  await page.getByRole("button", { name: "Exportar tabla", exact: true }).click();
  const modal = page.getByRole("dialog", { name: "Exportar tabla" });
  const descarga = page.waitForEvent("download");
  await modal.getByRole("button", { name: "Exportar", exact: true }).click();
  const archivo = await descarga;
  expect(await archivo.failure()).toBeNull();
  const workbook = new Workbook();
  await workbook.xlsx.load(await readFile((await archivo.path())!));
  expect(workbook.worksheets[0].getCell("A2").value).toBe("Persona de prueba");
  await expect(modal).not.toBeVisible();
});

for (const accion of ["Aprobado", "Rechazado", "conflicto"] as const) {
  test(`Constancias: ${accion} usa la misma solicitud y no deja un pendiente viejo`, async ({ page }) => {
    let estado = "Pendiente";
    let operaciones = 0;
    const solicitud = () => ({
      id: 7, PrimerNombre: "Persona", PrimerApellido: "Prueba", SegundoApellido: "Local",
      Cedula: 123456789, Telefono: 88888888, Correo: "prueba@example.test",
      FechaSolicitud: "2026-11-01", Estado: estado, Motivo: "Constancia de prueba",
    });
    await page.route("http://localhost:3000/solic-sacramento**", async (route) => {
      const req = route.request();
      if (req.method() === "PATCH") {
        operaciones++;
        expect(new URL(req.url()).pathname).toContain("/7");
        if (accion === "conflicto") {
          estado = "Aprobado"; // otra sesión lo aprobó después de cargar nuestra lista
          return route.fulfill({ status: 400, json: { mensaje: "No se puede rechazar una solicitud que ya está Aprobado." } });
        }
        estado = accion;
        return route.fulfill({ json: accion === "Rechazado"
          ? { mensaje: "Solicitud rechazada exitosamente", estado } : solicitud() });
      }
      if (new URL(req.url()).pathname === "/solic-sacramento/7") return route.fulfill({ json: solicitud() });
      return route.fulfill({ json: { data: [solicitud()], total: 1 } });
    });
    await page.goto("/dashboard/constancias-sacramentos");
    await page.getByRole("button", { name: "Ver solicitud", exact: true }).first().click();
    const detalle = page.getByRole("dialog", { name: "Datos de la solicitud" });
    await detalle.getByRole("button", { name: "Pendiente", exact: true }).click();
    await detalle.getByRole("button", { name: accion === "Aprobado" ? "Aprobado" : "Rechazado", exact: true }).click();
    if (accion === "Aprobado") {
      await page.getByRole("button", { name: "Aprobar", exact: true }).click();
    } else {
      await page.getByRole("button", { name: "Seleccione un motivo", exact: true }).click();
      await page.getByRole("button", { name: "Datos incorrectos", exact: true }).click();
      await page.getByRole("button", { name: "Continuar", exact: true }).click();
      await page.getByRole("button", { name: "Rechazar", exact: true }).click();
    }
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(operaciones).toBe(1);
    if (accion === "conflicto") {
      await expect(page.locator("tbody")).toContainText("Aprobado");
      await expect(page.getByRole("cell", { name: "Pendiente", exact: true })).toHaveCount(0);
    } else {
      await expect(page.getByRole("cell", { name: "Pendiente", exact: true })).toHaveCount(0);
      await page.getByRole("button", { name: "Archivadas", exact: true }).click();
      await page.getByRole("button", { name: "Ver solicitud", exact: true }).first().click();
      await expect(page.getByRole("dialog", { name: "Datos de la solicitud" })).toContainText(accion);
    }
  });
}

test("Registro: no ofrece filtro por sacramento y abre el expediente de la cédula consultada", async ({ page }) => {
  const consultas: URL[] = [];
  const persona = { id: 1, cedula: "1-2345-6789", nombre: "Ana", primerApellido: "Prueba", segundoApellido: "Local", nacionalidad: null };
  const bautismo = {
    id: 10, tipo: "bautismo", fechaSacramento: "2026-01-01", observaciones: null,
    parroquia: { id: 1, nombre: "Filial de prueba" },
    presbitero: { id: 1, nombre: "Pedro", primerApellido: "Prueba", segundoApellido: null },
    detalle: { bautizado: persona, padre: null, madre: null, padrino: null, madrina: null, abuelos: [] },
  };
  await page.route("http://localhost:3000/Sacramentos-nuevos/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/buscar")) {
      consultas.push(url);
      const tipo = url.searchParams.get("tipo") || "bautismo";
      return route.fulfill({ json: {
        items: [{ id: 10, nombre: "Ana Prueba Local", cedula: persona.cedula, tipo, fecha: "2026-01-01", parroquia: "Filial de prueba" }],
        total: 1, totalPages: 1, page: 1, pageSize: 10,
      } });
    }
    if (url.pathname === "/Sacramentos-nuevos/10/persona") return route.fulfill({ json: {
      persona, bautismo, comunion: null, confirmacion: null, matrimonio: null,
    } });
    return route.fulfill({ json: [] });
  });
  await page.goto("/dashboard/registro-sacramentos");
  await expect(page.getByText("Ana Prueba Local").first()).toBeVisible();
  await page.getByPlaceholder("Cédula (0-0000-0000)").fill("1-2345-6789");
  await expect.poll(() => consultas.some((url) => url.searchParams.get("cedula") === "123456789")).toBe(true);
  await page.getByRole("button", { name: "Filtros de búsqueda" }).click();
  await expect(page.getByLabel("Filtrar por tipo de sacramento")).toHaveCount(0);
  expect(consultas.every((url) => !url.searchParams.has("tipo"))).toBe(true);
  await page.getByRole("button", { name: /ver detalle/i }).first().click();
  const detalle = page.getByRole("dialog", { name: "Detalle del sacramento" });
  await expect(detalle).toContainText("Ana");
  await expect(detalle).toContainText("Pedro Prueba");
  await expect(detalle).not.toContainText("No se pudo cargar");
});

for (const confirmada of [false, true]) {
  test(`Registro: Matrimonio ${confirmada ? "habilitado con" : "bloqueado sin"} Confirmación guardada`, async ({ page }) => {
    const persona = { id: 1, cedula: "1-2345-6789", nombre: "Ana", primerApellido: "Prueba", segundoApellido: "Local" };
    const base = {
      fechaSacramento: "2026-01-01", parroquia: { id: 1, nombre: "Filial de prueba" },
      presbitero: { id: 1, nombre: "Pedro", primerApellido: "Prueba" }, observaciones: null,
    };
    const bautismo = {
      ...base, id: 10, tipo: "bautismo",
      detalle: { bautizado: persona, padre: null, madre: null, padrino: null, madrina: null, abuelos: [] },
    };
    const comunion = { ...base, id: 20, tipo: "comunion", detalle: { persona } };
    const confirmacion = confirmada ? { ...base, id: 30, tipo: "confirmacion", detalle: { persona } } : null;
    await page.route("http://localhost:3000/Sacramentos-nuevos/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/buscar")) return route.fulfill({ json: {
        items: [{ id: 10, nombre: "Ana Prueba Local", cedula: persona.cedula, tipo: "bautismo", fecha: "2026-01-01", parroquia: "Filial de prueba" }],
        total: 1, totalPages: 1, page: 1, pageSize: 10,
      } });
      if (path.endsWith("/10/persona")) return route.fulfill({ json: { persona, bautismo, comunion, confirmacion, matrimonio: null } });
      if (path.endsWith("/10")) return route.fulfill({ json: bautismo });
      return route.fulfill({ json: [] });
    });
    await page.goto("/dashboard/registro-sacramentos");
    await page.getByRole("button", { name: "Editar", exact: true }).first().click();
    const matrimonio = page.getByRole("button", { name: "MATRIMONIO", exact: true });
    if (confirmada) {
      await expect(matrimonio).toBeEnabled();
      await matrimonio.click();
      await expect(page.getByText("Cónyuge", { exact: true })).toBeVisible();
    } else {
      await expect(page.getByRole("button", { name: "CONFIRMACIÓN", exact: true })).toBeEnabled();
      await expect(matrimonio).toBeDisabled();
      await expect(matrimonio).toHaveAttribute("title", /Confirmación/);
    }
  });
}

for (const completo of [false, true]) {
  test(`Agregar: ${completo ? "envía cuatro actas juntas" : "muestra toast al saltar de Bautismo a Matrimonio"}`, async ({ page }) => {
    const persona = { id: 1, cedula: "1-2345-6789", nombre: "Ana", primerApellido: "Prueba", segundoApellido: "Local" };
    const envios: Array<{ sacramentos: Array<{ tipo: string; fechaSacramento: string }> }> = [];
    await page.addInitScript(({ completo, persona }) => {
      const vacia = { cedula: "", nombre: "", primerApellido: "", segundoApellido: "" };
      const celebracion = (fechaSacramento: string) => ({ idParroquia: "1", idPresbitero: "2", fechaSacramento });
      const sinCelebracion = { idParroquia: "", idPresbitero: "", fechaSacramento: "" };
      localStorage.setItem("sanblas.borrador.registro-sacramentos", JSON.stringify({
        tipo: "matrimonio", idParroquia: "1", idPresbitero: "2", fechaSacramento: "2026-04-01",
        celebraciones: {
          bautismo: completo ? celebracion("2026-01-01") : sinCelebracion,
          comunion: completo ? celebracion("2026-02-01") : sinCelebracion,
          confirmacion: completo ? celebracion("2026-03-01") : sinCelebracion,
          matrimonio: celebracion("2026-04-01"),
        },
        observaciones: "", bautizado: persona, padre: vacia, madre: vacia, padrino: vacia, madrina: vacia,
        abuelos: [], persona: vacia, contrayente1: vacia,
        contrayente2: { ...vacia, nombre: "Luis", primerApellido: "Prueba" },
        detalleBautismo: completo
          ? { fechaNacimiento: "2000-01-01", horaNacimiento: "10:00", lugarNacimiento: "Nicoya", libro: "1", folio: "2", asiento: "3" }
          : { fechaNacimiento: "", horaNacimiento: "", lugarNacimiento: "", libro: "", folio: "", asiento: "" },
        detalleMatrimonio: { libro: "1", folio: "2" },
      }));
    }, { completo, persona });
    await page.route("http://localhost:3000/Sacramentos-nuevos**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (route.request().method() === "POST") {
        expect(path).toBe("/Sacramentos-nuevos/lote");
        const body = route.request().postDataJSON();
        envios.push(body);
        return route.fulfill({ json: body.sacramentos.map((acta: object, i: number) => ({ ...acta, id: i + 1 })) });
      }
      if (path.endsWith("/buscar")) return route.fulfill({ json: {
        items: completo ? [] : [{ id: 10, nombre: "Ana Prueba Local", cedula: persona.cedula, tipo: "bautismo", fecha: "2026-01-01", parroquia: "Filial de prueba" }],
        total: completo ? 0 : 1, totalPages: 1, page: 1, pageSize: 10,
      } });
      if (path.endsWith("/10/persona")) return route.fulfill({ json: {
        persona, bautismo: { id: 10 }, comunion: null, confirmacion: null, matrimonio: null,
      } });
      if (path.endsWith("/parroquias")) return route.fulfill({ json: [{ id: 1, nombre: "Filial de prueba" }] });
      if (path.endsWith("/presbiteros")) return route.fulfill({ json: [{ id: 2, nombre: "Pedro", primerApellido: "Prueba" }] });
      return route.fulfill({ json: [] });
    });
    await page.goto("/dashboard/registro-sacramentos");
    await page.getByRole("button", { name: "+ Agregar", exact: true }).click();
    const modal = page.getByRole("dialog", { name: "Inscripción sacramental" });
    await expect(modal.getByRole("button", { name: "MATRIMONIO", exact: true })).toBeEnabled();
    await expect(modal.getByText(/Los sacramentos previos deben estar guardados/)).toHaveCount(0);
    await expect(modal.getByText("Cargando catálogos...")).toHaveCount(0);
    // Espera la consulta de identidad sin llamar a servicios externos ni al backend real.
    await expect.poll(() => page.evaluate((completo) => performance.getEntriesByType("resource")
      .some((entry) => entry.name.includes(completo ? "/buscar?cedula=" : "/10/persona")), completo)).toBe(true);
    await modal.getByRole("button", { name: /INSCRIBIR.*ACTA/ }).click();
    if (completo) {
      await expect.poll(() => envios.length).toBe(1);
      expect(envios[0].sacramentos.map((acta) => acta.tipo)).toEqual(["bautismo", "comunion", "confirmacion", "matrimonio"]);
      expect(envios[0].sacramentos.map((acta) => acta.fechaSacramento)).toEqual(["2026-01-01", "2026-02-01", "2026-03-01", "2026-04-01"]);
      await expect(modal).not.toBeVisible();
      await expect(page.getByText("4 actas sacramentales registradas correctamente")).toBeVisible();
    } else {
      await expect(page.getByText(/Debe registrar primero Comunión, Confirmación.*Matrimonio/)).toBeVisible();
      await expect(modal).toBeVisible();
      expect(envios).toHaveLength(0);
    }
  });
}
