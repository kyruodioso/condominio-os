# Documentación de la Plataforma Condominio OS

## 1. Visión General
**Condominio OS** es una plataforma SaaS (Software as a Service) multi-inquilino diseñada para la gestión integral de condominios y edificios residenciales. Permite a múltiples condominios operar de forma independiente dentro de una misma infraestructura, garantizando la privacidad y seguridad de los datos.

## 2. Roles de Usuario y Jerarquía
El sistema cuenta con cuatro niveles de acceso, cada uno con permisos específicos:

### 👑 Super Admin
*   **Alcance**: Global (Toda la plataforma).
*   **Responsabilidades**:
    *   Crear y gestionar Condominios.
    *   Crear Administradores de Condominio.
    *   Ver estadísticas globales de la plataforma.
*   **Acceso**: `/admin/super`

### 🛡️ Admin de Condominio
*   **Alcance**: Local (Su condominio específico).
*   **Responsabilidades**:
    *   Gestionar Unidades (Departamentos).
    *   Gestionar Residentes (Propietarios e Inquilinos).
    *   Publicar Anuncios y Noticias.
    *   Gestionar Paquetería y Mantenimiento.
*   **Acceso**: `/admin/condo`

### 🏠 Propietario (Owner)
*   **Alcance**: Personal (Su unidad y áreas comunes).
*   **Capacidades**:
    *   Ver anuncios del edificio.
    *   Recibir notificaciones de paquetería.
    *   Reservar áreas comunes (SUM, Gimnasio).
    *   Generar reportes de mantenimiento.
*   **Acceso**: `/` (Dashboard Principal)

### 👤 Inquilino (Tenant)
*   **Alcance**: Personal (Similar al Propietario, con restricciones configurables).
*   **Capacidades**:
    *   Ver anuncios.
    *   Recibir paquetería.
    *   Reservar áreas comunes.
*   **Acceso**: `/` (Dashboard Principal)

---

## 3. Flujos de Trabajo Principales

### A. Gestión de Condominios (Super Admin)
1.  **Crear Condominio**:
    *   Ir al Dashboard de Super Admin.
    *   Click en "Nuevo Condominio".
    *   Ingresar Nombre, Dirección y Plan (Free, Pro, Enterprise).
2.  **Asignar Administrador**:
    *   Seleccionar un condominio de la lista ("Administrar").
    *   En la sección "Administradores", click en "Nuevo Admin".
    *   Ingresar Nombre y Email. El sistema genera una contraseña por defecto.

### B. Configuración del Edificio (Admin de Condominio)
1.  **Crear Unidades**:
    *   Ir a "Gestión de Unidades".
    *   Registrar los departamentos (ej: 1A, 2B) y sus PINs de acceso.
2.  **Registrar Residentes**:
    *   Ir a "Usuarios" -> "Nuevo Usuario".
    *   Ingresar datos del residente y asignar su Unidad y Rol.

### C. Operación Diaria
*   **Paquetería**: El personal de seguridad o administración registra paquetes entrantes dirigidos a una unidad. El residente ve la notificación en su buzón.
*   **Anuncios**: El administrador publica noticias (cortes de agua, reuniones) que aparecen en el carrusel principal de los residentes.

---

## 4. Arquitectura Técnica

### Multi-tenancy (Multi-inquilino)
La plataforma utiliza una arquitectura de **Base de Datos Compartida con Aislamiento Lógico**.
*   **Modelo de Datos**: Todos los registros (Usuarios, Unidades, Paquetes, etc.) tienen un campo `condominiumId`.
*   **Seguridad**: Las consultas a la base de datos siempre filtran por `condominiumId` basado en la sesión del usuario autenticado, asegurando que un condominio nunca vea datos de otro.

### Tecnologías Clave
*   **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide Icons.
*   **Backend**: Server Actions de Next.js.
*   **Base de Datos**: MongoDB (Mongoose ODM).
*   **Autenticación**: NextAuth.js v5 (Sesiones seguras con roles y scope de condominio).

---

## 5. Credenciales de Acceso Iniciales
*   **Super Admin**:
    *   Email: `superadmin@condominioos.com`
    *   Password: `supersecretpassword`
*   **Usuarios Nuevos**:
    *   Password por defecto: `123456` (Se recomienda cambiar al primer inicio de sesión).
