# Integración de Backend para MaslaConnect

## 📋 Estado Actual

El sistema actualmente funciona con:
- **Mock data** en `src/lib/mock-data.ts`
- **LocalStorage** para persistencia temporal
- **Servicios simulados** con `src/services/serviceApi.ts`

## 🚀 Pasos para Integrar Backend Real

### 1. **Configurar Variables de Entorno**

Crea un archivo `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=5000
```

### 2. **Actualizar Service API**

Modifica `src/services/serviceApi.ts`:

```typescript
class ServiceApiService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  async getServiceById(serviceId: string): Promise<ApiResponse<Service>> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${serviceId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: "not-found", ... };
        }
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return { success: true, data, ... };
    } catch (error) {
      console.error("[API Error]", error);
      return { success: false, error: "server-error", ... };
    }
  }
}
```

### 3. **Backend Endpoints Requeridos**

Tu servidor debe tener estos endpoints:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/services/{id}` | GET | Obtener detalle del servicio |
| `/services` | GET | Listar servicios (con filtros) |
| `/services` | POST | Crear servicio |
| `/services/{id}` | PUT | Actualizar servicio |
| `/services/{id}` | DELETE | Eliminar servicio |
| `/services/suggestions` | GET | Obtener sugerencias |

### 4. **Sincronizar ServiceStore con Backend**

```typescript
// src/store/serviceStore.ts
initializeServices: async () => {
  try {
    const response = await serviceApi.getServices();
    if (response.success && response.data) {
      set((state) => ({
        services: response.data,
      }));
    }
  } catch (error) {
    console.error("Failed to load services from backend", error);
    // Fallback a localStorage/mock data
  }
}
```

### 5. **Manejo de Errores Backend**

En `ServiceDetail.tsx`, el componente ya está preparado para:
- ✅ Detectar servicios eliminados
- ✅ Mostrar sugerencias cuando no encuentra el servicio
- ✅ Registrar en logs para debug

### 6. **Autenticación**

Agrega token JWT a las solicitudes:

```typescript
private getAuthHeader = () => {
  const token = localStorage.getItem("auth_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// En cada fetch:
const response = await fetch(url, {
  headers: this.getAuthHeader(),
});
```

## 📝 Checklist de Implementación

- [ ] Crear backend con Node.js/Express o Python/FastAPI
- [ ] Configurar base de datos (PostgreSQL/MongoDB)
- [ ] Implementar endpoints listados arriba
- [ ] Configurar CORS y autenticación
- [ ] Actualizar URLs en variables de entorno
- [ ] Probar cada endpoint con Postman
- [ ] Implementar rate limiting
- [ ] Agregar validación de datos en backend
- [ ] Configurar logs y monitoreo
- [ ] Testing en producción

## 🔒 Consideraciones de Seguridad

1. **Nunca guardes contraseñas en localStorage**
2. **Valida datos en frontend Y backend**
3. **Usa HTTPS en producción**
4. **Implementa tasa de limitación (rate limiting)**
5. **Sanitiza inputs para prevenir inyecciones**

## 📚 APIs Sugeridas para Backend

Puedes comenzar rápidamente con:

- **Node.js**: Express + Prisma/TypeORM
- **Python**: FastAPI + SQLAlchemy
- **Firebase**: Realtime Database/Firestore
- **Supabase**: PostgreSQL + Auth

## 🧪 Testing del Flujo

```bash
# 1. Iniciar backend en http://localhost:3000
npm run dev:backend

# 2. Iniciar frontend
npm run dev

# 3. Probar en navegador
# http://localhost:5173/servicio/service_123
# Debería buscar en backend en lugar de localStorage
```

## 📊 Diagrama de Flujo

```
Usuario accede → /servicio/{id}
    ↓
ServiceDetail se monta
    ↓
useEffect llama serviceApi.getServiceById()
    ↓
Service API hace fetch a backend
    ↓
Backend busca en BD
    ↓
    ├─ Encontrado → Retorna datos → Renderiza
    ├─ Eliminado → 410 Gone → Muestra "Servicio eliminado"
    └─ No existe → 404 → Muestra sugerencias
```

## 🔧 Variables Globales de Debug

En `serviceApi.ts` ya existen logs:
```javascript
// Ver en console:
console.log("[API] GET /services/123")
console.warn("[API] Service not found")
```

Útil para debugging en dev y producción.

---

**Próximos pasos:** Elige tu tecnología backend favorita e implementa los 5 endpoints principales.
