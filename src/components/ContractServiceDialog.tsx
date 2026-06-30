import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { usePaymentStore } from "@/store/paymentStore";
import { Service, UserProfile } from "@/types";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ContractServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service;
  freelancer: UserProfile;
}

export const ContractServiceDialog = ({
  open,
  onOpenChange,
  service,
  freelancer,
}: ContractServiceDialogProps) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { createOrder, createPayment } = usePaymentStore();
  const { addNotification } = useNotificationStore();
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!currentUser) return null;

  const handleContract = () => {
    // Crear orden
    const order = createOrder({
      serviceId: service.id,
      clientId: currentUser.id,
      freelancerId: freelancer.id,
      totalAmount: parseFloat(service.price),
      status: "pending",
      notes,
    });

    // Crear pago
    createPayment({
      orderId: order.id,
      clientId: currentUser.id,
      freelancerId: freelancer.id,
      amount: parseFloat(service.price),
      currency: "USD",
      status: "completed", // En demo, simulamos pago exitoso
      method: paymentMethod === "card" ? "card" : "bank_transfer",
    });

    // Agregar notificación
    addNotification({
      type: "success",
      title: "¡Contrato creado!",
      message: `Has contratado el servicio "${service.title}" con ${freelancer.name}`,
    });

    // Mostrar confirmación
    setShowConfirmation(true);
    setTimeout(() => {
      onOpenChange(false);
      setShowConfirmation(false);
      setNotes("");
      // Redirigir a contratos
      navigate("/contratos");
    }, 2500);
  };

  return (
    <>
      <Dialog open={open && !showConfirmation} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Contratar servicio</DialogTitle>
            <DialogDescription>
              Completa los detalles para contratar a {freelancer.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Resumen del servicio */}
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h3 className="font-semibold text-foreground">{service.title}</h3>
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-sm text-muted-foreground">Tarifa:</span>
                <span className="font-display font-bold text-lg text-primary">
                  ${service.price} USD
                </span>
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Cuéntale al freelancer más detalles sobre tu proyecto..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Método de pago */}
            <div className="space-y-2">
              <Label>Método de pago</Label>
              <div className="grid grid-cols-2 gap-2">
                {["card", "transfer"].map((method) => (
                  <Button
                    key={method}
                    onClick={() =>
                      setPaymentMethod(
                        method as "card" | "transfer"
                      )
                    }
                    variant={paymentMethod === method ? "default" : "outline"}
                    className={`text-sm font-medium transition-all ${
                      paymentMethod === method
                        ? "gradient-primary text-primary-foreground"
                        : ""
                    }`}
                  >
                    {method === "card" ? "💳 Tarjeta" : "🏦 Transferencia"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${service.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Comisión (5%):</span>
                  <span>${(parseFloat(service.price) * 0.05).toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-border pt-2 flex justify-between items-center">
                <span className="font-semibold">Total a pagar:</span>
                <span className="text-xl font-display font-bold text-primary">
                  ${(parseFloat(service.price) * 1.05).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleContract}
                className="flex-1 gradient-primary text-primary-foreground rounded-full shadow-primary-glow"
              >
                Contratar ahora
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmación */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="max-w-sm">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
          </motion.div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              ¡Servicio contratado!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Hemos confirmado tu pago. El freelancer será notificado pronto y
              se pondrá en contacto contigo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted rounded-lg p-4 my-4">
            <p className="text-xs text-muted-foreground mb-1">ID de orden:</p>
            <p className="font-mono text-sm font-semibold truncate">
              order_${Date.now()}
            </p>
          </div>
          <AlertDialogAction className="gradient-primary text-primary-foreground rounded-full">
            Entendido
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
