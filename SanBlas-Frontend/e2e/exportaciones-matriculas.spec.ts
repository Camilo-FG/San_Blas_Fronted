import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const requireBackend = createRequire(
  new URL("../../../ing_san_blas_back/package.json", import.meta.url),
);
const { Workbook } = requireBackend(
  "exceljs",
) as typeof import("../../../ing_san_blas_back/node_modules/exceljs");
test.skip(
  process.env.EXPORTACIONES_ISOLATED !== "1",
  "Solo se ejecuta con PostgreSQL y cuenta descartables.",
);

test("descarga Excel completo, filtra y conserva la apariencia de Juvenil", async ({
  page,
  request,
}, info) => {
  const respuesta = await request.get(
    "http://127.0.0.1:3101/__pruebas/credenciales",
  );
  expect(respuesta.ok()).toBeTruthy();
  const credenciales = await respuesta.json();
  await page.goto("/login");
  await page
    .getByLabel("Correo electrónico", { exact: true })
    .fill(credenciales.email);
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill(credenciales.password);
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  // Solo se abre el modal original para comparar estilos; no se modifica ni exporta Juvenil.
  await page.goto("/dashboard/catequesis");
  await page
    .getByRole("button", { name: "Exportar tabla", exact: true })
    .click();
  const estiloJuvenil = await page
    .getByRole("dialog", { name: "Exportar tabla" })
    .evaluate((elemento) => {
      const estilo = getComputedStyle(elemento);
      return {
        fondo: estilo.backgroundColor,
        borde: estilo.borderColor,
        radio: estilo.borderRadius,
        padding: estilo.padding,
        ancho: estilo.width,
      };
    });
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();

  for (const modulo of ["cica", "catequesis-bautismo"]) {
    await page.goto(`/dashboard/${modulo}`);
    await expect(
      page.getByText("Mostrando 1-10 de 21 registros"),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Exportar tabla", exact: true })
      .click();
    const modal = page.getByRole("dialog", { name: "Exportar tabla" });
    const estilo = await modal.evaluate((elemento) => {
      const css = getComputedStyle(elemento);
      return {
        fondo: css.backgroundColor,
        borde: css.borderColor,
        radio: css.borderRadius,
        padding: css.padding,
        ancho: css.width,
      };
    });
    expect(estilo).toEqual(estiloJuvenil);
    await expect(
      modal.getByRole("button", { name: "Sacramento", exact: true }),
    ).toHaveCount(0);
    await expect(
      modal.getByRole("button", { name: "Condición", exact: true }),
    ).toHaveCount(0);
    await expect(modal.getByLabel("Desde", { exact: true })).toBeVisible();
    await expect(modal.getByLabel("Hasta", { exact: true })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    await modal.screenshot({
      path: info.outputPath(`${modulo}-exportacion.png`),
    });
    const descargaCompleta = page.waitForEvent("download");
    await modal.getByRole("button", { name: "Exportar", exact: true }).click();
    const archivo = await descargaCompleta;
    const libro = new Workbook();
    await libro.xlsx.load(await readFile((await archivo.path())!));
    expect(libro.worksheets[0].rowCount).toBe(29); // 24 registros, no los 10 visibles
    expect(archivo.suggestedFilename()).toMatch(
      /^inscripciones_(cica|bautismo)_\d{4}-\d{2}-\d{2}\.xlsx$/,
    );
    await expect(modal).not.toBeVisible();

    await page
      .getByRole("button", { name: "Exportar tabla", exact: true })
      .click();
    await modal.getByLabel("Desde", { exact: true }).fill("2000-01-01");
    await modal.getByLabel("Hasta", { exact: true }).fill("2000-01-01");
    await modal.getByRole("button", { name: "Exportar", exact: true }).click();
    await expect(modal.getByText(/No hay solicitudes/)).toBeVisible();
    await expect(modal.getByLabel("Desde", { exact: true })).toHaveValue(
      "2000-01-01",
    );
    await expect(modal.getByLabel("Hasta", { exact: true })).toHaveValue(
      "2000-01-01",
    );

    // Exactamente dos solicitudes del 1 de septiembre en CR: inicio y último instante del día.
    await modal.getByLabel("Desde", { exact: true }).fill("2026-09-01");
    await expect(
      modal.getByRole("button", { name: "Exportar", exact: true }),
    ).toBeDisabled();
    await modal.getByLabel("Hasta", { exact: true }).fill("2026-09-01");
    const descargaDia = page.waitForEvent("download");
    await modal.getByRole("button", { name: "Exportar", exact: true }).click();
    const archivoDia = await descargaDia;
    const libroDia = new Workbook();
    await libroDia.xlsx.load(await readFile((await archivoDia.path())!));
    const hojaDia = libroDia.worksheets[0];
    expect(hojaDia.rowCount).toBe(7);
    expect(hojaDia.getCell("D6").value).toBe("400000002");
    expect(hojaDia.getCell("D7").value).toBe("400000001");
    expect(hojaDia.getCell("O6").value).toEqual(
      new Date("2026-09-01T00:00:00Z"),
    );
    await expect(modal).not.toBeVisible();

    await page
      .getByRole("button", { name: "Exportar tabla", exact: true })
      .click();
    await modal.getByLabel("Desde", { exact: true }).fill("2026-10-05");
    await modal.getByLabel("Hasta", { exact: true }).fill("2026-10-05");
    await modal.getByRole("button", { name: "Estado", exact: true }).click();
    await page.getByRole("button", { name: "Aprobadas", exact: true }).click();
    const descargaFiltrada = page.waitForEvent("download");
    await modal.getByRole("button", { name: "Exportar", exact: true }).click();
    const filtrado = await descargaFiltrada;
    const libroFiltrado = new Workbook();
    await libroFiltrado.xlsx.load(await readFile((await filtrado.path())!));
    const hoja = libroFiltrado.worksheets[0];
    expect(hoja.rowCount).toBe(7);
    expect(hoja.getCell("N6").value).toBe("Aprobada");
    expect(hoja.getCell("N7").value).toBe("Aprobada");
    if (modulo !== "cica") {
      expect(hoja.getCell("R6").value).toBe("Prueba Local");
      expect(hoja.getCell("P6").numFmt).toBe("dd/mm/yyyy");
    }
    await expect(modal).not.toBeVisible();
  }
});
