// src/services/supabaseService.ts
import { localMessaging } from "@/lib/localMessaging";
import { Service } from "@/types";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] Missing environment variables. Check SUPABASE_SETUP.md"
  );
}

export const supabase = createClient(
  supabaseUrl || "https://dummy.supabase.co",
  supabaseAnonKey || "dummy-key"
);

console.log(
  supabaseUrl ? "[Supabase] Connected ✅" : "[Supabase] Not configured ⚠️"
);

interface SupabaseService extends Partial<Service> {
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Servicio para interactuar con Supabase
 */
export class SupabaseServiceManager {
  private table = "services";

  /**
   * Obtener un servicio por ID
   */
  async getServiceById(serviceId: string): Promise<Service | null> {
    try {
      console.log(`[Supabase] GET /services/${serviceId}`);

      const { data, error } = await supabase
        .from(this.table)
        .select("*")
        .eq("id", serviceId)
        .single();

      if (error) {
        console.warn(`[Supabase] Service not found: ${serviceId}`, error);
        return null;
      }

      console.log(`[Supabase] Service found: ${serviceId} ✅`);
      return this.mapFromDb(data);
    } catch (error) {
      console.error("[Supabase] Error fetching service:", error);
      return null;
    }
  }

  /**
   * Obtener todos los servicios
   */
  async getAllServices(): Promise<Service[]> {
    try {
      console.log("[Supabase] GET /services");

      const { data, error } = await supabase
        .from(this.table)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[Supabase] Error fetching services:", error);
        return [];
      }

      console.log(`[Supabase] Fetched ${data.length} services ✅`);
      return data.map((item) => this.mapFromDb(item));
    } catch (error) {
      console.error("[Supabase] Error fetching services:", error);
      return [];
    }
  }

  /**
   * Obtener servicios por categoría
   */
  async getServicesByCategory(category: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((item) => this.mapFromDb(item));
    } catch (error) {
      console.error("[Supabase] Error fetching by category:", error);
      return [];
    }
  }

  /**
   * Obtener servicios por usuario
   */
  async getServicesByUser(userId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((item) => this.mapFromDb(item));
    } catch (error) {
      console.error("[Supabase] Error fetching user services:", error);
      return [];
    }
  }

  /**
   * Crear un servicio
   */
  async createService(
    service: Omit<Service, "id" | "createdAt" | "updatedAt">
  ): Promise<Service | null> {
    try {
      console.log("[Supabase] POST /services", service.title);

      const dbService = this.mapToDb(service);

      const { data, error } = await supabase
        .from(this.table)
        .insert([dbService])
        .select()
        .single();

      if (error) throw error;

      console.log(`[Supabase] Service created: ${data.id} ✅`);
      return this.mapFromDb(data);
    } catch (error) {
      console.error("[Supabase] Error creating service:", error);
      return null;
    }
  }

  /**
   * Actualizar un servicio
   */
  async updateService(
    serviceId: string,
    updates: Partial<Service>
  ): Promise<Service | null> {
    try {
      console.log(`[Supabase] PUT /services/${serviceId}`);

      const dbUpdates = this.mapToDb(updates);
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(this.table)
        .update(dbUpdates)
        .eq("id", serviceId)
        .select()
        .single();

      if (error) throw error;

      console.log(`[Supabase] Service updated: ${serviceId} ✅`);
      return this.mapFromDb(data);
    } catch (error) {
      console.error("[Supabase] Error updating service:", error);
      return null;
    }
  }

  /**
   * Eliminar un servicio
   */
  async deleteService(serviceId: string): Promise<boolean> {
    try {
      console.log(`[Supabase] DELETE /services/${serviceId}`);

      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq("id", serviceId);

      if (error) throw error;

      console.log(`[Supabase] Service deleted: ${serviceId} ✅`);
      return true;
    } catch (error) {
      console.error("[Supabase] Error deleting service:", error);
      return false;
    }
  }

  /**
   * Buscar servicios por palabra clave
   */
  async searchServices(keyword: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select("*")
        .or(
          `title.ilike.%${keyword}%,description.ilike.%${keyword}%,category.ilike.%${keyword}%`
        )
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      return data.map((item) => this.mapFromDb(item));
    } catch (error) {
      console.error("[Supabase] Error searching services:", error);
      return [];
    }
  }

  /**
   * Mapear datos de BD a formato frontend
   */
  private mapFromDb(dbService: SupabaseService): Service {
    return {
      id: dbService.id || "",
      userId: dbService.user_id || dbService.userId || "",
      userName: (dbService as any).user_name || "",
      title: dbService.title || "",
      description: dbService.description || "",
      category: dbService.category || "",
      price: dbService.price || "0",
      rating: dbService.rating || 0,
      reviews: dbService.reviews || 0,
      images: dbService.images || [],
      image: dbService.image,
      createdAt: dbService.created_at
        ? new Date(dbService.created_at)
        : new Date(),
      updatedAt: dbService.updated_at
        ? new Date(dbService.updated_at)
        : new Date(),
    };
  }

  /**
   * Mapear datos de frontend a BD
   */
  private mapToDb(service: any): any {
    return {
      user_id: service.userId || service.user_id,
      user_name: service.userName || "",
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      rating: service.rating || 0,
      reviews: service.reviews || 0,
      images: service.images || [],
      image: service.image,
      created_at: service.createdAt
        ? new Date(service.createdAt).toISOString()
        : undefined,
      updated_at: service.updatedAt
        ? new Date(service.updatedAt).toISOString()
        : new Date().toISOString(),
    };
  }
}

/**
 * Servicio para gestionar mensajes y conversaciones
 */
export class MessagingManager {
  /**
   * Obtener todas las conversaciones del usuario actual
   */
  async getConversations(userId: string) {
    try {
      console.log(`[Supabase] GET /conversations for user ${userId}`);

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      console.log(`[Supabase] Fetched ${data.length} conversations ✅`);
      return data;
    } catch (error) {
      console.warn("[Supabase] Error fetching conversations, using local fallback:", error);
      return localMessaging.getConversations(userId);
    }
  }

  /**
   * Obtener una conversación específica
   */
  async getConversation(conversationId: string) {
    try {
      console.log(`[Supabase] GET /conversations/${conversationId}`);

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.warn("[Supabase] Error fetching conversation, using local fallback:", error);
      return localMessaging.getConversationById(conversationId);
    }
  }

  /**
   * Crear o obtener una conversación existente entre dos usuarios
   */
  async getOrCreateConversation(userId1: string, userId2: string) {
    try {
      console.log(
        `[Supabase] GET_OR_CREATE /conversations between ${userId1} and ${userId2}`
      );

      const { data: existingData } = await supabase
        .from("conversations")
        .select("*")
        .or(
          `and(participant_1_id.eq.${userId1},participant_2_id.eq.${userId2}),and(participant_1_id.eq.${userId2},participant_2_id.eq.${userId1})`
        )
        .maybeSingle();

      if (existingData) {
        console.log(
          `[Supabase] Conversation found: ${existingData.id} ✅`
        );
        return existingData;
      }

      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert([
          {
            participant_1_id: userId1,
            participant_2_id: userId2,
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

      console.log(
        `[Supabase] Conversation created: ${newConversation.id} ✅`
      );
      return newConversation;
    } catch (error) {
      console.warn("[Supabase] Error with conversation, using local fallback:", error);
      return localMessaging.getOrCreateConversation(userId1, userId2);
    }
  }

  /**
   * Obtener mensajes de una conversación
   */
  async getMessages(conversationId: string, limit = 50) {
    try {
      console.log(
        `[Supabase] GET /messages from conversation ${conversationId}`
      );

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      console.warn("[Supabase] Error fetching messages, using local fallback:", error);
      return localMessaging.getMessages(conversationId, limit);
    }
  }

  /**
   * Enviar un mensaje
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ) {
    try {
      console.log(
        `[Supabase] POST /messages to conversation ${conversationId}`
      );

      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversationId,
            sender_id: senderId,
            content: content,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      console.log(`[Supabase] Message sent: ${data.id} ✅`);
      return data;
    } catch (error) {
      console.warn("[Supabase] Error sending message, using local fallback:", error);
      return localMessaging.sendMessage(conversationId, senderId, content);
    }
  }

  /**
   * Suscribirse a nuevos mensajes en una conversación (real-time)
   */
  subscribeToMessages(conversationId: string, callback: (message: Record<string, unknown>) => void) {
    if (conversationId.startsWith("conv_")) {
      return localMessaging.subscribeToMessages(conversationId, callback);
    }

    console.log(
      `[Supabase] Subscribing to messages in conversation ${conversationId}`
    );

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("[Supabase] New message received:", payload.new);
          callback(payload.new as Record<string, unknown>);
        }
      )
      .subscribe();

    return subscription;
  }

  /**
   * Marcar mensaje como leído
   */
  async markAsRead(messageId: string) {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("id", messageId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.warn("[Supabase] Error marking message as read, using local fallback:", error);
      localMessaging.markAsRead(messageId);
      return true;
    }
  }
}

// Exportar instancias singleton
export const supabaseServiceManager = new SupabaseServiceManager();
export const messagingManager = new MessagingManager();
