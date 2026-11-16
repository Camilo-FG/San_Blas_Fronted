# Revisión de TestSprite — 15/11/2026

Fuente: `TestSprite.pdf`, ejecución del 08/11/2026 sobre el sitio publicado.
Se actualizaron ambos `develop` por fast-forward antes de trabajar:
frontend `5abc8ac`, backend `79d31b0`.

## Decisiones sobre los 20 casos fallidos/bloqueados

| Página | Caso | Resultado de la revisión |
| --- | --- | --- |
| 7–8 | Solicitud sacramental con comprobante | Bloqueo por falta de archivo en la prueba. Se conserva el comprobante obligatorio y la validación de formato/tamaño. No se añadió bypass. |
| 9 | Matrícula con documento | Mismo bloqueo de datos de prueba; no justifica volver opcional la fe de bautismo. |
| 10 | Adjuntar fe de bautismo | No había archivo en TestSprite. No se evidencia un fallo de subida en ese reporte. |
| 11 | Detalle sacramental | No se reprodujo el error con el código actualizado: SQL del agregado y apertura del panel verificados con actas descartables. Se corrigieron los apellidos del presbítero en el JSON para coincidir con el contrato camelCase del frontend. No se afirma que la instalación publicada esté corregida. |
| 12 | Filtros de eventos | Corregido: un rango explícito puede consultar eventos pasados aunque se seleccione “Más próximos”. Sin fechas se conserva el filtro desde hoy; se mantienen orden y limpieza de filtros. |
| 13 | Filtro por sacramento | Retirado del frontend por solicitud posterior del usuario. Se conserva el listado por expediente/bautismo y los filtros de identidad y acta. El backend mantiene la capacidad de buscar por `tipo`. |
| 14 | Estado de la donación enviada | Se muestra una confirmación persistente “Pendiente de revisión” solo después de un envío exitoso. No se exponen donaciones privadas en una lista pública. |
| 15 | Crear matrimonio | Por solicitud posterior, se exige la cadena completa Bautismo → Comunión → Confirmación → Matrimonio al crear y editar, tanto en frontend como backend. Los requisitos deben estar guardados para la misma persona. |
| 16 | Aprobar donación sin pendientes | Falta de datos de prueba, no motivo para crear solicitudes en producción. |
| 17 | Búsqueda por identidad | Se conserva la normalización de guiones que llegó del remoto y se completa para espacios internos almacenados. Verificado con SQL ejecutado y con el filtro del navegador. |
| 18 | Estado de catequesis por correo | La consulta existente compara `LOWER(...)` y recorta la entrada; el guardado recorta el correo. El PDF no prueba que el correo consultado tuviera una inscripción. No se inventan resultados ni se asocia una inscripción a una cuenta administrativa. |
| 19 | Desactivar evento sin eventos | Falta de datos de prueba. Se conserva la gestión de eventos; no se publican eventos ficticios en producción. |
| 20 | Aprobación sacramental y lista pendiente | Se refrescan las consultas también ante fallos/timeouts. El backend bloquea la fila dentro de una transacción para no competir con rechazos concurrentes. Verificado el mismo id en la acción y en el archivo local posterior. |
| 21 | Comunión sin nombre | Se evita que los valores vacíos sobrescriban la identidad al cambiar de pestaña y se bloquea el envío si no hay persona. Tener algún bautismo en el sistema no equivale a tener elegida una persona. Para un expediente existente se indica abrir Editar. No se elimina la validación del nombre del backend. |
| 22 | Datos familiares bloqueados por documento | Falta del adjunto requerido; se conservan los requisitos familiares y documentales. |
| 23 | Rechazo sobre solicitud ya aprobada | Se refresca la lista tras un conflicto y se cierran los diálogos desactualizados. El rechazo devuelve una confirmación, no una solicitud: el frontend ahora vuelve a leer la entidad persistida. Aprobación y rechazo comparten bloqueo de fila. |
| 24 | Confirmación bloqueada por sacramento anterior | Se conserva la regla de negocio. QA debe completar el expediente previo. |
| 25 | Exportar CICA | El flujo existente descarga correctamente Excel sin fechas y con estado Todos. Se demora la revocación del blob para que el navegador consuma la descarga. Verificado archivo descargado, contenido y cierre del modal. |
| 26 | Exportar donaciones | No se reprodujo el timeout: la exportación actual es local, no un endpoint lento de servidor. Se añadió prueba del CSV descargado, escape de separadores, estado y cierre del modal. |
| 27 | Bautismo duplicado | El rechazo de duplicados es correcto. No se borraron registros ni se deshabilitó ese control para pasar una prueba. |

## Evidencia y comandos

En `ing_san_blas_back/`:

```text
pnpm exec jest --runInBand --silent
Test Suites: 1 skipped, 37 passed, 37 of 38 total
Tests:       8 skipped, 382 passed, 390 total
```

Esta primera ejecución se hizo sin Docker; la suite omitida requiere
`TEST_DATABASE_URL` local explícita. La ejecución posterior con Docker se detalla
abajo. No se usó la base de producción. También se actualizaron cuatro expectativas/mocks antiguos de
usuarios: el panel ahora incluye activos e inactivos por defecto y los roles
se obtienen de `usuario_roles`, no de la columna legacy.

En `San_Blas_Fronted/SanBlas-Frontend/`:

```text
pnpm test
Test Files 36 passed (36)
Tests      274 passed (274)

pnpm exec playwright test --config playwright.testsprite.config.ts
6 passed
```

Las seis pruebas de navegador interceptan las APIs: CSV de donaciones, Excel de
CICA, aprobación, rechazo, conflicto entre sesiones y consulta/detalle sacramental.
No necesitan credenciales ni cambian datos reales. Los tests HTTP existentes del
backend verifican además la generación real del Excel y los permisos.

Verificación SQL adicional de esta sesión: PostgreSQL embebido (PGlite 0.5.16,
instalado solo en el directorio temporal, no añadido como dependencia del proyecto).
Se ejecutó la migración normalizada y el SQL real de `BusquedaNormalizadaService`
con cinco actas semilla, sin simular los resultados SQL:

```text
5 PASS: detalles agregados por acta
4 PASS: cédulas con/sin guiones y espacios
4 PASS: tipos sacramentales combinados con libro
```

Compilación:

- Backend: `pnpm exec nest build`, exit 0.
- Frontend: `PRERENDER_ALLOW_OFFLINE=1` + `pnpm build`, exit 0; 13 rutas prerenderizadas.
- El build normal local se detiene si falta `VITE_API_URL`. No se cambió ese control;
  producción debe proporcionar la variable. El modo offline solo se usó al verificar localmente.

## Límites

- No se reejecutó la suite remota completa de 52 casos ni se desplegó.
- `pnpm lint` del frontend falla porque su configuración actual no analiza
  TypeScript, además de errores previos de hooks/globals. No se cambió el sistema
  de lint ni se refactorizaron módulos ajenos a estos casos.
- La revisión ESLint de los archivos backend también encuentra deuda previa de
  tipos `any` en SQL/mocks. Las pruebas y la compilación son verificaciones separadas.
- Se mantuvieron requisitos de archivos, permisos, duplicados y prerrequisitos.
- No se hicieron commits, push, migraciones de producción ni cambios de datos publicados.

## Verificación posterior con Docker local

Docker Engine 29.7.2, contenedor exclusivo `postgres:17-alpine` (servidor 17.11),
expuesto únicamente en `127.0.0.1:55432`, sin volúmenes persistentes.
La conexión de prueba se proporcionó mediante `TEST_DATABASE_URL`, sin leer el
`.env` de producción.

Al habilitar la suite antes omitida, se detectó que su montaje estaba desactualizado:
faltaban la migración de correo/soft delete de bautismo, campos ahora obligatorios
en sus fixtures y los servicios simulados actuales de correo y acceso.
Se corrigió exclusivamente el montaje; no se relajaron validaciones ni permisos
de la aplicación. El rollback de unicidad ahora apunta a esa migración en
particular, sin revertir por error una migración posterior.

Se añadieron dos pruebas HTTP con PostgreSQL real: exportación completa de Excel
sin fechas y con filtro de estado, para CICA y catequesis de bautismo.
Abren el binario descargado y verifican filas y estado, independientemente del
tamaño de página del listado.

```text
TEST_DATABASE_URL local definida + pnpm exec jest --runInBand --silent
Test Suites: 38 passed, 38 total
Tests:       392 passed, 392 total
```

También se ejecutó el servicio SQL contra PostgreSQL en Docker (no PGlite ni
resultados SQL simulados): cinco detalles, cuatro búsquedas de identidad y cuatro
combinaciones de tipo/libro, todos correctos.

Las transiciones de constancias se verificaron con repositorios TypeORM reales y
tablas fixture mínimas descartables: aprobación, rechazo con auditoría y 10
carreras concurrentes entre ambas acciones. En cada carrera solo una acción se
confirmó, la otra recibió 400 y la auditoría coincidió con el estado persistido.
El listado releído no devolvió ningún pendiente antiguo. Estas fixtures no
pretenden certificar la cadena completa de migraciones históricas de constancias.

Los esquemas de prueba se eliminaron y las conexiones se cerraron. El contenedor
de prueba se apagó y eliminó; los otros proyectos y su puerto `3000`
no se modificaron. Se comprobó que los puertos de pruebas quedaron sin servidores
escuchando. `pnpm exec nest build` también terminó con exit 0.

## Ajuste posterior solicitado: cadena sacramental completa

Esta primera versión de Agregar fue sustituida después por el envío conjunto
descrito al final; las reglas de Editar se mantienen.

Se retiró el filtro por tipo del panel. Se reemplazó la comprobación global de
“existe algún bautismo” y el desbloqueo por borradores completos por una consulta
del expediente exacto de la cédula ingresada. Al cambiar de identidad no se
reutilizan los requisitos de la persona anterior; los errores o consultas en curso
bloquean el guardado. Las mutaciones invalidan también esta nueva consulta.
Los expedientes sin cédula se continúan desde Editar.

Matrimonio exige Bautismo, Comunión y Confirmación guardados del titular.
Confirmación exige Bautismo y Comunión. La excepción anterior de Matrimonio
con solo Bautismo queda sustituida. Se mantiene la validación del titular del
expediente, sin exigir que las actas del cónyuge estén en esta parroquia.

Los matrimonios históricos incompletos no se borran ni corrigen automáticamente:
se conservan y su guardado queda bloqueado hasta registrar los requisitos
faltantes. El backend vuelve a validar también los PUT solo de fecha/observaciones
y revierte personas y detalles modificados durante un intento rechazado.

Pruebas añadidas: bloqueos y desbloqueos de Agregar/Editar, aislamiento de identidad
y caché, regresiones de navegador y nueve casos con PostgreSQL local real.
No se alteró el expediente publicado mencionado por el usuario ni se desplegó.
Los servidores de la aplicación solicitados en `3000`/`5173` se distinguen de
los servidores descartables de QA; Playwright usa `5174`.

Verificación específica de este ajuste:

```text
Agregar/Editar: 10 pruebas de componentes aprobadas
PostgreSQL:     9 pruebas de prerrequisitos aprobadas
Playwright:    8 regresiones aprobadas, incluida ausencia del filtro y Matrimonio bloqueado/habilitado
Backend:       pnpm exec nest build aprobado
```

Regresión backend completa con `TEST_DATABASE_URL` local: **39 suites y 401
pruebas aprobadas**. El frontend compiló y prerenderizó sus 13 rutas con
`PRERENDER_ALLOW_OFFLINE=1`. El contenedor PostgreSQL de este ajuste fue detenido
y eliminado. Se verificaron `3000` (OPTIONS 204/CORS) y `5173` (HTTP 200);
`4173`/`5174` quedaron sin servidores de QA.

Regresión frontend completa final: `pnpm exec vitest run --maxWorkers=2`,
**38 archivos y 287 pruebas aprobadas**, incluidas las cinco nuevas comprobaciones
del hook de requisitos por identidad.

## Ajuste final solicitado: varias actas en un solo envío

El usuario confirmó expresamente “Varios en un envío”. Se eliminó el texto
informativo indicado y las pestañas de Agregar quedan accesibles. Cada una conserva
su propia filial, presbítero y fecha; las pestañas con campos ingresados se incluyen
en el lote, incluso si están incompletas. Visitar una pestaña vacía no crea un acta.

Al enviar, se comprueban los requisitos de la misma persona, combinando actas
persistidas con las incluidas en ese envío. Si falta un requisito, se informa con
el componente Toast existente y no se realiza la petición. También se validan todos
los campos de todas las pestañas incluidas, no solo los de la pestaña activa.

El frontend hace una sola petición a `POST /Sacramentos-nuevos/lote`.
El backend ordena las actas Bautismo → Comunión → Confirmación → Matrimonio,
exige un mismo titular, rechaza tipos repetidos y guarda todo en una transacción.
Un fallo de requisitos o de persistencia revierte todo el lote. El borrador solo se
limpia después del éxito. Crear/editar actas individuales conserva sus validaciones.

No hay despliegue ni cambios en expedientes publicados.

Verificación del envío conjunto:

- Backend completo con PostgreSQL local: **39 suites, 416 pruebas aprobadas**.
- Suite sacramental final: **17/17 pruebas PostgreSQL aprobadas**, sin lecturas
  paralelas en la conexión transaccional.
- Modales: **13 pruebas aprobadas**; Agregar se reejecutó tras comprobar que
  también se elimina el borrador al confirmar el lote (**10/10**).
- Navegador: **10 regresiones aprobadas**, incluido Toast real sin petición al
  saltar requisitos y un único POST con las cuatro actas y sus fechas.
- Frontend: build y 13 rutas prerenderizadas aprobados. Backend:
  `pnpm exec tsc --noEmit --incremental false -p tsconfig.build.json` aprobado,
  sin borrar `dist` mientras funciona el servidor de desarrollo.
- `POST /Sacramentos-nuevos/lote` sin sesión devuelve **401**.
- El contenedor descartable fue detenido y eliminado; `4173`, `5174` y `55432`
  quedaron libres. Se conservan los servicios solicitados en `3000` y `5173`.

La primera regresión frontend completa aprobó 37 archivos/282 pruebas, pero dos
workers no arrancaron a tiempo. La repetición con `--maxWorkers=1` terminó:
**39 archivos y 291 pruebas aprobadas, sin errores**. No se modificó la
configuración del proyecto para ocultar ese problema de ejecución.
