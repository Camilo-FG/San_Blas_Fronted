# AUTH: mensajes de error de acceso

## Textos exactos

| Escenario | HTTP | Texto mostrado en login |
| --- | --- | --- |
| Correo inexistente | 401 | Email o contraseña incorrecta |
| Contraseña incorrecta, cuenta activa, pendiente o desactivada | 401 | Email o contraseña incorrecta |
| Cuenta pendiente, solo después de verificar una contraseña válida | 403 | Esta cuenta está pendiente de activación. Utiliza el enlace enviado a tu correo para crear tu contraseña. |
| Cuenta desactivada por administración, incluso con contraseña válida | 401 | Email o contraseña incorrecta |
| Error inesperado que no sea `ApiError` | — | No se pudo iniciar sesión. Intente nuevamente. |

Ayuda permanente, independiente del correo ingresado:

> Si aún no has activado tu cuenta, utiliza el enlace enviado a tu correo para crear tu contraseña.

## Consideración del flujo real

Las altas administrativas sin contraseña reciben un valor aleatorio interno. El
usuario elige su contraseña al activar la cuenta desde el correo. En ese caso,
una contraseña escrita antes de activar sigue recibiendo el mensaje genérico;
la ayuda permanente explica cómo continuar sin revelar si el correo existe.

Se mantiene la clasificación existente: cuenta inactiva sin `passwordChangedAt`
es pendiente; una desactivación administrativa registra esa fecha. No se cambia
el estado de cuentas, el flujo de activación ni el esquema de la base de datos.

## Verificación automatizada

- Backend: `src/Auth/login-errores.http.spec.ts`, en el repositorio backend.
  Controlador, servicio, bcrypt, JWT, guards y filtro reales; persistencia y
  correo simulados. Comprueba mensajes exactos, ausencia de cookies/tokens en
  errores, bloqueo de cuentas inactivas y login correcto después de un error.
- Frontend: `src/modules/auth/pages/LoginPage.errores.test.tsx`.
  Comprueba ayuda, errores exactos, ausencia de navegación tras fallar,
  posibilidad de corregir y reintentar, y bloqueo de envíos simultáneos.
- Frontend: `src/services/authService.permisos.test.ts`.
  Comprueba que el cliente conserva el mensaje HTTP y no guarda una sesión al fallar.

Estas pruebas no equivalen a una comprobación manual con cuentas reales ni
verifican la entrega real del correo. La igualdad de mensajes no es una auditoría
de diferencias de tiempo de respuesta.
