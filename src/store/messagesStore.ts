import { messagingManager } from "@/services/supabaseService";
import { Conversation, ConversationMessage, UserProfile } from "@/types";
import { RealtimeChannel } from "@supabase/supabase-js";
import { create } from "zustand";
import { useNotificationStore } from "./notificationStore";

/**
 * MessagesStore - Manages real-time messaging and chat conversations
 * Features:
 * - Fetch and cache conversations
 * - Send and receive messages in real-time
 * - Subscribe to message updates via Supabase realtime
 */
interface MessagesState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  currentMessages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  subscription: RealtimeChannel | null;

  // State setters
  setCurrentConversation: (conversation: Conversation | null) => void;
  setCurrentMessages: (messages: ConversationMessage[]) => void;
  addMessage: (message: ConversationMessage) => void;
  setConversations: (conversations: Conversation[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async actions - Database operations
  /** Fetch all conversations for a specific user */
  fetchConversations: (userId: string) => Promise<void>;
  /** Fetch all messages within a conversation */
  fetchMessages: (conversationId: string) => Promise<void>;
  /** Send a new message to a conversation */
  sendMessage: (
    conversationId: string,
    senderId: string,
    content: string
  ) => Promise<void>;
  /** Create or get existing conversation between two users */
  startConversation: (
    userId: string,
    otherUserId: string,
    otherUser: UserProfile
  ) => Promise<void>;
  /** Subscribe to real-time message updates */
  subscribeToMessages: (conversationId: string) => void;
  /** Unsubscribe from real-time updates */
  unsubscribeFromMessages: () => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  currentMessages: [],
  isLoading: false,
  error: null,
  subscription: null,

  setCurrentConversation: (conversation) =>
    set({ currentConversation: conversation }),
  setCurrentMessages: (messages) => set({ currentMessages: messages }),

  addMessage: (message) => {
    set((state) => {
      if (state.currentMessages.some((m) => m.id === message.id)) {
        return state;
      }
      return { currentMessages: [...state.currentMessages, message] };
    });
  },

  setConversations: (conversations) => set({ conversations }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchConversations: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await messagingManager.getConversations(userId);
      
      // Mapear campos de snake_case a camelCase
      const mappedConversations = (data || []).map((conv: any) => ({
        id: conv.id,
        participant1Id: conv.participant_1_id,
        participant2Id: conv.participant_2_id,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
      }));
      
      set({ conversations: mappedConversations || [], isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error loading conversations";
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchMessages: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const messages = await messagingManager.getMessages(conversationId);
      
      // Mapear campos de snake_case a camelCase
      const mappedMessages = (messages || []).map((msg: any) => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        content: msg.content,
        createdAt: new Date(msg.created_at),
        readAt: msg.read_at ? new Date(msg.read_at) : undefined,
      }));
      
      set({ currentMessages: mappedMessages, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error loading messages";
      set({ error: errorMessage, isLoading: false });
    }
  },

  sendMessage: async (
    conversationId: string,
    senderId: string,
    content: string
  ) => {
    try {
      const message = await messagingManager.sendMessage(
        conversationId,
        senderId,
        content
      );
      if (!message) {
        const errorMessage = "No se pudo enviar el mensaje";
        set({ error: errorMessage });
        useNotificationStore.getState().addNotification({
          type: "error",
          title: "Error al enviar",
          message: errorMessage,
        });
        return;
      }

      const mappedMessage: ConversationMessage = {
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        content: message.content,
        createdAt: new Date(message.created_at),
        readAt: message.read_at ? new Date(message.read_at) : undefined,
      };
      get().addMessage(mappedMessage);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error sending message";
      set({ error: errorMessage });
      
      // Notificar error
      useNotificationStore.getState().addNotification({
        type: "error",
        title: "Error al enviar",
        message: errorMessage,
      });
    }
  },

  startConversation: async (
    userId: string,
    otherUserId: string,
    otherUser: UserProfile
  ) => {
    set({ isLoading: true, error: null });
    try {
      const conversation = await messagingManager.getOrCreateConversation(
        userId,
        otherUserId
      );
      if (conversation) {
        const newConversation: Conversation = {
          id: conversation.id,
          participant1Id: conversation.participant_1_id,
          participant1:
            userId === conversation.participant_1_id
              ? ({ id: userId } as UserProfile)
              : otherUser,
          participant2Id: conversation.participant_2_id,
          participant2:
            userId === conversation.participant_2_id
              ? ({ id: userId } as UserProfile)
              : otherUser,
          createdAt: new Date(conversation.created_at),
          updatedAt: new Date(conversation.updated_at),
        };

        set({
          currentConversation: newConversation,
          currentMessages: [],
          isLoading: false,
        });

        // Cargar mensajes existentes
        const messages = await messagingManager.getMessages(conversation.id);
        const mappedMessages = (messages || []).map((msg: any) => ({
          id: msg.id,
          conversationId: msg.conversation_id,
          senderId: msg.sender_id,
          content: msg.content,
          createdAt: new Date(msg.created_at),
          readAt: msg.read_at ? new Date(msg.read_at) : undefined,
        }));
        set({ currentMessages: mappedMessages || [] });

        // Subscribir a nuevos mensajes en tiempo real
        get().subscribeToMessages(conversation.id);
      } else {
        const errorMessage = "No se pudo crear la conversación";
        set({ error: errorMessage, isLoading: false });
        useNotificationStore.getState().addNotification({
          type: "error",
          title: "Error de chat",
          message: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error starting conversation";
      set({ error: errorMessage, isLoading: false });
    }
  },

  subscribeToMessages: (conversationId: string) => {
    // Primero desuscribirse del anterior si existe
    get().unsubscribeFromMessages();

    try {
      const subscription = messagingManager.subscribeToMessages(
        conversationId,
        (newMessage: any) => {
          console.log("[Store] New message received:", newMessage);
          const mappedMessage: ConversationMessage = {
            id: newMessage.id,
            conversationId: newMessage.conversation_id,
            senderId: newMessage.sender_id,
            content: newMessage.content,
            createdAt: new Date(newMessage.created_at),
            readAt: newMessage.read_at ? new Date(newMessage.read_at) : undefined,
          };
          get().addMessage(mappedMessage);
        }
      );

      set({ subscription });
      console.log("[Store] Subscribed to messages for conversation:", conversationId);
    } catch (error) {
      console.error("[Store] Error subscribing to messages:", error);
    }
  },

  unsubscribeFromMessages: () => {
    const subscription = get().subscription;
    if (subscription) {
      subscription.unsubscribe();
      set({ subscription: null });
      console.log("[Store] Unsubscribed from messages");
    }
  },
}));
