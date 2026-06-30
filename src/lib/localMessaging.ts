/**
 * Fallback de mensajería en localStorage cuando Supabase no está disponible
 * o el esquema de UUID no coincide con los IDs de texto de la app.
 */

interface LocalConversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  created_at: string;
  updated_at: string;
}

interface LocalMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

interface MessagingStore {
  conversations: LocalConversation[];
  messages: LocalMessage[];
}

const STORAGE_KEY = "masla-local-messaging";

function loadStore(): MessagingStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MessagingStore;
  } catch {
    // ignore corrupt data
  }
  return { conversations: [], messages: [] };
}

function saveStore(store: MessagingStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function nowIso(): string {
  return new Date().toISOString();
}

export const localMessaging = {
  getConversations(userId: string): LocalConversation[] {
    const store = loadStore();
    return store.conversations
      .filter(
        (c) =>
          c.participant_1_id === userId || c.participant_2_id === userId
      )
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
  },

  getConversationById(conversationId: string): LocalConversation | null {
    const store = loadStore();
    return store.conversations.find((c) => c.id === conversationId) ?? null;
  },

  getOrCreateConversation(
    userId1: string,
    userId2: string
  ): LocalConversation {
    const store = loadStore();
    const existing = store.conversations.find(
      (c) =>
        (c.participant_1_id === userId1 &&
          c.participant_2_id === userId2) ||
        (c.participant_1_id === userId2 &&
          c.participant_2_id === userId1)
    );

    if (existing) return existing;

    const conversation: LocalConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      participant_1_id: userId1,
      participant_2_id: userId2,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    store.conversations.push(conversation);
    saveStore(store);
    return conversation;
  },

  getMessages(conversationId: string, limit = 50): LocalMessage[] {
    const store = loadStore();
    return store.messages
      .filter((m) => m.conversation_id === conversationId)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      .slice(-limit);
  },

  sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): LocalMessage {
    const store = loadStore();
    const message: LocalMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      created_at: nowIso(),
      read_at: null,
    };

    store.messages.push(message);

    const convIndex = store.conversations.findIndex(
      (c) => c.id === conversationId
    );
    if (convIndex >= 0) {
      store.conversations[convIndex].updated_at = nowIso();
    }

    saveStore(store);
    return message;
  },

  subscribeToMessages(
    _conversationId: string,
    _callback: (message: LocalMessage) => void
  ) {
    return { unsubscribe: () => {} };
  },

  markAsRead(messageId: string): void {
    const store = loadStore();
    const msg = store.messages.find((m) => m.id === messageId);
    if (msg && !msg.read_at) {
      msg.read_at = nowIso();
      saveStore(store);
    }
  },
};
