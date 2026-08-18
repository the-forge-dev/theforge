# 🎛️ Botón de Mantenimiento en Admin

## ¿Qué es?

Un botón en el header del panel admin que permite activar/desactivar el modo mantenimiento **sin necesidad de redeploy**.

## 📍 Dónde está

En el panel admin (`/admin`), en el header superior derecho:

```
[Email Admin] [MANTENIMIENTO OFF] [Salir]
```

El botón cambia color según el estado:
- **Verde** (MANTENIMIENTO OFF) = Modo inactivo
- **Rojo** (MANTENIMIENTO ON) = Modo activo

## ¿Cómo funciona?

1. Inicia sesión en `/admin`
2. Busca el botón "MANTENIMIENTO OFF" o "MANTENIMIENTO ON" en el header
3. Haz clic para toggle
4. Recibirás una notificación de éxito

**Eso es todo.** No requiere redeploy, los cambios son inmediatos.

## Qué sucede al togglear

### Cuando activas (MANTENIMIENTO ON):
```
✅ Se guarda en Supabase automáticamente
✅ Usuarios sin sesión ven MaintenancePage
✅ Usuarios autenticados ven todo normal
✅ Los cambios se reflejan en 5 segundos o menos
```

### Cuando desactivas (MANTENIMIENTO OFF):
```
✅ Se guarda en Supabase automáticamente
✅ Todos los usuarios ven el sitio normal
✅ Los cambios se reflejan inmediatamente
```

## Requisito: Tabla en Supabase

⚠️ **IMPORTANTE**: El botón funciona SOLO si existe la tabla `site_config` en Supabase.

**Si NO existe la tabla**, el botón no aparecerá o mostrará error.

### Crear la tabla (una sola vez):

En Supabase, SQL Editor, pega esto:

```sql
CREATE TABLE site_config (
  id BIGINT PRIMARY KEY,
  maintenance_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_config (id, maintenance_mode) VALUES (1, false);
```

Luego, el botón funcionará.

## Pantalla de Admin

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] [Email] [MANTENIMIENTO OFF] [Salir]             │ ← Header
└─────────────────────────────────────────────────────────┘

Panel Admin
Gestiona tus productos y catálogo

┌─────────────────────────────────────────────────────────┐
│ ⚠️ Modo Mantenimiento Activo                            │  ← Si está ON
│ El sitio está en mantenimiento. Los usuarios no         │
│ autenticados verán una página de mantenimiento.         │
└─────────────────────────────────────────────────────────┘

[+ Agregar Nuevo Producto]

Tus Productos
├── [Producto 1] [Editar] [Eliminar]
├── [Producto 2] [Editar] [Eliminar]
└── ...
```

## Estados del Botón

### Cargando
```
[MANTENIMIENTO ...] 
```
Mientras se carga la configuración de Supabase.

### Inactivo (Normal)
```
[🔔 MANTENIMIENTO OFF]  ← Verde
```
El sitio funciona normalmente para todos.

### Activo (Mantenimiento)
```
[🔔 MANTENIMIENTO ON]   ← Rojo
```
Solo usuarios autenticados ven el sitio.

### Error
Si hay un error (tabla no existe), el botón puede no mostrar o mostrar error en la notificación.

## Flujo Completo

```
Admin ingresa a /admin
        ↓
Se carga la configuración actual de Supabase
        ↓
Se muestra el botón con estado actual
        ↓
Admin hace clic en el botón
        ↓
Se actualiza en Supabase (site_config table)
        ↓
Se muestra toast de "Éxito" o "Error"
        ↓
El AppWrapper detecta cambio en 5 segundos
        ↓
Los usuarios sin sesión verán MaintenancePage
o volverán a ver el sitio normal
```

## Notificaciones

Cuando toggleas, recibirás una notificación:

### ✅ Éxito (verde)
```
"Modo mantenimiento activado"
o
"Modo mantenimiento desactivado"
```

### ❌ Error (rojo)
```
"Error al cambiar modo mantenimiento"
+ descripción del error
```

Errores comunes:
- "La tabla site_config no existe en Supabase"
- "Error de conexión a Supabase"

## Ventajas

✅ **Sin redeploy** - Cambios inmediatos
✅ **Desde el admin** - No necesitas SQL
✅ **Guardado en BD** - Persiste entre sesiones
✅ **Visual** - Ves el estado en el header
✅ **Rápido** - Cambios en segundos

## Comparación: Antes vs Después

### Antes (sin botón)
```
1. Editar .env
2. VITE_MAINTENANCE_MODE=true
3. Redeploy
4. Esperar a que se actualice
5. Probar
```
⏱️ 5-10 minutos

### Después (con botón)
```
1. Entrar a /admin
2. Click en botón
3. Listo
```
⏱️ 3 segundos

## Solución de Problemas

### P: El botón no aparece
**R**: La tabla `site_config` no existe en Supabase. Créala con el SQL de arriba.

### P: Error "Could not find the table"
**R**: Ejecuta el SQL para crear la tabla en Supabase.

### P: El botón parece "congelado"
**R**: Espera unos segundos o recarga la página.

### P: ¿El cambio es inmediato?
**R**: Para los usuarios sin sesión, el cambio se refleja en máximo 5 segundos.
Para usuarios autenticados, es instantáneo.

### P: ¿Se guarda si cierro sesión?
**R**: Sí, se guarda en Supabase. Aunque cierres sesión, la configuración persiste.

## Integraciones

El botón está integrado con:
- `useAuth()` - Verifica sesión
- `useMaintenanceMode()` - Maneja estado de mantenimiento
- `maintenance.ts` - Operaciones en Supabase
- `AppWrapper.tsx` - Aplica cambios en tiempo real

## Siguiente

Una vez que tengas el botón funcionando:

1. ✅ Prueba activar/desactivar
2. ✅ Verifica que usuarios sin sesión ven MaintenancePage
3. ✅ Verifica que usuarios con sesión ven sitio normal
4. ✅ Verifica que MaintenancePage se personaliza según tus necesidades

---

**Botón de Mantenimiento integrado ✅**
