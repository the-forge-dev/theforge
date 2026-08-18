# Sistema de Modo Mantenimiento

## Descripción

El sistema de modo mantenimiento permite que los administradores autenticados en Supabase continúen usando el sitio normalmente, mientras que los visitantes no autenticados ven una página de mantenimiento profesional.

## Activar Modo Mantenimiento

### Opción 1: Configuración Global (más simple)

Edita el archivo `client/lib/config.ts`:

```typescript
export const config = {
  maintenanceMode: true, // Cambiar a true para activar
};
```

### Opción 2: Variable de Ambiente

Agrega a tu archivo `.env`:

```
VITE_MAINTENANCE_MODE=true
```

Luego actualiza `client/lib/config.ts`:

```typescript
export const config = {
  maintenanceMode: import.meta.env.VITE_MAINTENANCE_MODE === 'true',
};
```

### Opción 3: Cargar desde Supabase (Recomendado)

Para cargar dinámicamente desde Supabase sin necesidad de redeploy:

1. Crea una tabla `site_config` en Supabase:

```sql
CREATE TABLE site_config (
  id BIGINT PRIMARY KEY,
  maintenance_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserta la fila inicial
INSERT INTO site_config (id, maintenance_mode) VALUES (1, false);
```

2. Actualiza `client/lib/config.ts`:

```typescript
import { supabase } from "./supabase";

export const config = {
  maintenanceMode: false,
};

export async function loadMaintenanceMode(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("site_config")
      .select("maintenance_mode")
      .eq("id", 1)
      .single();

    if (!error && data) {
      config.maintenanceMode = data.maintenance_mode;
    }
  } catch (err) {
    console.error("Error loading maintenance mode:", err);
  }
}
```

3. Llama `loadMaintenanceMode()` en `AppWrapper.tsx`:

```typescript
useEffect(() => {
  loadMaintenanceMode();
}, []);
```

## ¿Cómo funciona?

1. **Verificación de Sesión**: Al cargar la app, se verifica si el usuario tiene una sesión válida de Supabase
2. **Decisión**: Si `maintenanceMode = true` y no hay usuario autenticado → muestra `MaintenancePage`
3. **Acceso Normal**: Los usuarios autenticados acceden a todas las rutas normalmente
4. **Redirección**: Si el usuario cierra sesión mientras está activo el modo mantenimiento, es redirigido automáticamente

## Componentes Creados

- **MaintenancePage.tsx**: Página de mantenimiento con diseño profesional y responsivo
- **AppWrapper.tsx**: Lógica centralizada de sesión y mantenimiento
- **AppLayout.tsx**: Layout con todos los routes
- **config.ts**: Configuración global

## Flujo de la Aplicación

```
App.tsx
  ├── CartProvider
  ├── QueryClientProvider
  └── BrowserRouter
      └── AppWrapper (verifica sesión + mantenimiento)
          ├── Si maintenanceMode && !user → MaintenancePage
          └── Si autenticado o mode desactivado → AppLayout
              └── Routes (Index, Products, Admin, etc.)
```

## Testing

### Probar con Modo Mantenimiento Activado

1. Abre la app en navegación privada (sin sesión)
2. Deberías ver la página de mantenimiento
3. Inicia sesión como admin
4. Ahora tendrás acceso al sitio completo

### Probar con Cierre de Sesión

1. Con modo mantenimiento activado
2. Inicia sesión y accede al admin
3. Haz logout
4. Serás redirigido a la página de mantenimiento automáticamente

## Personalización

La página de mantenimiento está en `MaintenancePage.tsx`. Puedes personalizar:
- Colores y gradientes (Tailwind classes)
- Textos
- Logo
- Animaciones
