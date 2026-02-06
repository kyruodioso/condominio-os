# Especificaciones del Sistema Condominio OS

Este documento detalla los roles, permisos y módulos funcionales del sistema, basado en la arquitectura actual y los modelos de datos.

## 1. Roles y Permisos de Usuarios

El sistema maneja cuatro niveles de acceso principales definidos en el modelo de usuario.

### **SUPER_ADMIN**
- **Alcance**: Global (todo el sistema).
- **Permisos**:
  - Gestión de múltiples condominios.
  - Creación y gestión de usuarios Administradores.
  - Acceso irrestricto a todas las configuraciones del sistema.
  - No requiere estar vinculado a un `condominiumId`.

### **ADMIN (Administrador de Consorcio)**
- **Alcance**: Limitado a su Condominio asignado.
- **Permisos**:
  - **Gestión de Residentes**: Crear y gestionar usuarios (Propietarios/Inquilinos) y Unidades.
  - **Comunicación**: Publicar anuncios y enviar/responder mensajes a las unidades.
  - **Mantenimiento**: Crear tareas de mantenimiento y gestionar reportes de incidentes.
  - **Paquetería**: Registrar recepción y entrega de paquetes.
  - **Proveedores y Servicios**: Configurar proveedores, productos y eventos de servicio.
  - **Configuración**: Definir horarios laborales y mensajes de autorespuesta.

### **OWNER (Propietario) / TENANT (Inquilino)**
- **Alcance**: Limitado a su Unidad funcional.
- **Permisos**:
  - **Dashboard**: Vista general de anuncios, estado de cuenta (si aplica) y alertas.
  - **Reportes**: Crear reportes de incidencias en su unidad o áreas comunes.
  - **Reservas**: Reservar amenities (SUM, Parrilla, etc.).
  - **Mensajería**: Enviar mensajes a la administración.
  - **Pedidos**: Realizar pedidos a proveedores configurados (ej. agua, soda).
  - **Paquetería**: Visualizar paquetes recibidos pendientes de retiro.
  - **Servicios**: Solicitar participación en eventos de servicio especiales.

---

## 2. Módulos y Especificaciones

### **A. Módulo de Usuarios y Unidades**
Gestiona la estructura física y humana del condominio.
- **Entidades**: `User`, `Unit`, `Condominium`.
- **Funcionalidad**:
  - Registro de unidades funcionales (Ej: 1A, 4B) con identificadores únicos.
  - Asignación de usuarios a unidades.
  - Perfiles de usuario con nombre, teléfono y avatar.

### **B. Módulo de Mantenimiento y Reportes**
Centraliza la gestión de tareas preventivas y correctivas.
- **Entidades**: `MaintenanceTask`, `Report`.
- **Flujo de Trabajo**:
  1. **Reportes**: Los residentes crean reportes (título, descripción, prioridad).
  2. **Tareas**: El administrador crea tareas de mantenimiento (estado, prioridad, asignación y fechas).
  3. **Resolución**: Los reportes pueden vincularse a tareas de mantenimiento para su seguimiento y cierre.
- **Estados**: Pendiente, En Progreso, Finalizada/Resuelto.

### **C. Módulo de Amenities y Reservas**
Permite la gestión de espacios comunes.
- **Entidad**: `Reservation`.
- **Recursos**: SUM, Parrilla (extensible).
- **Funcionalidad**:
  - Validación de disponibilidad por fecha y hora (evita solapamientos).
  - Registro de quién reserva y para qué unidad.

### **D. Módulo de Comunicación**
Facilita el flujo de información entre administración y residentes.
- **Entidades**: `Message`, `Announcement`, `Settings`.
- **Mensajería Directa**:
  - Chat entre Unidad y Administración (Admin <-> User).
  - Soporte para mensajes de texto y audio.
  - Estados de lectura ("Visto").
  - Configuración de horarios laborales y autorespuestas para el Admin.
- **Anuncios**:
  - Cartelera digital para comunicados masivos (Info o Alerta).
  - Fecha de expiración para limpiar anuncios antiguos automáticamente.

### **E. Módulo de Paquetería**
Control de recepción de correspondencia y paquetes.
- **Entidad**: `Package`.
- **Funcionalidad**:
  - Registro de paquetes entrantes para una unidad específica.
  - Registro de nombre del destinatario.
  - Marcado de "Retirado" (isPickedUp) cuando el residente lo busca.

### **F. Módulo de Proveedores y Pedidos**
Gestión de compras recurrentes de insumos para las unidades.
- **Entidades**: `Provider`, `SupplierOrder`.
- **Funcionalidad**:
  - **Proveedores**: Alta de proveedores (ej. Ivess, Cimes) y sus productos/precios.
  - **Pedidos**: Los residentes generan pedidos (ej. "2 bidones de agua").
  - **Estado**: Control de estado del pedido (Pendiente, Entregado).

### **G. Módulo de Servicios Especiales**
Gestión de servicios puntuales o eventos contratados.
- **Entidades**: `ServiceEvent`, `ServiceRequest`.
- **Funcionalidad**:
  - El Admin crea un "Evento" (ej. "Limpieza de Tanques" o "Compra comunitaria").
  - Define fecha límite y precio.
  - Los residentes envían solicitudes (`ServiceRequest`) para unirse al evento.
  - Control de cantidades y notas adicionales.

---

## Resumen Técnico de Modelos de Datos

| Modelo | Descripción | Relaciones Clave |
| :--- | :--- | :--- |
| **User** | Usuarios del sistema | `Condominium`, `Unit` (si es residente) |
| **Condominium** | Entidad principal (Edificio/Barrio) | `Admin` (User) |
| **Unit** | Unidad funcional (Depto/Casa) | `Condominium` |
| **MaintenanceTask** | Tarea administrativa | `Condominium` |
| **Report** | Reclamo de usuario | `User` (creador), `Unit`, `MaintenanceTask` (opcional) |
| **Reservation** | Reserva de espacio común | `Unit`, `Condominium` |
| **Message** | Mensaje de chat | `Unit` (contexto de la charla), `User` (sender) |
| **Announcement** | Comunicado general | `Condominium` |
| **Package** | Paquete recibido | `Condominium`, Unidad (string) |
| **SupplierOrder** | Pedido a proveedor | `Unit`, `Condominium` |
| **Provider** | Proveedor de servicios/productos | `Condominium`, lista de productos |
| **ServiceEvent** | Evento disponible para contratar | `Condominium` |
| **ServiceRequest** | Solicitud de usuario a un evento | `ServiceEvent`, `Unit`, `User` |
