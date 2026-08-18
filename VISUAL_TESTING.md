# 👁️ Guía de Testing Visual - Modo Mantenimiento

## Vista Previa: MaintenancePage

La página de mantenimiento incluye:

```
┌─────────────────────────────────────────┐
│                                         │
│      🔵 Logo THE FORGE en círculo      │
│      (gradiente azul a púrpura)         │
│                                         │
│              ⚠️ Icono de alerta          │
│                                         │
│  Estamos realizando mejoras             │
│                                         │
│  Nuestro sistema se encuentra           │
│  temporalmente en mantenimiento.        │
│  Por favor intenta nuevamente más tarde.│
│                                         │
│        🟡 En mantenimiento (pulse)      │
│                                         │
│  Gracias por tu paciencia.              │
│  Volveremos pronto con mejoras.         │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│        THE FORGE © 2025                 │
│                                         │
└─────────────────────────────────────────┘
```

## Colores Utilizados

- **Fondo principal**: slate-950 a slate-900 (gradiente oscuro)
- **Elementos flotantes**: blue-500/20 y purple-500/20 (con blur)
- **Logo**: Gradiente blue-500 a purple-600
- **Alerta**: yellow-500 (amarillo)
- **Texto principal**: white
- **Texto secundario**: slate-300
- **Status badge**: slate-800 con amarillo pulsante

## Animaciones

- 🌊 Fondos flotantes: `animate-pulse` (suave)
- ⏰ Badge de estado: `animate-pulse` (suave)
- 🔄 Loading spinner: `border-t-blue-500 animate-spin`

## Testing por Dispositivo

### 📱 Móvil (320px - 640px)

```
Abre en navegación privada
↓
Título: 4xl (responsive a texto grande)
Logo: Centrado
Todo stacked verticalmente ✓
```

### 📲 Tablet (641px - 1024px)

```
Logo: w-20 h-20 visible
Título: 5xl
Descripción: legible
Badge: visible correctamente
```

### 🖥️ Desktop (1025px+)

```
Max-width: 448px (max-w-md)
Centrado en pantalla
Todos los elementos con márgenes
Fondos flotantes visibles
```

## Responsiveness Check

Abre DevTools (F12) y activa device emulation:

| Dispositivo | Resultado Esperado |
|-------------|------------------|
| iPhone SE | ✓ Texto legible, logo visible |
| iPhone 12 | ✓ Página centrada, sin overflow |
| iPad | ✓ Elementos bien distribuidos |
| Desktop 1080p | ✓ Max-width respetado, centrado |
| Desktop 4K | ✓ Padding adecuado |

## Checklist de Testing

### Prueba 1: Modo Desactivado

- [ ] Abre `.env` → `VITE_MAINTENANCE_MODE=false`
- [ ] Redeploy
- [ ] Abre navegación privada
- [ ] ✅ Ves la página principal normal
- [ ] ✅ Puedes ir a `/productos`
- [ ] ✅ Puedes ver todos los productos

### Prueba 2: Modo Activado Sin Sesión

- [ ] Abre `.env` → `VITE_MAINTENANCE_MODE=true`
- [ ] Redeploy
- [ ] Abre navegación privada
- [ ] ✅ Ves MaintenancePage
- [ ] ✅ Logo de THE FORGE visible
- [ ] ✅ Título: "Estamos realizando mejoras"
- [ ] ✅ Descripción visible
- [ ] ✅ Badge de "En mantenimiento" con pulse

### Prueba 3: Modo Activado Con Sesión

- [ ] `.env` → `VITE_MAINTENANCE_MODE=true`
- [ ] Redeploy
- [ ] Abre navegación privada e inicia sesión
- [ ] ✅ Accedes a la app normalmente
- [ ] ✅ Ves la página principal
- [ ] ✅ Puedes ir a `/productos`
- [ ] ✅ Puedes ir a `/admin`
- [ ] ✅ No ves MaintenancePage

### Prueba 4: Logout en Modo Mantenimiento

- [ ] `.env` → `VITE_MAINTENANCE_MODE=true`
- [ ] Inicia sesión en `/admin`
- [ ] Haz logout
- [ ] ✅ Redirige a MaintenancePage
- [ ] ✅ No puedes ver contenido del sitio
- [ ] ✅ Ves el mismo diseño de mantenimiento

### Prueba 5: Cambio Dinámico (si usas Supabase)

Si configuraste con tabla `site_config`:

- [ ] Abre SQL Editor en Supabase
- [ ] `UPDATE site_config SET maintenance_mode = true WHERE id = 1`
- [ ] Sin redeploy, abre navegación privada
- [ ] ⏳ Espera máximo 30 segundos
- [ ] ✅ Ves MaintenancePage (se actualizó sin redeploy)
- [ ] `UPDATE site_config SET maintenance_mode = false WHERE id = 1`
- [ ] ⏳ Espera 30 segundos
- [ ] ✅ Ves la página normal nuevamente

### Prueba 6: Loading State

- [ ] Abre DevTools → Network
- [ ] Throttle a "Slow 3G"
- [ ] Recarga la página
- [ ] ✅ Ves spinner azul
- [ ] ✅ Texto "Cargando..."
- [ ] ✅ Desaparece cuando está listo

## Capturas de Pantalla para Documentar

Toma capturas en estos casos:

1. **MaintenancePage (no autenticado)**
   - Nombre: `maintenance-page-guest.png`

2. **Página normal (autenticado)**
   - Nombre: `main-app-authenticated.png`

3. **Responsive en móvil**
   - Nombre: `maintenance-page-mobile.png`

4. **Loading state**
   - Nombre: `loading-state.png`

## Problemas Comunes y Soluciones

### ❌ Problema: No veo MaintenancePage aunque está configurado

**Solución:**
1. ¿Tienes sesión abierta? → Abre navegación privada
2. ¿Está `VITE_MAINTENANCE_MODE=true`? → Verifica `.env`
3. ¿Hiciste redeploy? → Redeploy es necesario para cambios en `.env`

### ❌ Problema: El logo no carga

**Solución:**
1. Verifica conexión a internet
2. Verifica que la URL del logo sea accesible
3. Cambia a un logo local en `public/`

### ❌ Problema: Los colores se ven diferente

**Solución:**
1. Verifica que TailwindCSS esté compilado (`pnpm build:client`)
2. Limpia cache del navegador (Ctrl+Shift+Del)
3. Verifica que `dark` class esté en el elemento raíz

### ❌ Problema: El spinner no rota

**Solución:**
1. Verifica que TailwindCSS animations esté habilitado
2. Revisa la consola por errores CSS
3. Recarga la página sin cache

## Validación Final

Antes de hacer deploy a producción:

```
✓ Modo desactivado → Todos ven el sitio
✓ Modo activado sin sesión → MaintenancePage
✓ Modo activado con sesión → Acceso normal
✓ Logout en mantenimiento → MaintenancePage
✓ Responsive en móvil → ✓
✓ Responsive en tablet → ✓
✓ Responsive en desktop → ✓
✓ Build sin errores → ✓
✓ Animaciones funcionan → ✓
✓ Colores correctos → ✓
```

**Listo para producción ✅**
