# ⚡ Quick Start - Modo Mantenimiento

## ¿Ya está implementado?

✅ **SÍ** - Todo está listo. Solo necesitas activarlo.

## Activar en 30 segundos

### Opción 1: Variable de Ambiente (MÁS RÁPIDO)

1. Abre `.env`
2. Cambia o agrega:
   ```
   VITE_MAINTENANCE_MODE=true
   ```
3. Guarda y redeploy
4. **Listo** ✅ Usuarios sin sesión ven MaintenancePage

### Opción 2: Sin Redeploy (Supabase)

Solo funciona si creaste la tabla en Supabase:

1. Abre SQL Editor en Supabase
2. Pega:
   ```sql
   UPDATE site_config SET maintenance_mode = true WHERE id = 1;
   ```
3. Ejecuta
4. **Listo** ✅ Se activa en máximo 30 segundos (sin redeploy)

**Nota**: Si no existe la tabla, crea una:
```sql
CREATE TABLE site_config (
  id BIGINT PRIMARY KEY,
  maintenance_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_config (id, maintenance_mode) VALUES (1, false);
```

## ¿Cómo desactivar?

### Opción 1:
```
VITE_MAINTENANCE_MODE=false
Redeploy
```

### Opción 2:
```sql
UPDATE site_config SET maintenance_mode = false WHERE id = 1;
```

## ¿Qué pasará?

### 👤 Usuario SIN sesión:
```
Abre el sitio
    ↓
Ve MaintenancePage
    ↓
Logo de THE FORGE
"Estamos realizando mejoras"
No puede acceder a nada
```

### 👨‍💼 Usuario CON sesión (Admin):
```
Abre el sitio
    ↓
Inicia sesión
    ↓
Acceso NORMAL
Puede ver productos, admin, todo
MaintenancePage NO se muestra
```

### 🔌 Si cierra sesión durante mantenimiento:
```
Hace logout
    ↓
Auto-redirige a MaintenancePage
No ve contenido del sitio
```

## Archivos Creados

| Archivo | Descripción |
|---------|------------|
| `client/components/MaintenancePage.tsx` | Página de mantenimiento |
| `client/components/AppWrapper.tsx` | Lógica de sesión + mantenimiento |
| `client/components/AppLayout.tsx` | Routes de la app |
| `client/lib/config.ts` | Configuración |

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `client/App.tsx` | Ahora usa `<AppWrapper />` |

## Documentación Completa

- `SETUP_MAINTENANCE_MODE.md` - Guía detallada
- `IMPLEMENTATION_SUMMARY.md` - Resumen técnico
- `VISUAL_TESTING.md` - Cómo testear
- `client/lib/MAINTENANCE_MODE.md` - Docs técnica

## Testing Rápido

### Verificar que está activado:
```
1. .env → VITE_MAINTENANCE_MODE=true
2. Abre navegación privada (Ctrl+Shift+P)
3. RESULTADO: Ves MaintenancePage ✅
```

### Verificar que funciona con sesión:
```
1. Inicia sesión
2. RESULTADO: Acceso normal al sitio ✅
```

### Verificar que se puede desactivar:
```
1. .env → VITE_MAINTENANCE_MODE=false
2. Redeploy
3. RESULTADO: Todos ven el sitio normal ✅
```

## ¿Preguntas?

Revisa:
1. `SETUP_MAINTENANCE_MODE.md` - Instrucciones detalladas
2. `VISUAL_TESTING.md` - Cómo testear cada escenario
3. `IMPLEMENTATION_SUMMARY.md` - Detalles técnicos

---

**Implementación lista ✅**
Solo actívalo cuando lo necesites.
