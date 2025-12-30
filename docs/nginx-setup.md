# Configuración de Nginx para Condominio OS

Sí, **absolutamente debes crear un archivo separado**. Es la mejor práctica para mantener tus sitios ordenados y evitar romper la configuración de "nodos" si cometes un error en el nuevo sistema.

Sigue estos pasos en tu servidor:

## 1. Crear el archivo de configuración

Crea un nuevo archivo en `sites-available`:

```bash
sudo nano /etc/nginx/sites-available/condominioos
```

## 2. Pegar la configuración

Pega el siguiente contenido. **IMPORTANTE:** Cambia `tu-nuevo-dominio.com` por el dominio o subdominio real que usarás para este sistema (ej. `app.tu-dominio.com` o `condominio.nodos-erp.online`).

```nginx
server {
    listen 80;
    server_name tu-nuevo-dominio.com www.tu-nuevo-dominio.com; # <--- CAMBIA ESTO

    location / {
        proxy_pass http://localhost:3000; # Puerto donde corre Condominio OS
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 3. Activar el sitio

Crea un enlace simbólico para habilitarlo:

```bash
sudo ln -s /etc/nginx/sites-available/condominioos /etc/nginx/sites-enabled/
```

## 4. Verificar y Reiniciar

1.  Verifica que no haya errores de sintaxis:
    ```bash
    sudo nginx -t
    ```
    *(Si dice "syntax is ok", procede. Si falla, revisa el archivo).*

2.  Reinicia Nginx:
    ```bash
    sudo systemctl restart nginx
    ```

## 5. (Opcional) Instalar SSL con Certbot

Si ya tienes tu dominio apuntando al servidor, asegúralo con HTTPS:

```bash
sudo certbot --nginx -d tu-nuevo-dominio.com
```
