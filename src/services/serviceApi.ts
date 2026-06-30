// Servicio simulado de API Backend
// En producción, esto llamaría a tu servidor real

import { Service } from "@/types";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ServiceNotFoundReason {
  type: "deleted" | "never-existed" | "expired-link";
  message: string;
}

class ServiceApiService {
  private isOnline = true;
  private deletedServiceIds = new Set<string>(); // Simula servicios eliminados

  /**
   * Buscar un servicio con logs y manejo de errores
   */
  async getServiceById(serviceId: string): Promise<ApiResponse<Service | null>> {
    console.log(`[API] GET /services/${serviceId}`);
    
    // Simular latencia de red
    await this.delay(300);

    // Si está marcado como eliminado
    if (this.deletedServiceIds.has(serviceId)) {
      console.warn(`[API] Service ${serviceId} was deleted`);
      return {
        success: false,
        error: "deleted",
        timestamp: new Date().toISOString(),
      };
    }

    // En producción, esto iría a tu base de datos
    // Por ahora retorna null para que el frontend lo maneje
    console.log(`[API] Service ${serviceId} not found in database`);
    return {
      success: false,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Obtener servicios sugeridos de la misma categoría
   */
  async getSuggestedServices(
    category: string,
    excludeServiceId: string,
    limit: number = 3
  ): Promise<ApiResponse<Service[]>> {
    console.log(`[API] GET /services/suggestions?category=${category}&limit=${limit}`);
    
    await this.delay(200);

    // En producción:
    // const response = await fetch(`/api/services/suggestions?category=${category}&limit=${limit}`)
    // return response.json();

    // Por ahora retorna array vacío
    return {
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Marcar un servicio como eliminado (para testing)
   */
  markServiceAsDeleted(serviceId: string): void {
    console.log(`[API] Marking service ${serviceId} as deleted`);
    this.deletedServiceIds.add(serviceId);
  }

  /**
   * Obtener razón específica del error
   */
  getNotFoundReason(serviceId: string): ServiceNotFoundReason {
    if (this.deletedServiceIds.has(serviceId)) {
      return {
        type: "deleted",
        message: "Este servicio fue eliminado o no está disponible.",
      };
    }

    // Verificar si el ID tiene formato válido
    if (!serviceId || serviceId.length < 3) {
      return {
        type: "never-existed",
        message: "El ID del servicio no es válido.",
      };
    }

    return {
      type: "never-existed",
      message: "No encontramos este servicio. Puede que nunca haya existido.",
    };
  }

  /**
   * Utilidad para simular latencia de red
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Verificar estado de conexión
   */
  getConnectionStatus(): {
    isOnline: boolean;
    lastCheck: string;
  } {
    return {
      isOnline: this.isOnline,
      lastCheck: new Date().toISOString(),
    };
  }
}

export const serviceApi = new ServiceApiService();
