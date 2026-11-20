# Meridian · Taller de reparaciones (React + PocketBase)

Segundo parcial de Programación Web. Servidor en `servidor/` (PocketBase con migraciones y hooks) y cliente en `cliente/` (Vite + React + React Router, solo `fetch`).

## Requisitos

- Node.js 18 o superior (https://nodejs.org)
- PocketBase 0.23 o superior (https://pocketbase.io/docs/), el ejecutable para tu sistema

## Levantarlo desde cero

Hacen falta **dos terminales abiertas a la vez**.

**Terminal 1: servidor**

```bash
cd servidor
# copia aquí el ejecutable de PocketBase (pocketbase.exe en Windows)
./pocketbase serve          # en Windows: .\pocketbase.exe serve
```

En el primer arranque se aplican solas las migraciones de `pb_migrations/`:

- `1731800000_crear_colecciones.js` crea `clientes`, `ordenes` y `eventos` con sus reglas.
- `1731800001_datos_prueba.js` carga **2 clientes** (Ana Pérez y Luis Gómez) y **3 órdenes** en etapas distintas (solicitada, presupuestada y en_reparacion), de ambos clientes y con fechas y horas distintas, con su historial.

El servidor queda en http://127.0.0.1:8090 (panel de administración en `/_/`).

**Terminal 2: cliente**

```bash
cd cliente
npm install
npm run dev
```

Abre http://localhost:5173. Si PocketBase está en otra dirección, copia `cliente/.env.example` a `cliente/.env` y cambia `VITE_PB_URL`.

**Volver a los datos de prueba originales:** apaga el servidor, borra la carpeta `servidor/pb_data` y vuelve a arrancarlo.

**Solo en Windows/PowerShell:** si `npm` dice que la ejecución de scripts está deshabilitada, usa `npm.cmd` en vez de `npm`, o ejecuta una vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

## Cómo se garantizan las reglas

| Garantía | Dónde |
| --- | --- |
| Solo avanza a la etapa siguiente; las salidas solo como indica la tabla | `pb_hooks/ordenes.pb.js` (`onRecordUpdateRequest`) con el mapa de `pb_hooks/transiciones.js` |
| Rechazada, cancelada y entregada no cambian más | mismo hook: si el estado guardado no tiene siguientes, rechaza cualquier edición |
| Una orden nace solo como solicitada y sin presupuesto | `onRecordCreateRequest` |
| El presupuesto se valida al presupuestar y luego no se modifica | mismo hook de actualización |
| Historial inmodificable | `eventos`: reglas de crear, editar y borrar en `null`; los eventos los escribe el servidor |
| Cada cambio de etapa deja su evento con fecha | el hook de actualización, al guardar el cambio |
| Nadie borra órdenes ni clientes | `deleteRule: null` |
| El total no se guarda | se calcula en `cliente/src/lib/estados.js` (`calcularTotal`) |
| Coherencia al recargar o cambiar de navegador | el cliente no guarda copias: tras cada acción vuelve a pedir todo al servidor |

La interfaz solo oculta botones que no corresponden; la seguridad real está en el servidor. El hook lee el estado anterior directamente de la base de datos, no de la petición.

## Rutas del cliente

- `/` panel con el conteo de órdenes por etapa y el trabajo pendiente
- `/ordenes` lista con filtro por etapa (parámetro de consulta) y buscador
- `/ordenes/nueva` recibir un equipo (con fotos)
- `/ordenes/:id` detalle (parámetro de ruta): presupuesto, acciones e historial
- `*` página para rutas inexistentes

Todas dentro de un diseño anidado (`Layout` con `Outlet`).

## Probar el servidor sin la interfaz

```bash
# Saltarse una etapa: debe responder 400
curl -X PATCH http://127.0.0.1:8090/api/collections/ordenes/records/<ID_SOLICITADA> \
  -H "Content-Type: application/json" -d '{"estado":"aprobada"}'

# Borrar un evento: debe responder 404 (regla bloqueada)
curl -X DELETE http://127.0.0.1:8090/api/collections/eventos/records/<ID_EVENTO>
```
