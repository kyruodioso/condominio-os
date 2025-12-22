# GymHub Local

Aplicación Web Progresiva (PWA) diseñada para correr en una Raspberry Pi en red local.

## Stack Tecnológico
- **Framework**: Next.js 14 (App Router)
- **Estilos**: Tailwind CSS
- **Estado**: Zustand + LocalStorage
- **Iconos**: Lucide React

## Instalación en Raspberry Pi

### Prerrequisitos
Asegúrate de tener Node.js instalado (versión 18 o superior).
```bash
node -v
# Debería mostrar v18.x.x o superior
```

### Pasos
1. Copia los archivos del proyecto a la Raspberry Pi.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Construye la aplicación para producción:
   ```bash
   npm run build
   ```
4. Inicia el servidor:
   ```bash
   npm start
   ```

La aplicación estará disponible en `http://localhost:3000` (o la IP de la Raspberry Pi en el puerto 3000).

### Ejecución en Segundo Plano (Recomendado)
Para mantener la app corriendo aunque cierres la terminal, usa PM2:

1. Instala PM2 globalmente:
   ```bash
   sudo npm install -g pm2
   ```
2. Inicia la app:
   ```bash
   pm2 start npm --name "gymhub" -- start
   ```
3. Configura PM2 para que inicie con el sistema:
   ```bash
   pm2 startup
   pm2 save
   ```

## Características
- **Perfil de Usuario**: Cálculo de IMC y estado físico.
- **Rutina Diaria (WOD)**: Generada automáticamente cada día (misma para todos los usuarios).
- **Nutrición**: Sugerencias de recetas basadas en el objetivo del usuario.
- **Música**: Playlist de Spotify integrada.
- **Offline First**: Los datos del usuario se guardan en el navegador.
