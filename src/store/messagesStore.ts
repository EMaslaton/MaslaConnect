import { messagingManager } from "@/services/supabaseService";
import { Conversation, ConversationMessage, UserProfile } from "@/types";
import { RealtimeChannel } from "@supabase/supabase-js";
import { create } from "zustand";
import { useNotificationStore } from "./notificationStore";

type MessageSubscription = RealtimeChannel | { unsubscribe: () => void } | null;

function mapRawMessage(msg: Record<string, unknown>): ConversationMessage {
  return {
    id: String(msg.id),
    conversationId: String(msg.conversation_id),
    senderId: String(msg.sender_id),
    content: String(msg.content),
    createdAt: new Date(String(msg.created_at)),
    readAt: msg.read_at ? new Date(String(msg.read_at)) : undefined,
  };
}

function sortMessages(messages: ConversationMessage[]): ConversationMessage[] {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

interface MessagesState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  currentMessages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  subscription: MessageSubscription;
  pollTimer: ReturnType<typeof setInterval> | null;
  conversationsPollTimer: ReturnType<typeof setInterval> | null;
  activeConversationId: string | null;

  setCurrentConversation: (conversation: Conversation | null) => void;
  setCurrentMessages: (messages: ConversationMessage[]) => void;
  addMessage: (message: ConversationMessage) => void;
  mergeMessages: (messages: ConversationMessage[]) => void;
  setConversations: (conversations: Conversation[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchConversations: (userId: string, options?: { silent?: boolean }) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  syncMessages: (conversationId: string) => Promise<void>;
  sendMessage: (
    conversationId: string,
    senderId: string,
    content: string
  ) => Promise<void>;
  startConversation: (
    userId: string,
    otherUserId: string,
    otherUser: UserProfile
  ) => Promise<void>;
  subscribeToMessages: (conversationId: string) => void;
  unsubscribeFromMessages: () => void;
  startConversationsPolling: (userId: string) => void;
  stopConversationsPolling: () => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  currentMessages: [],
  isLoading: false,
  error: null,
  subscription: null,
  pollTimer: null,
  conversationsPollTimer: null,
  activeConversationId: null,

  setCurrentConversation: (conversation) =>
    set({ currentConversation: conversation }),
  setCurrentMessages: (messages) => set({ currentMessages: messages }),

  addMessage: (message) => {
    set((state) => {
      if (state.currentMessages.some((m) => m.id === message.id)) {
        return state;
      }
      return { currentMessages: sortMessages([...state.currentMessages, message]) };
    });
  },

  mergeMessages: (messages) => {
    set((state) => {
      const byId = new Map(state.currentMessages.map((m) => [m.id, m]));
      for (const msg of messages) {
        byId.set(msg.id, msg);
      }
      const merged = sortMessages(Array.from(byId.values()));
      if (
        merged.length === state.currentMessages.length &&
        merged.every((m, i) => m.id === state.currentMessages[i]?.id)
      ) {
        return state;
      }
      return { currentMessages: merged };
    });
  },

  setConversations: (conversations) => set({ conversations }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchConversations: async (userId: string, options?: { silent?: boolean }) => {
    if (!options?.silent) {
      set({ isLoading: true, error: null });
    }
    try {
      const data = await messagingManager.getConversations(userId);

      const mappedConversations: Conversation[] = (data || []).map(
        (conv: Record<string, unknown>) => ({
          id: String(conv.id),
          participant1Id: String(conv.participant_1_id),
          participant2Id: String(conv.participant_2_id),
          createdAt: new Date(String(conv.created_at)),
          updatedAt: new Date(String(conv.updated_at)),
        })
      );

      set({ conversations: mappedConversations, isLoading: false });
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
      const mappedMessages = (messages || []).map((msg) =>
        mapRawMessage(msg as Record<string, unknown>)
      );
      set({ currentMessages: mappedMessages, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error loading messages";
      set({ error: errorMessage, isLoading: false });
    }
  },

  syncMessages: async (conversationId: string) => {
    try {
      const messages = await messagingManager.getMessages(conversationId);
      const mappedMessages = (messages || []).map((msg) =>
        mapRawMessage(msg as Record<string, unknown>)
      );
      get().mergeMessages(mappedMessages);
    } catch (error) {
      console.warn("[Store] Error syncing messages:", error);
    }
  },

  sendMessage: async (conversationId, senderId, content) => {
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

      get().addMessage(mapRawMessage(message as Record<string, unknown>));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error sending message";
      set({ error: errorMessage });
      useNotificationStore.getState().addNotification({
        type: "error",
        title: "Error al enviar",
        message: errorMessage,
      });
    }
  },

  startConversation: async (userId, otherUserId, otherUser) => {
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

        await get().fetchMessages(conversation.id);
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
    get().unsubscribeFromMessages();

    try {
      const subscription = messagingManager.subscribeToMessages(
        conversationId,
        (newMessage: Record<string, unknown>) => {
          get().addMessage(mapRawMessage(newMessage));
        }
      );

      const pollTimer = setInterval(() => {
        if (get().activeConversationId === conversationId) {
          get().syncMessages(conversationId);
        }
      }, 2500);

      set({
        subscription,
        pollTimer,
        activeConversationId: conversationId,
      });
    } catch (error) {
      console.error("[Store] Error subscribing to messages:", error);
    }
  },

  unsubscribeFromMessages: () => {
    const subscription = get().subscription;
    if (subscription && "unsubscribe" in subscription) {
      subscription.unsubscribe();
    }

    const pollTimer = get().pollTimer;
    if (pollTimer) {
      clearInterval(pollTimer);
    }

    set({
      subscription: null,
      pollTimer: null,
      activeConversationId: null,
    });
  },

  startConversationsPolling: (userId: string) => {
    get().stopConversationsPolling();

    const timer = setInterval(() => {
      get().fetchConversations(userId, { silent: true });
      const activeId = get().activeConversationId;
      if (activeId) {
        get().syncMessages(activeId);
      }
    }, 4000);

    set({ conversationsPollTimer: timer });
  },

  stopConversationsPolling: () => {
    const timer = get().conversationsPollTimer;
    if (timer) {
      clearInterval(timer);
    }
    set({ conversationsPollTimer: null });
  },
}));
