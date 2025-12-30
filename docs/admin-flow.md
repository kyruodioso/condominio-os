# Flujo de Autenticación y Redirección para Administradores

## 📋 Cambios Implementados

### 1. **Redirección Post-Login según Rol**

Ahora el sistema redirige automáticamente a los usuarios según su rol después del inicio de sesión:

- **SUPER_ADMIN** → `/admin/super`
- **ADMIN** → `/admin`
- **OWNER/TENANT** → `/` (Dashboard principal)

#### Archivo Modificado
- `/src/app/login/page.tsx`

```typescript
// Fetch session to determine redirect
const sessionRes = await fetch('/api/auth/session');
const session = await sessionRes.json();

// Redirect based on role
if (session?.user?.role === 'SUPER_ADMIN') {
    router.push('/admin/super');
} else if (session?.user?.role === 'ADMIN') {
    router.push('/admin');
} else {
    router.push('/');
}
```

---

### 2. **Página Inicial de Administrador de Condominio**

La ruta `/admin` es ahora la vista inicial para los **Administradores de Condominio** (rol `ADMIN`).

#### Características
- ✅ Protección de ruta (solo accesible para rol `ADMIN`)
- ✅ Verificación de sesión con `useSession()`
- ✅ Estados de carga durante la autenticación
- ✅ Redirección automática si no está autorizado

#### Archivo Modificado
- `/src/app/admin/page.tsx`

---

### 3. **Botón de Acceso a Gestión de Condominio**

Se agregó un botón en `/admin` que permite acceder a `/admin/condo` donde está el dashboard específico del condominio.

#### Ubicación
En la barra de pestañas, junto a los botones de:
- 📦 Paquetería
- 📢 Cartelera  
- 👥 Unidades
- 📅 Reservas SUM
- 🔨 Mantenimiento
- 🚚 Pedidos
- ⚠️ Reportes
- **🏢 Gestión Condominio** ← NUEVO

#### Código
```tsx
<Link href="/admin/condo" className="flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold uppercase tracking-wide text-sm w-full md:w-auto bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-black border border-blue-500/20">
    <Users size={20} />
    Gestión Condominio
</Link>
```

---

### 4. **SessionProvider Global**

Se agregó `SessionProvider` de NextAuth para habilitar `useSession()` en componentes cliente.

#### Archivos Nuevos
- `/src/components/ClientLayout.tsx` - Wrapper del SessionProvider

#### Archivos Modificados
- `/src/app/layout.tsx` - Integración de ClientLayout

```tsx
<ClientLayout>
  <main className="min-h-screen relative z-10">
    {children}
  </main>
  {/* Background effects */}
</ClientLayout>
```

---

## 🔐 Seguridad

### Protección de Rutas
La página `/admin` ahora verifica:

1. **Estado de autenticación**: Si el usuario no está autenticado → `/login`
2. **Rol correcto**: Si el usuario no es `ADMIN` → `/login`
3. **Estado de carga**: Muestra spinner mientras verifica la sesión

```typescript
useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || (session && session.user?.role !== 'ADMIN')) {
        router.push('/login');
    }
}, [status, session, router]);
```

---

## 🎯 Flujo de Usuario Administrador

1. **Login** en `/login` con credenciales de ADMIN
2. **Redirección automática** a `/admin`
3. **Vista inicial**: Panel Maestro con acceso rápido a:
   - Operaciones diarias (Paquetería, Cartelera, Unidades, Reservas)
   - Módulos especializados (Mantenimiento, Pedidos, Reportes)
   - **Gestión Condominio** (nuevo)
4. Click en **"Gestión Condominio"** → `/admin/condo`
5. **Dashboard del condominio** con:
   - Gestionar Usuarios
   - Publicar Anuncios
   - Estadísticas del condominio

---

## 📂 Archivos Afectados

### Modificados
- ✏️ `/src/app/login/page.tsx` - Lógica de redirección
- ✏️ `/src/app/admin/page.tsx` - Protección + botón nuevo
- ✏️ `/src/app/layout.tsx` - SessionProvider

### Nuevos
- ✨ `/src/components/ClientLayout.tsx` - Wrapper de sesión

---

## ✅ Pruebas

Para probar el nuevo flujo:

1. **Iniciar sesión como ADMIN**:
   - Crear un admin desde el Super Admin o usar uno existente
   - Email: `admin@condominio.com`
   - Password: `123456` (default)

2. **Verificar redirección**:
   - Debería redirigir a `/admin` automáticamente

3. **Verificar botón**:
   - En `/admin`, buscar el botón **"Gestión Condominio"** (azul)
   - Click debería llevar a `/admin/condo`

4. **Verificar protección**:
   - Cerrar sesión y tratar de acceder a `/admin`
   - Debería redirigir a `/login`

---

## 🚀 Próximos Pasos (Sugerencias)

- [ ] Agregar breadcrumbs para navegación
- [ ] Implementar menú lateral persistente
- [ ] Agregar atajos de teclado para navegación rápida
- [ ] Dashboard personalizable con widgets
