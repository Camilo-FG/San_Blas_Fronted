# reCAPTCHA v2 — configuración y despliegue

## Qué protege

Los formularios de donaciones y solicitudes de constancias utilizan reCAPTCHA v2 de casilla. El backend verifica el token con Google antes de crear datos o subir un comprobante en:

- `POST /Donacion`.
- `POST /solic-sacramento` (JSON).
- `POST /solic-sacramento/con-imagen` (token dentro del JSON de `Payload`).

No se incorporó CAPTCHA a otros formularios ni se modificaron los datos de negocio existentes. El token no se persiste ni se incluye en las respuestas. La edición administrativa no requiere un token nuevo.

## Variables

| Plataforma | Variable | Contenido |
| --- | --- | --- |
| Netlify, scope Builds y contexto Production | `VITE_RECAPTCHA_SITE_KEY` | Clave pública v2 del sitio. |
| Railway, servicio backend | `RECAPTCHA_SECRET_KEY` | Clave secreta correspondiente; nunca debe ir en el frontend. |
| Railway | `FRONTEND_URL` | URL del sitio publicado, por ejemplo `https://parroquiasanblas.org`. Su hostname se utiliza para validar la respuesta de Google. |
| Railway, opcional | `RECAPTCHA_ALLOWED_HOSTNAMES` | Lista explícita de hostnames separados por comas, sin protocolo ni rutas. Si está vacía, se utiliza `FRONTEND_URL`; si también falta, solo se permite `parroquiasanblas.org`. |

En Google, registrar el dominio y mantener habilitada la verificación de dominios. No usar claves de pruebas en producción. Para desarrollo, configurar claves y dominios apropiados por separado; no existe un interruptor para saltarse la validación.

Los `.env.example` de ambos repositorios documentan los nombres sin secretos. Los valores reales se configuran en archivos ignorados o en los paneles de despliegue, nunca en código, capturas o commits.

## Comportamiento ante fallos

- Token ausente, mal formado, inválido, vencido, reutilizado o emitido para otro hostname: se rechaza con 400 y no se crea el registro.
- Secreto ausente/incorrecto o Google no disponible: 503, sin permitir el guardado como respaldo.
- La llamada del backend usa HTTPS, un timeout de 8 segundos y no reintenta ni cachea éxitos. Google valida la vigencia y el uso único del token.
- El frontend invalida el token al expirar, ante error del widget y después de cada intento de envío. Si falla el guardado, conserva los datos del formulario para que se pueda resolver otro CAPTCHA.
- Sin clave pública se muestra un aviso y no se utiliza automáticamente una clave de prueba. No hay casilla alternativa que genere tokens falsos.

## CSP y prerender

`RecaptchaWidget` carga el script exclusivamente desde `www.google.com/recaptcha/`. `netlify.toml` permite los scripts de Google/gstatic, los iframes de Google y `recaptcha.google.com`, y las conexiones de reCAPTCHA. No se autoriza un comodín ni se desactiva CSP.

El script de prerender marca su navegador con `__SANBLAS_PRERENDER__`; el widget no carga desafíos allí. Así no se publican scripts, callbacks ni iframes vinculados al localhost del build. El widget se monta en la visita real al sitio.

## Publicación

1. Configurar las variables de Railway y Netlify y comprobar que las claves corresponden al mismo sitio v2.
2. Publicar el backend y el frontend como un cambio coordinado: el backend nuevo rechaza solicitudes de clientes antiguos que no envíen token. Preferir actualizar primero el frontend, que ya incluye el campo en ambos contratos.
3. Ejecutar un build nuevo de Netlify: cambiar una variable `VITE_` no modifica los archivos ya desplegados.
4. En una sesión nueva, abrir `/donaciones/` y `/solicitudes-sacramentos/` y revisar que no haya bloqueos CSP y que no aparezca la advertencia de clave de pruebas.
5. Resolver manualmente el desafío y enviar un formulario de prueba autorizado. No automatizar ni saltarse un desafío real.
6. Comprobar también el rechazo de envíos sin token/inválidos y que no generen registros ni archivos. Un error de CAPTCHA debe dejar los datos del formulario y permitir volver a resolverlo.

Las pruebas locales con Google simulado no acreditan que las claves, el dominio o el despliegue real estén configurados correctamente.

## Pruebas automatizadas sin datos reales

Desde el backend:

```powershell
pnpm exec jest --runInBand --testPathPatterns=recaptcha
pnpm exec nest build
```

Desde el frontend:

```powershell
pnpm exec vitest run src/shared/components/RecaptchaWidget.test.tsx src/services/constancias/constanciasService.recaptcha.test.ts src/modules/donaciones/components/DonacionForm.recaptcha.test.tsx
pnpm run build:app
```

Las pruebas simulan Google y la persistencia. Cubren los tres endpoints, ausencia/reutilización/expiración de tokens, fallo del proveedor, hostname, transporte JSON/multipart, limpieza del token, StrictMode y exclusión del prerender. El build completo añade sitemap/prerender y depende de Chromium y del API configurado.

### Resultado local de esta implementación — 9 de noviembre de 2026

- Backend: las 48 pruebas específicas de reCAPTCHA pasan; compilación NestJS correcta.
- Frontend: pasan los 14 casos nuevos y la suite completa de 33 archivos / 266 pruebas; compilación Vite de la aplicación correcta.
- La suite general del backend tiene 8 fallos en usuarios/eventos (archivos ajenos a este cambio), con 368 casos aprobados y 8 omitidos. No se corrigieron esos fallos como parte de reCAPTCHA.
- El chequeo global de tipos del frontend presenta los mismos 86 diagnósticos en HEAD y con estos cambios, sin diagnósticos nuevos. La comparación se hizo con el compilador disponible en el backend y sin modificar archivos para ocultar errores.
- No se desplegó ni se certificó el funcionamiento con claves reales. Falta la comprobación manual posterior a publicar ambos repositorios.
