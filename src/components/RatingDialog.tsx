import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRatingStore } from "@/store/ratingStore";
import { Star } from "lucide-react";
import { useState } from "react";

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  freelancerId: string;
  clientId: string;
  orderId: string;
  freelancerName: string;
}

export const RatingDialog = ({
  open,
  onOpenChange,
  freelancerId,
  clientId,
  orderId,
  freelancerName,
}: RatingDialogProps) => {
  const { addReview } = useRatingStore();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Por favor escribe un comentario",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simular envío
    setTimeout(() => {
      addReview({
        freelancerId,
        clientId,
        orderId,
        rating,
        comment,
      });

      toast({
        title: "¡Rating enviado!",
        description: `Gracias por calificar a ${freelancerName}`,
      });

      setComment("");
      setRating(5);
      setIsSubmitting(false);
      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Califica a {freelancerName}</DialogTitle>
          <DialogDescription>
            Tu opinión ayuda a otros a encontrar los mejores freelancers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{rating}/5 estrellas</p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Comentario</label>
            <Textarea
              placeholder="Cuéntanos sobre tu experiencia con este freelancer..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gradient-primary text-primary-foreground"
            >
              {isSubmitting ? "Enviando..." : "Enviar Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
