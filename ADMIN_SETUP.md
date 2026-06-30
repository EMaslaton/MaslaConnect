# Sistema de Admin - Primer Login con Google

## 🔐 Cómo Funciona

El sistema de admin se asigna **automáticamente al primer usuario que inicia sesión con Google**.

### Flujo:

1. **Primer login con Google** → Ese usuario se convierte en **Admin** automáticamente
2. **Segundos y posteriores logins** → Se crean como usuarios normales (**Freelancer**)

⚠️ **Importante**: Una vez que se asigna el primer admin, no se puede cambiar a través del login. Solo se puede cambiar desde el panel de admin donde un admin puede promover/remover a otros admins.

### Pasos para Configurar:

1. **Limpia localStorage** (opcional, para empezar de cero):
   - Abre DevTools (F12)
   - Ve a Application → Local Storage
   - Busca `masla-auth` y elimínalo

2. **Accede a la app**

3. **Inicia sesión con Google**
   - Usa tu email de Google personal
   - **¡Este será tu admin principal!**

4. ✅ Automáticamente serás redirigido al panel como admin

### Después del Primer Setup:

- Puedes promover otros usuarios a admin desde el **Panel Admin** → Gestión de Usuarios
- Puedes remover admins igual
- Los nuevos logins con Google serán users normales

### Credenciales Demo (Email/Password):

Los usuarios demo (valentina.reyes, carlos.rivera, etc.) se crean como **Freelancer** automáticamente.

Para hacerlos admin, debes usar el **Panel Admin**:
1. Inicia sesión como admin (tu email de Google)
2. Ve a **🔐 Panel Admin**
3. Busca el usuario y haz clic en **"Promover Admin"**

