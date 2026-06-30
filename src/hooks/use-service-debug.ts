import { serviceApi } from "@/services/serviceApi";
import { useEffect } from "react";

/**
 * Hook de debugging para simular errores de servicio
 * 
 * Uso:
 * ```tsx
 * const debugService = useServiceDebug({
 *   simulateNotFound: true,
 *   simulateDeleted: "service_123",
 *   logLevel: "debug"
 * });
 * ```
 */

export interface UseServiceDebugOptions {
  enabled?: boolean;
  simulateNotFound?: boolean | string; // true o ID a simular como no encontrado
  simulateDeleted?: string | string[]; // ID(s) a marcar como eliminados
  logLevel?: "debug" | "info" | "warn" | "error";
  autoTests?: boolean; // Ejecutar tests automáticos al montar
}

export const useServiceDebug = (options: UseServiceDebugOptions = {}) => {
  const {
    enabled = true,
    simulateDeleted,
    logLevel = "info",
    autoTests = false,
  } = options;

  const log = (message: string, data?: unknown) => {
    if (!enabled) return;
    
    switch (logLevel) {
      case "debug":
        console.log(`[DEBUG] ${message}`, data);
        break;
      case "info":
        console.log(`[INFO] ${message}`, data);
        break;
      case "warn":
        console.warn(`[WARN] ${message}`, data);
        break;
      case "error":
        console.error(`[ERROR] ${message}`, data);
        break;
    }
  };

  useEffect(() => {
    if (!enabled) return;

    log("Service Debug Hook Initialized");

    // Marcar servicios como eliminados
    if (simulateDeleted) {
      const idsToDelete = Array.isArray(simulateDeleted)
        ? simulateDeleted
        : [simulateDeleted];

      idsToDelete.forEach((id) => {
        serviceApi.markServiceAsDeleted(id);
        log(`Servicio marcado como eliminado: ${id}`);
      });
    }

    // Ejecutar tests automáticos
    if (autoTests) {
      runAutoTests();
    }
  }, [enabled, simulateDeleted, autoTests]);

  const runAutoTests = async () => {
    log("Ejecutando tests automáticos...");

    // Test 1: Buscar servicio no existente
    const test1 = await serviceApi.getServiceById("invalid_id_12345");
    log("Test 1 - Servicio no encontrado:", test1);

    // Test 2: Buscar servicio eliminado
    const deletedId = "service_deleted_test";
    serviceApi.markServiceAsDeleted(deletedId);
    const test2 = await serviceApi.getServiceById(deletedId);
    log("Test 2 - Servicio eliminado:", test2);

    // Test 3: Obtener razones de error
    const reason1 = serviceApi.getNotFoundReason("invalid_id");
    const reason2 = serviceApi.getNotFoundReason(deletedId);
    log("Test 3 - Razones de error:", { reason1, reason2 });

    log("Tests completados");
  };

  // Retornar utilidades para testing manual
  return {
    markAsDeleted: (id: string) => {
      serviceApi.markServiceAsDeleted(id);
      log(`Servicio ${id} marcado como eliminado`);
    },
    getNotFoundReason: (id: string) => {
      return serviceApi.getNotFoundReason(id);
    },
    getConnectionStatus: () => {
      return serviceApi.getConnectionStatus();
    },
    runTests: runAutoTests,
  };
};
