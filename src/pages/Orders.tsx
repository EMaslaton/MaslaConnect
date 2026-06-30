import { BottomNav } from "@/components/BottomNav";
import { Navbar } from "@/components/Navbar";
import { RatingDialog } from "@/components/RatingDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { usePaymentStore } from "@/store/paymentStore";
import { useServiceStore } from "@/store/serviceStore";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    DollarSign,
    PackageOpen,
    Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const Orders = () => {
  const { user: currentUser } = useAuthStore();
  const { orders, payments, updateOrderStatus } = usePaymentStore();
  const { getServicesByUser } = useServiceStore();
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState<any>(null);

  // Si es cliente, ver órdenes que hizo
  // Si es freelancer, ver órdenes que recibió
  const relevantOrders = useMemo(() => {
    if (!currentUser) return [];

    if (currentUser.role === "client") {
      return orders.filter((o) => o.clientId === currentUser.id);
    } else {
      return orders.filter((o) => o.freelancerId === currentUser.id);
    }
  }, [currentUser, orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-600";
      case "in_progress":
        return "bg-blue-500/20 text-blue-600";
      case "pending":
        return "bg-yellow-500/20 text-yellow-600";
      case "cancelled":
        return "bg-red-500/20 text-red-600";
      default:
        return "bg-gray-500/20 text-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      in_progress: "En progreso",
      completed: "Completado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const getPaymentStatus = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      completed: "Completado",
      failed: "Fallido",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Navbar />
      <div className="container max-w-4xl py-6">
        <Link
          to="/panel"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              {currentUser?.role === "client"
                ? "Mis Contratos"
                : "Contratos Recibidos"}
            </h1>
            <p className="text-muted-foreground">
              {currentUser?.role === "client"
                ? "Gestiona los servicios que has contratado"
                : "Gestiona los servicios que has ofrecido"}
            </p>
          </div>

          {relevantOrders.length === 0 ? (
            <div className="rounded-2xl bg-card p-12 shadow-card text-center">
              <PackageOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {currentUser?.role === "client"
                  ? "Aún no has contratado ningún servicio"
                  : "Aún no has recibido ningún contrato"}
              </p>
              <Link to={currentUser?.role === "client" ? "/explorar" : "/panel"}>
                <Button className="gradient-primary text-primary-foreground rounded-full">
                  {currentUser?.role === "client"
                    ? "Explorar servicios"
                    : "Publicar servicio"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {relevantOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-card p-5 shadow-card space-y-4 hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <h3 className="font-display font-semibold text-foreground mb-1">
                        Orden #{order.id.slice(-8)}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(order.createdAt).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <Badge className={`${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>

                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="text-2xl font-display font-bold text-primary">
                          {order.totalAmount}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {order.paymentId ? "Pagado" : "Sin pagar"}
                      </p>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground font-semibold mb-1">
                        Notas:
                      </p>
                      <p className="text-sm text-foreground">{order.notes}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                    {currentUser?.role === "client" && (
                      <>
                        <Link to={`/mensajes?orderId=${order.id}`}>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-full w-full"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Contactar
                          </Button>
                        </Link>
                        {order.status === "completed" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOrderForRating({
                                ...order,
                                freelancerName: "Freelancer", // TODO: Obtener nombre real del freelancer
                              });
                              setRatingDialogOpen(true);
                            }}
                            className="gradient-primary text-primary-foreground rounded-full"
                          >
                            ⭐ Dejar Review
                          </Button>
                        )}
                      </>
                    )}
                    {currentUser?.role !== "client" && (
                      <>
                        <Link to={`/mensajes?orderId=${order.id}`}>
                          <Button size="sm" variant="outline" className="rounded-full w-full">
                            <Users className="w-4 h-4 mr-2" />
                          Ver cliente
                        </Button>
                      </Link>
                      <Button
                          size="sm"
                          onClick={() => {
                            if (order.status === "pending") {
                              updateOrderStatus(order.id, "in_progress");
                            } else if (order.status === "in_progress") {
                              updateOrderStatus(order.id, "completed");
                            }
                          }}
                          disabled={order.status === "completed" || order.status === "cancelled"}
                          className="gradient-primary text-primary-foreground rounded-full shadow-primary-glow"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {order.status === "pending" && "Aceptar"}
                          {order.status === "in_progress" && "Completar"}
                          {(order.status === "completed" || order.status === "cancelled") && "Hecho"}
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <BottomNav />

      {selectedOrderForRating && (
        <RatingDialog
          open={ratingDialogOpen}
          onOpenChange={setRatingDialogOpen}
          freelancerId={selectedOrderForRating.freelancerId}
          clientId={selectedOrderForRating.clientId}
          orderId={selectedOrderForRating.id}
          freelancerName={selectedOrderForRating.freelancerName}
        />
      )}
    </div>
  );
};

export default Orders;
