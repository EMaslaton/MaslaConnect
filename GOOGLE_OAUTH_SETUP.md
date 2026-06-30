# Configuración de Google Sign-In

## Requisitos Previos

Para que el login con Google funcione, necesitas obtener un **Google Client ID** en Google Cloud Console.

## Pasos para Configurar

### 1. Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto (ej: "MaslaConnect")
3. Espera a que se cree el proyecto

### 2. Habilitar Google+ API

1. En la consola, ve a **APIs & Services** → **Library**
2. Busca "Google+ API"
3. Haz clic en ella y presiona **Habilitar**

### 3. Crear OAuth 2.0 Credentials

1. Ve a **APIs & Services** → **Credentials**
2. Haz clic en **+ Crear credenciales** → **OAuth 2.0 Client ID**
3. Si te pide configurar la pantalla de consentimiento, haz clic en **Crear pantalla de consentimiento**
   - Tipo de usuario: **Externo**
   - Rellena los datos requeridos
4. Selecciona **Aplicación web** como tipo de aplicación
5. En **URIs de origen autorizados**, agrega:
   - `http://localhost:8080` (para desarrollo local)
6. En **URIs de redirección autorizados**, agrega:
   - `http://localhost:8080` (para desarrollo local)
7. Haz clic en **Crear**

### 4. Copiar tu Client ID

1. Copia el **Client ID** que aparece
2. Abre el archivo `.env.local` en la raíz del proyecto
3. Reemplaza `YOUR_GOOGLE_CLIENT_ID_HERE` con tu Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
   ```

### 5. Probar el Login

1. Inicia el desarrollo con `npm run dev`
2. Ve a la página de login
3. Haz clic en el botón "Google"
4. Debería abrirse el diálogo de login de Google
5. Una vez autenticado, deberías ser redirigido al panel

## Troubleshooting

### Errores Comunes

- **"Aplicación no verificada"**: Es normal en desarrollo. Haz clic en "Continuar" o "Advanced" y luego "Ir a localhost"
- **CORS Error**: Asegúrate de que `http://localhost:8080` está en los orígenes autorizados
- **Cliente no configurado**: Verifica que la variable `VITE_GOOGLE_CLIENT_ID` está correctamente configurada en `.env.local`

## Variables de Entorno

```
VITE_GOOGLE_CLIENT_ID  - Tu Google OAuth Client ID (obligatorio)
```

## En Producción

Cuando deplieges a producción:

1. Crea nuevas credenciales OAuth en Google Cloud Console
2. Agrega tu dominio de producción a los orígenes autorizados
3. Actualiza la variable `VITE_GOOGLE_CLIENT_ID` en tus variables de entorno de producción

## Referencias

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)
