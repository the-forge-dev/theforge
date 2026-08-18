# 🔐 Lógica de Mantenimiento - Actualizada

## Cambio Realizado

Se actualizó `AppWrapper.tsx` para que el `/admin` **siempre sea accesible**, incluso cuando el modo mantenimiento esté activo y el usuario no esté autenticado.

## Nueva Lógica

```
Si maintenanceMode = true Y user = null:
  ├─ Si ruta = /admin → Permitir (para que pueda iniciar sesión)
  └─ Si ruta ≠ /admin → Mostrar MaintenancePage

Si maintenanceMode = false O user = autenticado:
  └─ Permitir acceso a toda la app
```

## Flujos de Acceso

### 🟢 Mantenimiento DESACTIVADO (normal)

```
Usuario abre sitio
    ↓
Ve página principal normal
    ↓
Puede navegar a todos lados
    ↓
Puede ir a /admin para iniciar sesión
```

### 🔴 Mantenimiento ACTIVADO sin sesión

```
Usuario abre sitio (sin sesión)
    ↓
Intenta ir a /
    ├─ BLOQUEADO → Ve MaintenancePage
    │
Intenta ir a /productos
    ├─ BLOQUEADO → Ve MaintenancePage
    │
Intenta ir a /admin
    ├─ PERMITIDO → Ve formulario de login
    │
Inicia sesión en /admin
    ├─ ÉXITO → Acceso a toda la app
    └─ FALLO → Vuelve a login
```

### 🔐 Mantenimiento ACTIVADO con sesión

```
Usuario abre sitio (CON sesión)
    ↓
Puede ir a / (home)
    ├─ PERMITIDO
    │
Puede ir a /productos
    ├─ PERMITIDO
    │
Puede ir a /admin
    ├─ PERMITIDO
    │
Acceso completo sin restricciones
```

## Tabla Comparativa

| Ruta | Mantenimiento | Sesión | Resultado |
|------|---------------|--------|-----------|
| `/` | OFF | - | ✅ Home normal |
| `/` | ON | No | ❌ MaintenancePage |
| `/` | ON | Sí | ✅ Home normal |
| `/admin` | OFF | - | ✅ Login form |
| `/admin` | ON | No | ✅ Login form |
| `/admin` | ON | Sí | ✅ Panel admin |
| `/productos` | OFF | - | ✅ Productos |
| `/productos` | ON | No | ❌ MaintenancePage |
| `/productos` | ON | Sí | ✅ Productos |

## Casos de Uso

### Caso 1: Mantenimiento sin afectar login

```
1. Admin activa mantenimiento
   → VITE_MAINTENANCE_MODE=true
   
2. Usuario sin sesión intenta entrar
   → /     → MaintenancePage ❌
   → /admin → Login form ✅
   
3. Usuario inicia sesión en /admin
   → ÉXITO → Acceso a todo
```

### Caso 2: Admin gestiona sitio durante mantenimiento

```
1. Modo mantenimiento ACTIVO
   
2. Admin entra a /admin
   → Ve login form ✅
   
3. Admin inicia sesión
   → Acceso a panel completo ✅
   → Puede editar productos
   → Puede cambiar modo mantenimiento
   → Puede usar el carrito
```

### Caso 3: Usuario normal durante mantenimiento

```
1. Modo mantenimiento ACTIVO

2. Usuario intenta entrar a /
   → Ve MaintenancePage 🔧
   
3. Usuario intenta entrar a /admin
   → Ve login form ✅
   
4. Usuario no tiene credenciales
   → No puede entrar
   → Vuelve a ver MaintenancePage en otras rutas
```

## Código Implementado

```typescript
// En AppWrapper.tsx

if (maintenanceMode && !user && location.pathname !== "/admin") {
  return <MaintenancePage />;
}

return <AppLayout />;
```

**Explicación:**
- `maintenanceMode` = modo activo
- `!user` = usuario NO autenticado
- `location.pathname !== "/admin"` = NO es ruta /admin
- Si las 3 condiciones son true → MaintenancePage
- Sino → Sitio normal

## Flujo Técnico

```
AppWrapper.tsx
├── useAuth() → obtiene user
├── useLocation() → obtiene pathname actual
├── config → obtiene maintenanceMode
│
└─ Lógica de decisión:
   ├─ Loading o config sin cargar → Spinner
   ├─ maintenanceMode && !user && pathname !== "/admin"
   │  └─ MaintenancePage
   └─ Resto → AppLayout con routing normal
```

## Cambios en el Código

### Antes
```typescript
if (maintenanceMode && !user) {
  return <MaintenancePage />;
}
```

### Después
```typescript
if (maintenanceMode && !user && location.pathname !== "/admin") {
  return <MaintenancePage />;
}
```

**Diferencia:** Ahora `/admin` es siempre accesible para login.

## Testing

### ✅ Test 1: Login durante mantenimiento

```
1. VITE_MAINTENANCE_MODE=true
2. Abre navegación privada
3. Intenta ir a /
   → Resultado: MaintenancePage ✓
4. Ve URL y cambia a /admin
   → Resultado: Login form ✓
5. Intenta iniciar sesión
   → Resultado: Acceso a admin ✓
```

### ✅ Test 2: Usuario normal bloqueado

```
1. VITE_MAINTENANCE_MODE=true
2. Abre navegación privada
3. Intenta ir a /productos
   → Resultado: MaintenancePage ✓
4. Intenta ir a /faq
   → Resultado: MaintenancePage ✓
5. Intenta ir a /politicas
   → Resultado: MaintenancePage ✓
```

### ✅ Test 3: Admin acceso normal

```
1. VITE_MAINTENANCE_MODE=true
2. Inicia sesión en /admin
3. Ve dashboard admin
   → Resultado: Acceso ✓
4. Va a /
   → Resultado: Home normal ✓
5. Va a /productos
   → Resultado: Productos visibles ✓
```

## Ventajas

✅ Admin siempre puede iniciar sesión
✅ Usuarios no autenticados bloqueados en otras rutas
✅ Mantiene seguridad del sistema
✅ Permite gestionar sitio durante mantenimiento
✅ No interfiere con flujo de login

## Flujo Resumido

```
┌─ ¿User autenticado?
│  ├─ SÍ → App normal (acceso completo)
│  └─ NO → ¿Ruta /admin?
│      ├─ SÍ → Login form
│      └─ NO → ¿Mantenimiento activo?
│          ├─ SÍ → MaintenancePage
│          └─ NO → App normal
```

---

**Lógica actualizada ✅**
Admin siempre puede entrar a /admin para iniciar sesión.
