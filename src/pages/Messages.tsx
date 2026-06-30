import { BottomNav } from "@/components/BottomNav";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { TALENTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useMessagesStore } from "@/store/messagesStore";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Loader, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Messages = () => {
  const user = useAuthStore((state) => state.user);
  const registeredUsers = useAuthStore((state) => state.registeredUsers);
  const {
    conversations,
    currentConversation,
    currentMessages,
    isLoading,
    error,
    setCurrentConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useMessagesStore();

  // Hook para inicializar notificaciones
  const { notifyNewMessage, sendInAppNotification } = useNotifications();

  const [newMessage, setNewMessage] = useState("");
  const [showList, setShowList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  // Cargar conversaciones del usuario
  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id);
    }
  }, [user?.id, fetchConversations]);

  // Cargar mensajes y subscribirse a actualizaciones en tiempo real
  useEffect(() => {
    if (currentConversation?.id) {
      fetchMessages(currentConversation.id);
      subscribeToMessages(currentConversation.id);
    }

    // Limpiar suscripción al cambiar de conversación
    return () => {
      unsubscribeFromMessages();
    };
  }, [currentConversation?.id, fetchMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Limpiar suscripción al desmontar el componente
  useEffect(() => {
    return () => {
      unsubscribeFromMessages();
    };
  }, [unsubscribeFromMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // Detectar nuevos mensajes y enviar notificaciones
  useEffect(() => {
    if (currentMessages.length > lastMessageCount) {
      const newMsg = currentMessages[currentMessages.length - 1];
      
      // Solo notificar si el mensaje es de otro usuario
      if (newMsg.senderId !== user?.id && currentConversation) {
        const senderData = getUserById(newMsg.senderId);
        const messagePreview = newMsg.content.substring(0, 100);
        
        // Enviar notificación (incluyendo email si está disponible)
        notifyNewMessage(
          user?.email || '',
          user?.name || 'Usuario',
          senderData.name,
          messagePreview,
          currentConversation.id
        );
      }
      
      setLastMessageCount(currentMessages.length);
    }
  }, [currentMessages, lastMessageCount, user?.id, user?.email, user?.name, currentConversation, notifyNewMessage]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation?.id || !user?.id) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    
    // Enviar el mensaje
    await sendMessage(currentConversation.id, user.id, messageContent);

    // Notificar al otro usuario
    const otherParticipantId = 
      currentConversation.participant1Id === user.id
        ? currentConversation.participant2Id
        : currentConversation.participant1Id;

    const otherUserData = getUserById(otherParticipantId);
    
    // Enviar notificación push + email al remitente
    if (otherUserData && otherUserData.email) {
      await notifyNewMessage(
        otherUserData.email || '',
        otherUserData.name || 'Usuario',
        user.name || 'Usuario',
        messageContent.substring(0, 100),
        currentConversation.id
      );
    }
  };

  // Función para obtener datos del usuario por ID
  const getUserById = (userId: string) => {
    const foundTalent = TALENTS.find((t) => t.id === userId);
    if (foundTalent) {
      return {
        name: foundTalent.name,
        avatar: foundTalent.avatar,
        tagline: "En línea",
        email: `${foundTalent.name.toLowerCase().replace(" ", ".")}@maslaconnect.com`,
      };
    }

    const registeredUser = registeredUsers?.find((u) => u.id === userId);
    if (registeredUser) {
      return {
        name: registeredUser.name,
        avatar: registeredUser.avatar,
        tagline: registeredUser.tagline || "En línea",
        email: registeredUser.email,
      };
    }

    return {
      name: "Usuario",
      avatar: "https://via.placeholder.com/40",
      tagline: "En línea",
      email: undefined,
    };
  };

  const getOtherParticipant = () => {
    if (!currentConversation || !user?.id) return null;

    if (currentConversation.participant1Id === user.id) {
      return currentConversation.participant2 || getUserById(currentConversation.participant2Id);
    } else {
      return currentConversation.participant1 || getUserById(currentConversation.participant1Id);
    }
  };

  const otherParticipant = getOtherParticipant();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="container py-0 md:py-6">
        <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-7rem)] rounded-none md:rounded-2xl overflow-hidden bg-card md:shadow-card">
          {/* Conversations List */}
          <div
            className={cn(
              "w-full md:w-80 border-r border-border flex-shrink-0 flex flex-col",
              !showList && "hidden md:flex"
            )}
          >
            <div className="p-4 border-b border-border">
              <h2 className="font-display font-semibold text-foreground">
                Mensajes
              </h2>
            </div>

            {isLoading && conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No tienes conversaciones aún.<br />
                  Busca un servicio o contacta a alguien.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => {
                  const isParticipant1 = conv.participant1Id === user?.id;
                  const otherUserId = isParticipant1 ? conv.participant2Id : conv.participant1Id;
                  const otherUserData = getUserById(otherUserId);

                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setCurrentConversation(conv);
                        setShowList(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b border-border/50",
                        currentConversation?.id === conv.id && "bg-muted/50"
                      )}
                    >
                      <img
                        src={otherUserData.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full bg-muted flex-shrink-0 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-foreground">
                            {otherUserData.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {conv.updatedAt
                              ? new Date(conv.updatedAt).toLocaleTimeString(
                                  "es-ES",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : ""}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessage || "Sin mensajes"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat Window */}
          <div
            className={cn("flex-1 flex flex-col", showList && "hidden md:flex")}
          >
            {currentConversation && otherParticipant ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <button
                    onClick={() => setShowList(true)}
                    className="md:hidden text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <img
                    src={otherParticipant?.avatar || "https://via.placeholder.com/32"}
                    alt=""
                    className="w-8 h-8 rounded-full bg-muted object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">
                      {otherParticipant?.name || "Usuario"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {otherParticipant?.tagline || "En línea"}
                    </p>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  {currentMessages.map((msg, i) => {
                    const isOwn = msg.senderId === user?.id;
                    
                    // Parsear fecha de forma segura
                    let dateString = "Fecha inválida";
                    try {
                      const date = typeof msg.createdAt === "string" 
                        ? new Date(msg.createdAt) 
                        : msg.createdAt;
                      
                      if (!isNaN(date.getTime())) {
                        dateString = `${date.toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })} ${date.toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`;
                      }
                    } catch (e) {
                      dateString = "Fecha inválida";
                    }
                    
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          "flex",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                            isOwn
                              ? "gradient-primary text-primary-foreground rounded-br-md"
                              : "bg-muted text-foreground rounded-bl-md"
                          )}
                        >
                          <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                          <p
                            className={cn(
                              "text-[10px] mt-1",
                              isOwn
                                ? "text-primary-foreground/60"
                                : "text-muted-foreground"
                            )}
                          >
                            {dateString}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 min-h-10 max-h-32 px-4 py-2 rounded-full bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border-0 resize-none overflow-y-auto"
                      disabled={isLoading}
                      rows={1}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isLoading}
                      className="w-10 h-10 rounded-full gradient-primary text-primary-foreground shadow-primary-glow flex items-center justify-center p-0"
                    >
                      {isLoading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Selecciona una conversación para empezar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Messages;
