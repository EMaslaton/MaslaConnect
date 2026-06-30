import { SERVICES } from "@/lib/mock-data";
import { supabaseServiceManager } from "@/services/supabaseService";
import { Service } from "@/types";
import { create } from "zustand";

/**
 * ServiceStore - Manages all service listings
 * Features:
 * - Fetch services from Supabase or fallback to mock data
 * - Create, update, delete services
 * - Filter and search services
 * - Cache services locally for offline access
 */
interface ServiceStore {
  services: Service[];
  isLoading: boolean;
  isSupabaseReady: boolean;
  
  // Service management
  /** Add a new service to the platform */
  addService: (service: Omit<Service, "id" | "createdAt" | "updatedAt">) => Promise<Service | null>;
  /** Update an existing service */
  updateService: (id: string, updates: Partial<Service>) => Promise<Service | null>;
  /** Delete a service from the platform */
  deleteService: (id: string) => Promise<boolean>;
  
  // Service queries
  /** Get all services posted by a specific user */
  getServicesByUser: (userId: string) => Service[];
  /** Filter services by category */
  getServicesByCategory: (category: string) => Service[];
  /** Get all available services */
  getAllServices: () => Service[];
  /** Get a specific service by ID */
  getServiceById: (id: string) => Service | undefined;
  /** Get multiple services by their IDs */
  getServicesByIds: (ids: string[]) => Service[];
  
  // Service recommendations
  /** Get suggested services within a category (excluding a specific service) */
  getSuggestedServices: (category: string, excludeId?: string, limit?: number) => Service[];
  /** Search services by keyword */
  findServicesByKeyword: (keyword: string, limit?: number) => Service[];
  
  // Initialization
  /** Initialize services from Supabase or mock data */
  initializeServices: (initialServices?: Service[]) => Promise<void>;
}

// NO usar persist() para evitar QuotaExceeded - los servicios vienen de Supabase/mock-data
export const useServiceStore = create<ServiceStore>(
  (set, get) => ({
      // Iniciar vacío si Supabase está configurado, sino usar SERVICES
      services: import.meta.env.VITE_SUPABASE_URL ? [] : SERVICES,
      isLoading: false,
      isSupabaseReady: !!import.meta.env.VITE_SUPABASE_URL,

      // Inicializar servicios desde Supabase o localStorage
      initializeServices: async (initialServices) => {
        set({ isLoading: true });
        
        if (get().isSupabaseReady) {
          try {
            console.log("[Store] Loading services from Supabase...");
            const services = await supabaseServiceManager.getAllServices();
            const resolvedServices =
              services.length > 0 ? services : SERVICES;
            set({ services: resolvedServices, isLoading: false });
            console.log(`[Store] Loaded ${resolvedServices.length} services from Supabase ✅`);
            return;
          } catch (error) {
            console.error("[Store] Supabase error:", error);
            console.warn("[Store] Falling back to local cache");
          }
        }

        // Fallback a initialServices o SERVICES (cuando Supabase no está disponible o falló)
        if (initialServices && initialServices.length > 0) {
          set({ services: initialServices, isLoading: false });
        } else {
          set({ services: SERVICES, isLoading: false });
        }
      },

      addService: async (service) => {
        try {
          if (get().isSupabaseReady) {
            console.log("[Store] Adding service to Supabase...");
            const newService = await supabaseServiceManager.createService(service);
            if (newService) {
              set((state) => ({
                services: [...state.services, newService],
              }));
              console.log("[Store] Service added to Supabase ✅");
              return newService;
            }
          }

          // Fallback: crear localmente
          const newService: Service = {
            ...service,
            id: `service_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set((state) => ({
            services: [...state.services, newService],
          }));
          console.log("[Store] Service added locally (offline mode)");
          return newService;
        } catch (error) {
          console.error("[Store] Error adding service:", error);
          return null;
        }
      },

      updateService: async (id, updates) => {
        try {
          if (get().isSupabaseReady) {
            console.log(`[Store] Updating service ${id} in Supabase...`);
            const updated = await supabaseServiceManager.updateService(id, updates);
            if (updated) {
              set((state) => ({
                services: state.services.map((s) => (s.id === id ? updated : s)),
              }));
              return updated;
            }
          }

          // Fallback: actualizar localmente
          let updatedService: Service | null = null;
          set((state) => ({
            services: state.services.map((service) => {
              if (service.id === id) {
                updatedService = {
                  ...service,
                  ...updates,
                  updatedAt: new Date(),
                };
                return updatedService;
              }
              return service;
            }),
          }));
          return updatedService;
        } catch (error) {
          console.error("[Store] Error updating service:", error);
          return null;
        }
      },

      deleteService: async (id) => {
        try {
          if (get().isSupabaseReady) {
            console.log(`[Store] Deleting service ${id} from Supabase...`);
            const success = await supabaseServiceManager.deleteService(id);
            if (success) {
              set((state) => ({
                services: state.services.filter((s) => s.id !== id),
              }));
              return true;
            }
          }

          // Fallback: eliminar localmente
          set((state) => ({
            services: state.services.filter((s) => s.id !== id),
          }));
          return true;
        } catch (error) {
          console.error("[Store] Error deleting service:", error);
          return false;
        }
      },

      getServicesByUser: (userId) => {
        return get().services.filter((service) => service.userId === userId);
      },

      getServicesByCategory: (category) => {
        return get().services.filter((service) => service.category === category);
      },

      getAllServices: () => {
        return get().services;
      },

      getServiceById: (id) => {
        const service = get().services.find((s) => s.id === id);
        if (!service) {
          console.warn(`[Store] Service not found: ${id}`);
        }
        return service;
      },

      getServicesByIds: (ids) => {
        return get().services.filter((s) => ids.includes(s.id));
      },

      getSuggestedServices: (category, excludeId, limit = 3) => {
        return get()
          .services.filter(
            (s) => s.category === category && s.id !== excludeId
          )
          .slice(0, limit);
      },

      findServicesByKeyword: (keyword, limit = 5) => {
        const lowerKeyword = keyword.toLowerCase();
        return get()
          .services.filter(
            (s) =>
              s.title.toLowerCase().includes(lowerKeyword) ||
              s.description.toLowerCase().includes(lowerKeyword) ||
              s.category.toLowerCase().includes(lowerKeyword)
          )
          .slice(0, limit);
      },
    })
);
