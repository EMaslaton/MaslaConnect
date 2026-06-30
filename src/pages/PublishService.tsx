import { BottomNav } from "@/components/BottomNav";
import { Navbar } from "@/components/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { CATEGORIES } from "@/lib/mock-data";
import { validateCustomCategory, validateServiceDescription, validateServiceTitle } from "@/lib/moderation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useServiceStore } from "@/store/serviceStore";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Eye, X } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const PublishService = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    customCategory: "",
    description: "",
    includes: "",
    price: "",
    deliveryTime: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState("");
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addService } = useServiceStore();
  const totalSteps = 4;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < Math.min(files.length, 5 - images.length); i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImages((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    }

    // Limpiar el input para permitir subir el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!formData.title || !formData.category || !formData.description || !formData.price) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (!user) {
      setError("Debes estar autenticado para publicar un servicio");
      return;
    }

    const titleValidation = validateServiceTitle(formData.title);
    const descValidation = validateServiceDescription(formData.description);

    if (!titleValidation.isClean || titleValidation.severity === "high") {
      setError("El título contiene contenido inapropiado");
      return;
    }

    if (!descValidation.isClean || descValidation.severity === "high") {
      setError("La descripción contiene contenido inapropiado");
      return;
    }

    if (formData.category === "Otro") {
      const catValidation = validateCustomCategory(formData.customCategory);
      if (!catValidation.isClean || catValidation.severity === "high") {
        setError("La categoría personalizada contiene contenido inapropiado");
        return;
      }
    }

    setError("");
    setIsPublishing(true);

    try {
      const finalCategory =
        formData.category === "Otro" ? formData.customCategory : formData.category;

      const result = await addService({
        userId: user.id,
        userName: user.name,
        title: formData.title,
        description: formData.description,
        category: finalCategory,
        price: formData.price,
        rating: 0,
        reviews: 0,
        image: images[0],
        images: images.length > 0 ? images : undefined,
      });

      if (!result) {
        setError("No se pudo publicar el servicio. Intenta de nuevo.");
        return;
      }

      navigate(`/perfil/${user.id}`);
    } catch (err) {
      console.error("[PublishService] Error:", err);
      setError("Ocurrió un error al publicar el servicio");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="container max-w-lg py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Paso {step + 1} de {totalSteps}
            </span>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="text-sm text-primary flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Atrás
              </button>
            )}
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full gradient-primary rounded-full"
              animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  ¿Qué servicio ofreces?
                </h2>
                <p className="text-muted-foreground">
                  Dale un nombre y categoría a tu servicio
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Título del servicio</Label>
                  <Input
                    placeholder='Ej: "Diseño de Landing Page profesional"'
                    className="mt-1.5 rounded-xl"
                    value={formData.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setFormData({ ...formData, title: newTitle });
                      // Validar en tiempo real
                      const validation = validateServiceTitle(newTitle);
                      setValidationIssues(validation.issues);
                    }}
                  />
                  {validationIssues.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {validationIssues.map((issue, idx) => (
                        <p key={idx} className="text-xs text-destructive">{issue}</p>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Categoría</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.label}
                        onClick={() => {
                          setFormData({ ...formData, category: cat.label, customCategory: "" });
                          setValidationIssues([]);
                        }}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                          formData.category === cat.label
                            ? "gradient-primary text-primary-foreground"
                            : "bg-card shadow-card text-foreground hover:shadow-lg"
                        )}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {formData.category === "Otro" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Label>Cuéntanos cuál es tu categoría</Label>
                    <Input
                      placeholder="Ej: Copywriting especializado"
                      className="mt-1.5 rounded-xl"
                      value={formData.customCategory}
                      onChange={(e) => {
                        const newCategory = e.target.value;
                        setFormData({ ...formData, customCategory: newCategory });
                        // Validar categoría personalizada
                        if (newCategory.trim()) {
                          const validation = validateCustomCategory(newCategory);
                          setValidationIssues(validation.issues);
                        }
                      }}
                    />
                    {validationIssues.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {validationIssues.map((issue, idx) => (
                          <p key={idx} className="text-xs text-destructive">{issue}</p>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
                
                <Button
                  onClick={() => {
                    const selectedCategory = formData.category === "Otro" ? formData.customCategory : formData.category;
                    const titleValidation = validateServiceTitle(formData.title);
                    if (!titleValidation.isClean) {
                      setError("El título contiene contenido inapropiado");
                      return;
                    }
                    setStep(1);
                  }}
                  disabled={!formData.title || !formData.category || (formData.category === "Otro" && !formData.customCategory) || validationIssues.length > 0}
                  className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
                >
                  Continuar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Describe tu servicio
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    placeholder="¿Qué incluye? ¿Cómo trabajas? ¿Qué entregables ofreces?"
                    className="mt-1.5 rounded-xl min-h-[120px]"
                    value={formData.description}
                    onChange={(e) => {
                      const newDesc = e.target.value;
                      setFormData({ ...formData, description: newDesc });
                      // Validar en tiempo real
                      if (newDesc.trim()) {
                        const validation = validateServiceDescription(newDesc);
                        setValidationIssues(validation.issues);
                      }
                    }}
                  />
                  {validationIssues.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {validationIssues.map((issue, idx) => (
                        <p key={idx} className="text-xs text-destructive">{issue}</p>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formData.description.length}/2000 caracteres
                  </p>
                </div>
                <div>
                  <Label>¿Qué incluye? (uno por línea)</Label>
                  <Textarea
                    placeholder={
                      "Diseño en Figma\nRevisiones ilimitadas\nArchivos fuente"
                    }
                    className="mt-1.5 rounded-xl"
                    value={formData.includes}
                    onChange={(e) =>
                      setFormData({ ...formData, includes: e.target.value })
                    }
                  />
                </div>
                <Button
                  onClick={() => {
                    const descValidation = validateServiceDescription(formData.description);
                    if (!descValidation.isClean) {
                      setError("La descripción contiene contenido inapropiado");
                      return;
                    }
                    setError("");
                    setStep(2);
                  }}
                  disabled={!formData.description || validationIssues.length > 0}
                  className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
                >
                  Continuar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Precio y entrega
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Precio (USD)</Label>
                  <Input
                    type="number"
                    placeholder="Ej: 100"
                    className="mt-1.5 rounded-xl"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Puedes poner un precio fijo o "desde"
                  </p>
                </div>
                <div>
                  <Label>Tiempo de entrega estimado</Label>
                  <Input
                    placeholder="Ej: 3-5 días"
                    className="mt-1.5 rounded-xl"
                    value={formData.deliveryTime}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryTime: e.target.value })
                    }
                  />
                </div>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!formData.price}
                  className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
                >
                  Continuar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Muestra tu trabajo
                </h2>
                <p className="text-muted-foreground">
                  Sube imágenes de ejemplo (hasta 5)
                </p>
              </div>

              {/* Input file oculto */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Grid de imágenes */}
              <div className="grid grid-cols-2 gap-3">
                {/* Imágenes subidas */}
                {images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden relative group">
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-destructive/80 text-primary-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Botones para agregar más imágenes (hasta 5 total) */}
                {images.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors hover:bg-primary/5"
                  >
                    <span className="text-2xl">📷</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {images.length} de 5 imágenes subidas
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
                >
                  <Check className="w-4 h-4 mr-2" />{" "}
                  {isPublishing ? "Publicando..." : "Publicar servicio"}
                </Button>
                <Button
                  onClick={() => setPreviewOpen(true)}
                  variant="outline"
                  className="w-full rounded-xl h-11"
                >
                  <Eye className="w-4 h-4 mr-2" /> Vista previa
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Vista previa de tu servicio</DialogTitle>
              <DialogDescription>Así verán tu servicio los clientes</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Galería de imágenes */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Imágenes</p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Información del servicio */}
              <div className="space-y-3 border-t pt-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                    Categoría
                  </p>
                  <p className="text-sm">{formData.category}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                    Título
                  </p>
                  <p className="text-lg font-semibold">{formData.title}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                    Descripción
                  </p>
                  <p className="text-sm text-muted-foreground">{formData.description}</p>
                </div>

                {formData.includes && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                      ¿Qué incluye?
                    </p>
                    <ul className="text-sm space-y-1">
                      {formData.includes.split("\n").map((item, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-primary">✓</span>
                          <span>{item.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                      Precio
                    </p>
                    <p className="text-2xl font-bold text-primary">${formData.price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                      Entrega
                    </p>
                    <p className="text-sm">{formData.deliveryTime || "Sin especificar"}</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <BottomNav />
    </div>
  );
};

export default PublishService;
