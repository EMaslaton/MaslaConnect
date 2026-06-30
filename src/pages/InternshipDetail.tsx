import { ApplyInternshipDialog } from "@/components/ApplyInternshipDialog";
import { BottomNav } from "@/components/BottomNav";
import { Navbar } from "@/components/Navbar";
import { RegisterInternshipDialog } from "@/components/RegisterInternshipDialog";
import { SkillBadge } from "@/components/SkillBadge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useInternshipStore } from "@/store/internshipStore";
import {
  ArrowLeft,
  Building2,
  Clock,
  FileText,
  MapPin,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const modalityLabels: Record<string, string> = {
  presencial: "Presencial",
  remoto: "Remoto",
  hibrido: "Híbrido",
};

const InternshipDetail = () => {
  const { internshipId } = useParams();
  const { user } = useAuthStore();
  const { initializeInternships, getInternshipById } = useInternshipStore();
  const [applyOpen, setApplyOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    initializeInternships();
  }, [initializeInternships]);

  const internship = internshipId ? getInternshipById(internshipId) : undefined;

  if (!internship) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground mb-4">Pasantía no encontrada</p>
          <Link to="/pasantias">
            <Button variant="outline">Volver</Button>
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const handleApply = () => {
    if (!user?.internshipProfile?.seekingInternship) {
      setRegisterOpen(true);
      return;
    }
    setApplyOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Navbar />
      <div className="container max-w-3xl py-8 space-y-6">
        <Link
          to="/pasantias"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Pasantías
        </Link>

        <div className="rounded-2xl bg-card p-6 border space-y-4">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
              <Building2 className="w-4 h-4" />
              {internship.companyName}
            </p>
            <h1 className="text-2xl font-display font-bold">{internship.title}</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <SkillBadge label={internship.field} />
            {internship.skills.map((s) => (
              <SkillBadge key={s} label={s} variant="secondary" />
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {internship.location} · {modalityLabels[internship.modality]}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {internship.duration}
            </span>
            {internship.stipend && (
              <span className="flex items-center gap-1">
                <Wallet className="w-4 h-4" />
                {internship.stipend}
              </span>
            )}
          </div>

          <p className="text-foreground leading-relaxed">{internship.description}</p>

          {internship.requirements && (
            <div className="rounded-lg bg-muted/50 p-4 space-y-1">
              <p className="font-semibold flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4" />
                Requisitos
              </p>
              <p className="text-sm text-muted-foreground">{internship.requirements}</p>
            </div>
          )}

          {internship.schoolInfo && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="font-semibold text-sm mb-1">Documentación escolar</p>
              <p className="text-sm text-muted-foreground">{internship.schoolInfo}</p>
            </div>
          )}

          {user?.role === "freelancer" && (
            <Button
              onClick={handleApply}
              className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
            >
              Postularme a esta pasantía
            </Button>
          )}
        </div>
      </div>

      <ApplyInternshipDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        internship={internship}
      />
      <RegisterInternshipDialog open={registerOpen} onOpenChange={setRegisterOpen} />
      <BottomNav />
    </div>
  );
};

export default InternshipDetail;
