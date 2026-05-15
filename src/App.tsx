import { NotificationStack } from "@/components/NotificationStack";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useNotifications } from "@/hooks/use-notifications";
import { useServiceStore } from "@/store/serviceStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminPanel from "./pages/AdminPanel.tsx";
import ConfirmReset from "./pages/ConfirmReset.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Explorer from "./pages/Explorer.tsx";
import Feed from "./pages/Feed.tsx";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Messages from "./pages/Messages.tsx";
import NotFound from "./pages/NotFound.tsx";
import Orders from "./pages/Orders.tsx";
import Profile from "./pages/Profile.tsx";
import PublishService from "./pages/PublishService.tsx";
import Register from "./pages/Register.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ServiceDetail from "./pages/ServiceDetail.tsx";

const queryClient = new QueryClient();

const AppContent = () => {
  const { initializeServices } = useServiceStore();
  
  // Inicializar notificaciones (push notifications, service worker, etc)
  useNotifications();

  // Inicializar servicios desde Supabase o localStorage
  useEffect(() => {
    initializeServices();
  }, [initializeServices]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/confirm-reset" element={<ConfirmReset />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/explorar"
        element={
          <ProtectedRoute>
            <Explorer />
          </ProtectedRoute>
          
        }
      />
      <Route
        path="/perfil/:id"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mensajes"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/panel"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={<AdminPanel />}
      />
      <Route
        path="/contratos"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/servicios/nuevo"
        element={
          <ProtectedRoute>
            <PublishService />
          </ProtectedRoute>
        }
      />
      <Route
        path="/servicio/:serviceId"
        element={
          <ProtectedRoute>
            <ServiceDetail />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <NotificationStack />
        <InstallPrompt />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
