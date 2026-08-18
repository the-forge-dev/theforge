# 🛠️ Sistema de Modo Mantenimiento

## Descripción General

Sistema completo de mantenimiento que permite:
- ✅ Bloquear acceso a usuarios no autenticados
- ✅ Permitir que administradores usen el sitio normalmente
- ✅ Mostrar página profesional de mantenimiento
- ✅ Configuración flexible y dinámica

---

## 🎯 Objetivo Logrado

```
✅ Cuando maintenanceMode = true:
   - Usuarios sin sesión → ven MaintenancePage
   - Usuarios con sesión → acceso normal a todo
   
✅ Cuando maintenanceMode = false:
   - Todos ven el sitio normalmente
```

---

## 📦 Componentes Implementados

### 1️⃣ **MaintenancePage.tsx**
Página de mantenimiento profesional:
- Logo de THE FORGE
- Título: "Estamos realizando mejoras"
- Descripción informativa
- Diseño responsive y moderno
- Animaciones sutiles
- Fondo con gradientes

### 2️⃣ **AppWrapper.tsx**
Lógica centralizada:
- Verifica sesión de Supabase
- Carga configuración de mantenimiento
- Renderiza MaintenancePage o App según corresponda
- Loading state profesional
- Verifica cada 30 segundos cambios

### 3️⃣ **AppLayout.tsx**
Layout con todos los routes:
- Index (home)
- /productos
- /admin
- /politicas
- /faq
- Manejo de 404

### 4️⃣ **config.ts**
Configuración global:
- Soporta env vars
- Soporta Supabase
- Soporta configuración directa

---

## 🚀 Uso

### Activar Mantenimiento

**Opción A: Variable de Ambiente** (Recomendado)
```bash
# .env
VITE_MAINTENANCE_MODE=true
```

**Opción B: Supabase** (Sin redeploy)
```sql
-- SQL en Supabase
CREATE TABLE site_config (
  id BIGINT PRIMARY KEY,
  maintenance_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_config (id, maintenance_mode) VALUES (1, false);

-- Para activar:
UPDATE site_config SET maintenance_mode = true WHERE id = 1;
```

**Opción C: Configuración Directa**
```typescript
// client/lib/config.ts
export const config = {
  maintenanceMode: true,
};
```

### Desactivar Mantenimiento

Cambia el método que usaste:
- Env var: `VITE_MAINTENANCE_MODE=false`
- Supabase: `UPDATE site_config SET maintenance_mode = false WHERE id = 1;`
- Config: `maintenanceMode: false`

---

## 🧬 Arquitectura

```
App.tsx
├── QueryClientProvider
├── CartProvider
├── BrowserRouter
│   └── AppWrapper
│       ├── useAuth() → Verifica sesión
│       ├── loadMaintenanceMode() → Carga config
│       ├── Si bloqueado → MaintenancePage
│       └── Si acceso → AppLayout
│           └── Routes
│               ├── Index
│               ├── AllProducts
│               ├── Admin
│               └── ...
```

---

## 🔐 Flujo de Seguridad

```
Usuario abre app
        ↓
AppWrapper verifica:
1. ¿Existe sesión válida en Supabase?
2. ¿maintenanceMode está activo?
        ↓
    ┌─────────────────┐
    │   Sesión?       │
    │                 │
YES │       NO        │
│   │                 │
├─→ ├─→ MaintenanceMode?
│   │    │
│   │    ├─ SÍ → MaintenancePage
│   │    └─ NO → App normal
│   │
│   └─→ App normal (acceso completo)
│
└──────────────────────────────
```

---

## 📋 Checklist de Funcionalidades

### ✅ Autenticación
- [x] Verifica sesión de Supabase
- [x] Respeta token de autenticación
- [x] Mantiene sesión activa

### ✅ Mantenimiento
- [x] Bloquea usuarios no autenticados
- [x] Permite usuarios autenticados
- [x] Redirige al logout
- [x] Página profesional

### ✅ Configuración
- [x] Soporta env vars
- [x] Soporta Supabase
- [x] Soporta configuración estática
- [x] Verifica cada 30 segundos

### ✅ UI/UX
- [x] Responsive (móvil, tablet, desktop)
- [x] Logo visible
- [x] Título descriptivo
- [x] Animaciones suaves
- [x] Colores profesionales
- [x] Loading state

### ✅ Routing
- [x] Protección en todas las rutas
- [x] Redireccionamiento correcto
- [x] Sin errores de navegación

---

## 📊 Testing Matriz

| Escenario | maintenanceMode | Sesión | Resultado | Estado |
|-----------|-----------------|--------|-----------|--------|
| Normal | false | - | App visible | ✅ |
| Mantenimiento | true | No | MaintenancePage | ✅ |
| Mantenimiento | true | Sí | App visible | ✅ |
| Logout en mantenimiento | true | Sí→No | MaintenancePage | ✅ |
| Reactiva sin redeploy | Supabase | - | Se actualiza en 30s | ✅ |

---

## 🎨 Personalización

### Cambiar Textos
Edita `MaintenancePage.tsx`:
```typescript
<h1 className="text-4xl...">
  Tu mensaje personalizado
</h1>
```

### Cambiar Logo
```typescript
<img
  src="tu-logo-url"
  alt="Tu marca"
/>
```

### Cambiar Colores
```typescript
className="bg-gradient-to-br from-blue-500 to-purple-600"
// Cambiar colores aquí
```

### Cambiar Animaciones
```typescript
className="animate-pulse"
// Cambiar a: animate-spin, animate-bounce, etc.
```

---

## 📚 Documentación

| Archivo | Contenido |
|---------|----------|
| `QUICK_START.md` | Activación rápida (30 segundos) |
| `SETUP_MAINTENANCE_MODE.md` | Guía detallada de configuración |
| `IMPLEMENTATION_SUMMARY.md` | Detalles técnicos completos |
| `VISUAL_TESTING.md` | Cómo testear cada escenario |
| `client/lib/MAINTENANCE_MODE.md` | Documentación técnica |

---

## 🚨 Consideraciones Importantes

- ✅ **Datos seguros**: Supabase mantiene todos los datos intactos
- ✅ **Sesión segura**: Usa JWT de Supabase
- ✅ **Sin downtime**: La app sigue funcionando en segundo plano
- ✅ **Sin pérdida de datos**: El carrito se mantiene en contexto
- ✅ **Reversible**: Se desactiva en segundos
- ✅ **Escalable**: Funciona con cualquier número de usuarios

---

## 🆘 Solución de Problemas

### P: ¿Cómo fuerzo a ver MaintenancePage?
**R:** Abre navegación privada (Ctrl+Shift+P) para eliminar sesión.

### P: ¿Cómo cambio el texto de mantenimiento?
**R:** Edita `client/components/MaintenancePage.tsx`

### P: ¿Puedo cargar desde Supabase?
**R:** Sí, con la tabla `site_config`. La app lo soporta automáticamente.

### P: ¿Cuánto tarda en actualizarse desde Supabase?
**R:** Máximo 30 segundos.

### P: ¿Qué pasa con el carrito?
**R:** Se mantiene en estado local, pero el usuario no puede comprar sin sesión.

### P: ¿Funciona en producción?
**R:** Sí, completamente. Está listo para deploy.

---

## 🎯 Casos de Uso

### 1. Mantenimiento Planificado
```
Cambio en BD:
UPDATE site_config SET maintenance_mode = true

Usuarios sin sesión ven MaintenancePage
Admins siguen trabajando normalmente
Sin necesidad de redeploy
```

### 2. Emergencia / Hotfix
```
Activa mantenimiento rápidamente
Bloquea nuevas órdenes
Protege datos sensibles
Admins siguen teniendo acceso
```

### 3. Beta / Testing
```
Permite que testers accedan con sesión
Bloquea acceso público
Prueba nueva funcionalidad
Datos protegidos
```

---

## ✨ Beneficios

✅ **Centralizado**: Toda la lógica en `AppWrapper.tsx`
✅ **Seguro**: Verifica Supabase antes de renderizar
✅ **Flexible**: 3 métodos de configuración
✅ **Dinámico**: Puede cambiar sin redeploy (Supabase)
✅ **Profesional**: Diseño moderno y responsivo
✅ **Mantenible**: Código limpio y bien documentado
✅ **Rápido**: Cero overhead en usuarios autenticados
✅ **Confiable**: Test-ready, listo para producción

---

## 🚀 Próximos Pasos

1. **Activar**: Sigue `QUICK_START.md`
2. **Testear**: Usa `VISUAL_TESTING.md`
3. **Personalizar**: Edita `MaintenancePage.tsx` si quieres
4. **Deploy**: Redeploy a producción
5. **Monitorear**: Verifica con usuarios

---

**Estado: ✅ Listo para producción**

Implementado: 23 de Junio de 2025
