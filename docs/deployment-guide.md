# Guía de Despliegue en Servidor Remoto

Esta guía detalla los pasos para poner en funcionamiento la aplicación **Condominio OS** en un servidor remoto (VPS, EC2, DigitalOcean, etc.) después de haber clonado el repositorio.

## 1. Prerrequisitos

Asegúrate de tener instalado lo siguiente en tu servidor:

*   **Node.js** (Versión 18 o superior recomendada)
*   **npm** (Generalmente viene con Node.js)
*   **Git**

Puedes verificar las versiones con:
```bash
node -v
npm -v
```

## 2. Instalación de Dependencias

Navega a la carpeta del proyecto clonado e instala las dependencias:

```bash
cd condominio-os
npm install
```

## 3. Configuración de Variables de Entorno

Debes crear un archivo `.env.local` en la raíz del proyecto con las variables de configuración. Puedes usar el editor `nano` o `vim`.

```bash
cp .env.example .env.local  # Si tienes un ejemplo, si no, crea uno nuevo
nano .env.local
```

Asegúrate de incluir las siguientes variables críticas (ajusta los valores según tu entorno):

```env
# Conexión a Base de Datos
# OPCIÓN A: MongoDB Atlas (Nube)
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/condominio-os

# OPCIÓN B: MongoDB Local (en el mismo servidor)
# Si no tiene contraseña:
MONGODB_URI=mongodb://127.0.0.1:27017/condominio-os
# Si tiene contraseña configurada:
# MONGODB_URI=mongodb://usuario:password@127.0.0.1:27017/condominio-os?authSource=admin

# URL base de la aplicación (Importante para NextAuth)
# En producción, usa tu dominio real o la IP pública
NEXTAUTH_URL=http://tu-dominio.com 
# O si usas IP: http://123.45.67.89:3000

# Secreto para encriptación de sesiones (Genera uno seguro)
# Puedes generar uno con: openssl rand -base64 32
NEXTAUTH_SECRET=tu_secreto_super_seguro
```

## 4. Construcción del Proyecto (Build)

Next.js necesita compilar el código para producción. Este paso optimiza la aplicación.

```bash
npm run build
```

Si todo sale bien, verás un mensaje de éxito indicando los archivos generados.

## 5. Ejecución en Producción

Para probar que todo funciona, puedes iniciar el servidor manualmente:

```bash
npm start
```

La aplicación debería estar corriendo en el puerto 3000 (por defecto). Puedes acceder vía `http://tu-ip:3000`.

## 6. Mantener la App Activa (PM2)

Para que la aplicación siga corriendo aunque cierres la terminal y se reinicie automáticamente si el servidor se apaga, se recomienda usar **PM2**.

1.  **Instalar PM2 globalmente:**
    ```bash
    sudo npm install -g pm2
    ```

2.  **Iniciar la aplicación con PM2:**
    ```bash
    pm2 start npm --name "condominio-os" -- start
    ```

3.  **Guardar la lista de procesos para que inicien al arrancar el sistema:**
    ```bash
    pm2 save
    pm2 startup
    ```
    (Copia y pega el comando que te muestre `pm2 startup` si es necesario).

## 7. Comandos Útiles de PM2

*   Ver estado: `pm2 status`
*   Ver logs: `pm2 logs condominio-os`
*   Reiniciar: `pm2 restart condominio-os`
*   Detener: `pm2 stop condominio-os`

## 8. (Opcional) Configurar Nginx como Proxy Inverso

Para servir la aplicación en el puerto 80 (HTTP) o 443 (HTTPS) sin poner el puerto :3000 en la URL, configura Nginx.

Ejemplo básico de configuración (`/etc/nginx/sites-available/default`):

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Luego reinicia Nginx: `sudo systemctl restart nginx`.
