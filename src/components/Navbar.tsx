import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useMessagesStore } from "@/store/messagesStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Bell, Home, LogOut, Menu, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
  const { conversations, fetchConversations } = useMessagesStore();
  const { notifications, unreadCount: notificationCount, markAllAsRead } = useNotificationStore();

  // Cargar conversaciones cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchConversations(user.id);
    }
  }, [isAuthenticated, user?.id, fetchConversations]);

  // Count unread notifications (puede expanderse para incluir notificaciones del sistema)
  const unreadCount = conversations.length;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="font-display font-bold text-xl text-foreground">
          Masla<span className="text-primary">Connect</span>
        </Link>

        {isAuthenticated && user ? (
          <>
            {/* Search removed because it's non-functional */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/explorar">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "hover:bg-muted",
                    location.pathname === "/explorar" && "bg-muted"
                  )}
                >
                  Explorar
                </Button>
              </Link>
              <Link to="/feed">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "hover:bg-muted",
                    location.pathname === "/feed" && "bg-muted"
                  )}
                  title="Inicio"
                >
                  <Home className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/mensajes">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageCircle className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full gradient-primary text-[10px] text-primary-foreground flex items-center justify-center font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
              {/* Notifications Bell */}
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full gradient-primary text-[10px] text-primary-foreground flex items-center justify-center font-bold">
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <p className="font-semibold text-sm text-foreground">Notificaciones</p>
                    {notificationCount > 0 && (
                      <button 
                        onClick={() => markAllAsRead()}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        Marcar como visto
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No tienes notificaciones
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notif) => (
                        <DropdownMenuItem 
                          key={notif.id}
                          className="flex flex-col items-start gap-1 cursor-pointer p-3 hover:bg-muted/50 border-b border-border/50 last:border-b-0"
                        >
                          <div className="flex items-start gap-2 w-full">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{notif.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                              <p className="text-[10px] text-muted-foreground/60 mt-1">
                                {new Date(notif.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full gradient-primary flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-border text-center">
                        <button 
                          onClick={() => setShowNotifications(false)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Cerrar notificaciones
                        </button>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <img
                    src={user.avatar}
                    alt="Mi perfil"
                    className="w-8 h-8 rounded-full bg-muted cursor-pointer ring-2 ring-transparent hover:ring-primary/30 transition-all"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      to="/panel"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      📊 Mi Panel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to={`/perfil/${user.id}`}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      👤 Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/servicios/nuevo"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      ➕ Nuevo Servicio
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin() && (
                    <>
                      <div className="my-1 border-b border-border" />
                      <DropdownMenuItem asChild>
                        <Link
                          to="/admin"
                          className="cursor-pointer flex items-center gap-2 text-primary font-semibold"
                        >
                          🔐 Panel Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Iniciar sesión
              </Button>
            </Link>
            <Link to="/registro">
              <Button
                size="sm"
                className="gradient-primary text-primary-foreground rounded-full shadow-primary-glow"
              >
                Registrarse
              </Button>
            </Link>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-2 animate-fade-in">
          {isAuthenticated && user ? (
            <>
              <Link
                to="/explorar"
                className="block px-4 py-2 rounded-lg hover:bg-muted text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Explorar
              </Link>
              <Link
                to="/mensajes"
                className="block px-4 py-2 rounded-lg hover:bg-muted text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Mensajes
              </Link>
              <Link
                to="/panel"
                className="block px-4 py-2 rounded-lg hover:bg-muted text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Mi Panel
              </Link>
              <Link
                to={`/perfil/${user.id}`}
                className="block px-4 py-2 rounded-lg hover:bg-muted text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Mi Perfil
              </Link>
              <Link
                to="/servicios/nuevo"
                className="block px-4 py-2 rounded-lg hover:bg-muted text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Nuevo Servicio
              </Link>
              {isAdmin() && (
                <Link
                  to="/admin"
                  className="block px-4 py-2 rounded-lg hover:bg-muted text-sm text-primary font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  🔐 Panel Admin
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="w-full text-left block px-4 py-2 rounded-lg hover:bg-muted text-sm text-destructive"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-4 py-2 rounded-lg hover:bg-muted text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="block px-4 py-2 rounded-lg hover:bg-muted text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
