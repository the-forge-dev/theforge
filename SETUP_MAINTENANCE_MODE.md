# Guía de Activación - Modo Mantenimiento

## Resumen

El sistema de modo mantenimiento está completamente implementado. Los usuarios no autenticados verán una página de mantenimiento mientras que los administradores autenticados podrán acceder normalmente al sitio.

## ¿Cómo funciona?

```
1. Usuario abre el sitio
2. AppWrapper verifica: ¿Tiene sesión válida de Supabase?
3. ¿maintenanceMode = true?
   ├─ SÍ y sin sesión → MaintenancePage ✓
   ├─ SÍ pero con sesión → App normal ✓
   └─ NO → App normal (todos ven el sitio) ✓
```

## Activación Rápida

### Opción 1: Variable de Ambiente (RECOMENDADO)

1. Abre `.env`:
```
VITE_MAINTENANCE_MODE=true
```

2. Redeploy/reinicia dev server
3. Abre el sitio en navegación privada → verás MaintenancePage
4. Inicia sesión como admin → acceso normal

**Ventaja**: No necesitas modificar código
**Desventaja**: Requiere redeploy para cambiar

### Opción 2: Configuración Estática

Edita `client/lib/config.ts`:
```typescript
export const config = {
  maintenanceMode: true, // Cambia aquí
};
```

### Opción 3: Base de Datos (Mejor para Producción)

1. **Crea la tabla en Supabase:**

```sql
CREATE TABLE site_config (
  id BIGINT PRIMARY KEY,
  maintenance_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_config (id, maintenance_mode) VALUES (1, false);
```

2. **El código ya está preparado para esto.**
   - `AppWrapper.tsx` carga automáticamente de Supabase
   - Verifica cada 30 segundos
   - **NO requiere redeploy**

3. **Para activar mantenimiento:**
   ```sql
   UPDATE site_config SET maintenance_mode = true, updated_at = NOW() WHERE id = 1;
   ```

4. **Para desactivar:**
   ```sql
   UPDATE site_config SET maintenance_mode = false, updated_at = NOW() WHERE id = 1;
   ```

## Archivos Modificados/Creados

✅ **Creados:**
- `client/components/MaintenancePage.tsx` - Página de mantenimiento
- `client/components/AppWrapper.tsx` - Lógica de sesión + mantenimiento
- `client/components/AppLayout.tsx` - Layout principal con routes
- `client/lib/config.ts` - Configuración global
- `client/lib/MAINTENANCE_MODE.md` - Documentación técnica

✏️ **Modificados:**
- `client/App.tsx` - Ahora usa AppWrapper

## Comportamiento Esperado

### ✅ Sin autenticación + modo activo
- Ve página de mantenimiento
- No puede acceder a `/productos`, `/admin`, etc.
- Ver logo de THE FORGE
- Mensaje: "Estamos realizando mejoras"

### ✅ Con autenticación + modo activo
- Acceso normal a todas las rutas
- Puede ir a `/admin`, `/productos`, etc.
- Sistema de carrito funciona
- Todas las funcionalidades disponibles

### ✅ Cierre de sesión durante mantenimiento
- Auto-redirige a MaintenancePage
- No ve el contenido del sitio

### ✅ Modo desactivado
- Todos ven el sitio normalmente
- Independientemente de autenticación

## Testing

### Test 1: Verificar que funciona sin mode
```bash
# En client/lib/config.ts
VITE_MAINTENANCE_MODE=false (o no definido)

# Resultado: Sitio visible para todos
```

### Test 2: Verificar que funciona con mode
```bash
# En client/lib/config.ts
VITE_MAINTENANCE_MODE=true

# Resultado esperado:
# - Navegación privada: MaintenancePage
# - Con sesión: Acceso normal
```

### Test 3: Verificar logout redirige
```bash
# Con VITE_MAINTENANCE_MODE=true
1. Inicia sesión en /admin
2. Haz logout
3. Deberías ir a MaintenancePage automáticamente
```

## Personalización de MaintenancePage

Edita `client/components/MaintenancePage.tsx` para cambiar:
- Colores (Tailwind classes)
- Textos ("Estamos realizando mejoras")
- Logo
- Animaciones
- Fondo

Todos los cambios se reflejan en tiempo real.

## Preguntas Frecuentes

**P: ¿Pierdo datos si activo el modo?**
R: No, todos los datos en Supabase se mantienen intactos.

**P: ¿Los clientes que ya tienen el sitio abierto qué ven?**
R: Verán MaintenancePage cuando recarguen o intenten navegar.

**P: ¿Puedo ver MaintenancePage desde el admin?**
R: No, si tienes sesión activa no la verás aunque esté activado.

**P: ¿Cómo desactivo rápidamente el modo?**
R: Cambia `VITE_MAINTENANCE_MODE=false` en `.env` y redeploy.

## Próximos pasos

1. Elige tu método de activación (env var, Supabase, código)
2. Configura según tu elección
3. Redeploy
4. Prueba en navegación privada
5. Prueba con sesión autenticada
