"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  getJobApplications, 
  updateJobApplicationStatus, 
  updateJobApplicationDetails, 
  deleteJobApplication, 
  JobApplication 
} from "@/app/actions/tracker";
import { 
  Briefcase, MapPin, DollarSign, Trash2, ExternalLink, Sparkles, FileText, 
  StickyNote, ChevronRight, ChevronLeft, Loader2, Info, RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";

interface CVList {
  id: string;
  updated_at: string;
  title: string;
  content: any;
}

interface JobTrackerProps {
  cvs: CVList[];
}

// Columnas Kanban del Tablero
type Stage = "saved" | "applied" | "interviewing" | "offer" | "rejected";

interface KanbanColumn {
  id: Stage;
  colorClass: string;
  bgHeaderClass: string;
  bgClass: string;
  borderClass: string;
}

const columns: KanbanColumn[] = [
  { id: "saved", colorClass: "text-zinc-500", bgHeaderClass: "bg-zinc-100 dark:bg-zinc-800/40", bgClass: "bg-zinc-50/40 dark:bg-zinc-950/10", borderClass: "border-zinc-200/50 dark:border-zinc-800/30" },
  { id: "applied", colorClass: "text-blue-500", bgHeaderClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400", bgClass: "bg-blue-500/5", borderClass: "border-blue-500/10" },
  { id: "interviewing", colorClass: "text-amber-500", bgHeaderClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400", bgClass: "bg-amber-500/5", borderClass: "border-amber-500/10" },
  { id: "offer", colorClass: "text-emerald-500", bgHeaderClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", bgClass: "bg-emerald-500/5", borderClass: "border-emerald-500/10" },
  { id: "rejected", colorClass: "text-rose-500", bgHeaderClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400", bgClass: "bg-rose-500/5", borderClass: "border-rose-500/10" }
];

export function JobTracker({ cvs }: JobTrackerProps) {
  const t = useTranslations("Dashboard");

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [useLocal, setUseLocal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para edición/detalles de la postulación
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [selectedCvId, setSelectedCvId] = useState<string | null>("null");
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const [isPending, startTransition] = useTransition();

  // 1. Cargar postulaciones iniciales
  const loadTracker = () => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const res = await getJobApplications();
        if (res.useLocalStorage) {
          setUseLocal(true);
          const localData = localStorage.getItem("job_tracker_applications");
          if (localData) {
            setApplications(JSON.parse(localData));
          } else {
            setApplications([]);
          }
        } else {
          setApplications(res.data);
          setUseLocal(false);
        }
      } catch (error) {
        console.error("Error loading job applications tracker:", error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    loadTracker();
  }, []);

  // 2. Mover de columna rápido (hacia izquierda o derecha)
  const handleShiftStatus = async (app: JobApplication, direction: "left" | "right") => {
    const stages: Stage[] = ["saved", "applied", "interviewing", "offer", "rejected"];
    const currIdx = stages.indexOf(app.status);
    let nextIdx = currIdx + (direction === "right" ? 1 : -1);

    if (nextIdx < 0 || nextIdx >= stages.length) return;
    const newStatus = stages[nextIdx];

    const updatedApps = applications.map(a => 
      a.id === app.id ? { ...a, status: newStatus, updated_at: new Date().toISOString() } : a
    );
    setApplications(updatedApps);

    if (useLocal) {
      localStorage.setItem("job_tracker_applications", JSON.stringify(updatedApps));
      toast.success(t("stageUpdated"));
    } else {
      try {
        const res = await updateJobApplicationStatus(app.id, newStatus);
        if (res.useLocalStorage) {
          setUseLocal(true);
          localStorage.setItem("job_tracker_applications", JSON.stringify(updatedApps));
        }
        toast.success(t("stageUpdated"));
      } catch (error) {
        toast.error("Error al mover la tarjeta");
        loadTracker(); // revertir si falla
      }
    }
  };

  // 3. Eliminar postulación
  const handleDeleteApp = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(t("deleteConfirm"))) return;

    const updatedApps = applications.filter(app => app.id !== id);
    setApplications(updatedApps);

    if (useLocal) {
      localStorage.setItem("job_tracker_applications", JSON.stringify(updatedApps));
      toast.success(t("trackDelete"));
    } else {
      try {
        const res = await deleteJobApplication(id);
        if (res.useLocalStorage) {
          setUseLocal(true);
          localStorage.setItem("job_tracker_applications", JSON.stringify(updatedApps));
        }
        toast.success(t("trackDelete"));
      } catch (error) {
        toast.error("Error al eliminar la postulación");
        loadTracker();
      }
    }
  };

  // 4. Abrir modal para editar detalles (Notas y CV)
  const handleOpenEdit = (app: JobApplication) => {
    setEditingApp(app);
    setEditingNotes(app.notes || "");
    setSelectedCvId(app.cv_id || "null");
  };

  // 5. Guardar detalles
  const handleSaveDetails = async () => {
    if (!editingApp) return;
    setIsSavingDetails(true);

    const cvIdValue = selectedCvId === "null" ? null : selectedCvId;

    const updatedApps = applications.map(app => 
      app.id === editingApp.id 
        ? { ...app, notes: editingNotes, cv_id: cvIdValue, updated_at: new Date().toISOString() } 
        : app
    );
    setApplications(updatedApps);

    if (useLocal) {
      localStorage.setItem("job_tracker_applications", JSON.stringify(updatedApps));
      toast.success(t("notesSuccess"));
      setIsSavingDetails(false);
      setEditingApp(null);
    } else {
      try {
        const res = await updateJobApplicationDetails(editingApp.id, editingNotes, cvIdValue);
        if (res.useLocalStorage) {
          setUseLocal(true);
          localStorage.setItem("job_tracker_applications", JSON.stringify(updatedApps));
        }
        toast.success(t("notesSuccess"));
        setEditingApp(null);
      } catch (error) {
        toast.error("Error al guardar cambios");
        loadTracker();
      } finally {
        setIsSavingDetails(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Tablero Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-xl border border-border/40 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            {t("trackerTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("trackerSubtitle")}</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {useLocal && (
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1 flex items-center gap-1.5 rounded-full text-xs">
              <Info className="w-3.5 h-3.5" />
              Modo Local (Offline)
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={loadTracker} disabled={isLoading} className="cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Kanban Columns */}
      {isLoading && applications.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Cargando tablero Kanban...</p>
        </div>
      ) : applications.length === 0 ? (
        <Card className="border-dashed py-16 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <Briefcase className="w-12 h-12 text-muted-foreground mb-4 opacity-50 animate-pulse" />
          <h3 className="font-semibold text-lg">Tu tablero está vacío</h3>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-md px-4">
            {t("noTrackedJobs")}
          </p>
          <div className="flex gap-3 mt-6">
            <Button size="sm" variant="outline" asChild>
              <Link href="/builder">{t("createNew")}</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {columns.map((col) => {
            const colApps = applications.filter((app) => app.status === col.id);
            const titleKey = `stage${col.id.charAt(0).toUpperCase() + col.id.slice(1)}`;

            return (
              <div 
                key={col.id} 
                className={`rounded-xl border ${col.borderClass} ${col.bgClass} flex flex-col max-h-[80vh] overflow-hidden shadow-xs`}
              >
                {/* Column Header */}
                <div className={`p-3.5 border-b font-bold flex justify-between items-center ${col.bgHeaderClass}`}>
                  <span className="text-xs uppercase tracking-wider">{t(titleKey)}</span>
                  <Badge variant="outline" className="bg-background/80 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {colApps.length}
                  </Badge>
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 overflow-y-auto grow no-scrollbar min-h-48 max-h-[65vh]">
                  <AnimatePresence mode="popLayout">
                    {colApps.map((app, idx) => {
                      const associatedCv = cvs.find(c => c.id === app.cv_id);

                      return (
                        <motion.div
                          key={app.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => handleOpenEdit(app)}
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer border-border/70 hover:border-primary/40 bg-white dark:bg-zinc-900 p-3.5 relative overflow-hidden group">
                            {/* Card Body */}
                            <div className="space-y-3 text-xs">
                              <div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{app.company}</span>
                                <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 mt-0.5">{app.title}</h4>
                              </div>

                              {/* Card Metadata info */}
                              <div className="space-y-1.5 text-[10px] text-muted-foreground">
                                {app.location && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{app.location}</span>
                                  </div>
                                )}
                                {app.salary && app.salary !== "Salario no especificado" && (
                                  <div className="flex items-center gap-1.5">
                                    <DollarSign className="w-3 h-3 shrink-0" />
                                    <span className="font-medium text-foreground">{app.salary}</span>
                                  </div>
                                )}
                              </div>

                              {/* Associated CV Badge */}
                              {associatedCv && (
                                <Badge variant="secondary" className="bg-primary/5 border border-primary/10 text-[9px] text-primary px-1.5 py-0 rounded font-medium truncate max-w-full inline-flex items-center gap-1">
                                  <FileText className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{associatedCv.title}</span>
                                </Badge>
                              )}

                              {/* Card Actions Bottom */}
                              <div className="flex justify-between items-center pt-2.5 border-t border-border/30">
                                {/* Shift status left/right (Mobile friendly) */}
                                <div className="flex gap-1">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="w-6 h-6 rounded cursor-pointer shrink-0 disabled:opacity-30"
                                    disabled={app.status === "saved"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShiftStatus(app, "left");
                                    }}
                                  >
                                    <ChevronLeft className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="w-6 h-6 rounded cursor-pointer shrink-0 disabled:opacity-30"
                                    disabled={app.status === "rejected"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShiftStatus(app, "right");
                                    }}
                                  >
                                    <ChevronRight className="w-3 h-3" />
                                  </Button>
                                </div>

                                {/* Trash and icons */}
                                <div className="flex items-center gap-2">
                                  {app.notes && (
                                    <StickyNote className="w-3.5 h-3.5 text-amber-500/80 animate-pulse shrink-0" />
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-6 h-6 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded cursor-pointer shrink-0"
                                    onClick={(e) => handleDeleteApp(app.id, e)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editing / Notes Modal */}
      <Dialog open={!!editingApp} onOpenChange={(open) => !open && setEditingApp(null)}>
        {editingApp && (
          <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader className="pb-4 border-b space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{editingApp.company}</span>
              <DialogTitle className="text-lg font-bold">{editingApp.title}</DialogTitle>
              <DialogDescription className="text-xs flex gap-x-4 pt-1 flex-wrap">
                {editingApp.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {editingApp.location}</span>}
                {editingApp.salary && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {editingApp.salary}</span>}
              </DialogDescription>
            </DialogHeader>

            {/* Modal Body */}
            <div className="py-4 space-y-5 text-sm">
              {/* Associate CV selector */}
              <div className="space-y-2">
                <label className="font-bold text-xs text-foreground block flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  {t("associatedCv")}
                </label>
                <Select
                  value={selectedCvId || "null"}
                  onValueChange={(val) => setSelectedCvId(val)}
                >
                  <SelectTrigger className="w-full h-10 rounded-lg text-xs">
                    <SelectValue placeholder={t("selectCv")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">{t("noCvAssociated")}</SelectItem>
                    {cvs.map((cv) => (
                      <SelectItem key={cv.id} value={cv.id}>
                        {cv.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Private Notes textarea */}
              <div className="space-y-2">
                <label className="font-bold text-xs text-foreground block flex items-center gap-1.5">
                  <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                  {t("addNotes")}
                </label>
                <Textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Añade notas de entrevistas, salario negociado, contactos de reclutadores, fechas límite..."
                  className="w-full h-40 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 resize-none outline-none focus:ring-1 focus:ring-primary p-3"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <DialogFooter className="border-t pt-4 flex gap-3 flex-row items-center justify-end">
              {editingApp.apply_url && (
                <Button 
                  variant="outline" 
                  onClick={() => window.open(editingApp.apply_url, "_blank")} 
                  className="h-10 text-xs rounded-lg cursor-pointer mr-auto"
                >
                  Ver Oferta
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => setEditingApp(null)} 
                className="h-10 text-xs rounded-lg cursor-pointer"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveDetails} 
                disabled={isSavingDetails}
                className="h-10 text-xs rounded-lg cursor-pointer bg-linear-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95"
              >
                {isSavingDetails ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                {t("saveNotes")}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
