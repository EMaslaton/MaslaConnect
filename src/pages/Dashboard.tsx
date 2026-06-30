import { BottomNav } from "@/components/BottomNav";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import { usePaymentStore } from "@/store/paymentStore";
import { useRatingStore } from "@/store/ratingStore";
import { useServiceStore } from "@/store/serviceStore";
import { motion } from "framer-motion";
import { Edit, Eye, MessageCircle, Pause, Play, ShoppingCart, Trash2, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuthStore();
  const { getServicesByUser, updateService, deleteService } = useServiceStore();
  const { orders } = usePaymentStore();
  const { getAverageRating } = useRatingStore();
  const userServices = user ? getServicesByUser(user.id) : [];
  
  // Estado para el modal de edición
  const [editingService, setEditingService] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", price: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Contar órdenes relevantes
  const relevantOrders = useMemo(() => {
    if (!user) return 0;
    if (user.role === "client") {
      return orders.filter((o) => o.clientId === user.id).length;
    } else {
      return orders.filter((o) => o.freelancerId === user.id).length;
    }
  }, [user, orders]);

  // Calcular stats reales
  const totalEarnings = useMemo(() => {
    if (!user || user.role !== "freelancer") return 0;
    return orders
      .filter((o) => o.freelancerId === user.id && o.status === "completed")
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [user, orders]);

  const completedOrders = useMemo(() => {
    if (!user) return 0;
    if (user.role === "client") {
      return orders.filter((o) => o.clientId === user.id && o.status === "completed").length;
    } else {
      return orders.filter((o) => o.freelancerId === user.id && o.status === "completed").length;
    }
  }, [user, orders]);

  // Calcular completitud de perfil
  const profileCompleteness = useMemo(() => {
    if (!user) return 0;
    let completed = 0;
    let total = 0;

    if (user.avatar) completed++;
    total++;
    if (user.name) completed++;
    total++;
    if (user.bio) completed++;
    total++;
    if (user.skills && user.skills.length > 0) completed++;
    total++;
    if (user.tagline) completed++;
    total++;
    if (user.email) completed++;
    total++;

    return Math.round((completed / total) * 100);
  }, [user]);

  // Handlers para servicios
  const handlePauseService = async (serviceId: string, currentStatus: string) => {
    const newStatus = currentStatus === "inactive" ? "active" : "inactive";
    await updateService(serviceId, { active: newStatus === "active" });
    console.log(`[Dashboard] Service ${serviceId} ${newStatus === "inactive" ? "paused" : "resumed"} ✅`);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setEditForm({ 
      title: service.title, 
      description: service.description, 
      price: service.price 
    });
  };

  const handleSaveService = async () => {
    if (!editingService || !editForm.title || !editForm.description || !editForm.price) return;
    
    setIsSaving(true);
    await updateService(editingService.id, {
      title: editForm.title,
      description: editForm.description,
      price: editForm.price,
    });
    console.log(`[Dashboard] Service ${editingService.id} updated ✅`);
    setEditingService(null);
    setIsSaving(false);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm("¿Estás seguro que deseas eliminar este servicio?")) {
      await deleteService(serviceId);
      console.log(`[Dashboard] Service ${serviceId} deleted ✅`);
    }
  };

  const stats = [
    {
      label: user?.role === "freelancer" ? "Ingresos" : "Contrataciones",
      value: user?.role === "freelancer" ? `$${totalEarnings}` : userServices.length,
      icon: ShoppingCart,
      change: user?.role === "freelancer" ? `${completedOrders} completados` : "",
    },
    {
      label: user?.role === "freelancer" ? "Servicios activos" : "Órdenes activas",
      value: user?.role === "freelancer" ? userServices.length : orders.filter((o) => o.clientId === user?.id && o.status !== "completed" && o.status !== "cancelled").length,
      icon: TrendingUp,
      change: "",
    },
    {
      label: "Completitud del perfil",
      value: `${profileCompleteness}%`,
      icon: Eye,
      change: profileCompleteness === 100 ? "¡Completo!" : "Falta info",
    },
    {
      label: "Rating",
      value: user && user.role === "freelancer" ? `${getAverageRating(user.id).toFixed(1)}⭐` : "N/A",
      icon: MessageCircle,
      change: "",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="container max-w-4xl py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Mi Panel
              </h1>
              <p className="text-sm text-muted-foreground">
                Bienvenido de vuelta, {user?.name} 👋
              </p>
            </div>
            <div className="flex gap-2">
              <Link to={`/perfil/${user?.id}`}>
                <Button variant="outline" className="rounded-full" size="sm">
                  <Edit className="w-4 h-4 mr-1" /> Editar perfil
                </Button>
              </Link>
              <Link to="/contratos">
                <Button variant="outline" className="rounded-full" size="sm">
                  <ShoppingCart className="w-4 h-4 mr-1" /> Contratos ({relevantOrders})
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-card p-4 shadow-card space-y-2"
              >
                <div className="flex items-center justify-between">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                  {stat.change && (
                    <span className="text-xs font-medium text-secondary">
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Profile Info */}
          <div className="rounded-2xl bg-card p-5 shadow-card space-y-4">
            <div className="flex items-start gap-4">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <h2 className="font-display font-semibold text-lg text-foreground">
                  {user?.name}
                </h2>
                <p className="text-sm text-muted-foreground">{user?.tagline}</p>
                <p className="text-sm text-muted-foreground mt-1">{user?.location}</p>
              </div>
            </div>
            {user?.bio && (
              <p className="text-sm text-foreground">{user.bio}</p>
            )}
            {user?.skills && user.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Services */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg text-foreground">
                Mis servicios ({userServices.length})
              </h2>
              <Link to="/servicios/nuevo">
                <Button
                  size="sm"
                  className="gradient-primary text-primary-foreground rounded-full shadow-primary-glow"
                >
                  + Nuevo servicio
                </Button>
              </Link>
            </div>

            {userServices.length === 0 ? (
              <div className="rounded-2xl bg-card p-8 shadow-card text-center">
                <p className="text-muted-foreground">
                  No tienes servicios publicados
                </p>
                <Link to="/servicios/nuevo">
                  <Button
                    size="sm"
                    className="gradient-primary text-primary-foreground mt-4"
                  >
                    Crear tu primer servicio
                  </Button>
                </Link>
              </div>
            ) : (
              userServices.map((svc) => (
                <div
                  key={svc.id}
                  className="rounded-2xl bg-card p-4 shadow-card flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">
                        {svc.title}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
                        Activo
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {svc.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => handlePauseService(svc.id, svc.active ? "active" : "inactive")}
                      title={svc.active ? "Pausar servicio" : "Reanudar servicio"}
                    >
                      {svc.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => handleEditService(svc)}
                      title="Editar servicio"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => handleDeleteService(svc.id)}
                      title="Eliminar servicio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Modal de edición de servicio */}
        <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar servicio</DialogTitle>
              <DialogDescription>
                Modifica los detalles de tu servicio
              </DialogDescription>
            </DialogHeader>
            {editingService && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Precio ($/hr)</Label>
                  <Input
                    id="price"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    type="number"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingService(null)}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveService}
                    disabled={isSaving || !editForm.title || !editForm.description || !editForm.price}
                    className="gradient-primary"
                  >
                    {isSaving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <BottomNav />
    </div>
  );
};

export default Dashboard;
