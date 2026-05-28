"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getJobRecommendations, JobOffer } from "@/app/actions/jobs";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, MapPin, Briefcase, DollarSign, CheckCircle2, AlertTriangle, ExternalLink, Sparkles, Loader2, Building2, Check, X, Copy, Save, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateCoverLetterAction } from "@/app/actions/ai";
import { saveCoverLetterToCV } from "@/app/actions/cv";
import { addJobApplication, getJobApplications } from "@/app/actions/tracker";
import { toast } from "sonner";

interface RecommendedJobsProps {
  cvId: string;
  cvData: any;
  initialJobTitle?: string;
  initialSkills?: string[];
  jobs?: JobOffer[];
  setJobs?: React.Dispatch<React.SetStateAction<JobOffer[]>>;
  trackedJobUrls?: string[];
  setTrackedJobUrls?: React.Dispatch<React.SetStateAction<string[]>>;
}

export function RecommendedJobs({
  cvId,
  cvData,
  initialJobTitle = "",
  initialSkills = [],
  jobs: propJobs,
  setJobs: propSetJobs,
  trackedJobUrls: propTrackedJobUrls,
  setTrackedJobUrls: propSetTrackedJobUrls
}: RecommendedJobsProps) {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  
  const [localJobs, setLocalJobs] = useState<JobOffer[]>([]);
  const [localTrackedJobUrls, setLocalTrackedJobUrls] = useState<string[]>([]);

  const jobs = propJobs !== undefined ? propJobs : localJobs;
  const setJobs = propSetJobs !== undefined ? propSetJobs : setLocalJobs;

  const trackedJobUrls = propTrackedJobUrls !== undefined ? propTrackedJobUrls : localTrackedJobUrls;
  const setTrackedJobUrls = propSetTrackedJobUrls !== undefined ? propSetTrackedJobUrls : setLocalTrackedJobUrls;

  const [searchQuery, setSearchQuery] = useState(initialJobTitle);
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  
  const [isPending, startTransition] = useTransition();

  // Estados para la generación de la carta de presentación
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [isSavingLetter, setIsSavingLetter] = useState(false);

  // Resetear la carta generada cuando se cambia de oferta
  useEffect(() => {
    setGeneratedLetter("");
  }, [selectedJob]);

  // Cargar llaves de postulaciones ya seguidas desde Supabase o localStorage
  useEffect(() => {
    let active = true;
    const fetchTracked = async () => {
      try {
        const res = await getJobApplications();
        if (!active) return;
        
        let apps = [];
        if (res.useLocalStorage) {
          const localData = localStorage.getItem("job_tracker_applications");
          if (localData) apps = JSON.parse(localData);
        } else {
          apps = res.data;
        }
        
        const urls = apps
          .map((a: any) => (a.apply_url || a.applyUrl || "").toLowerCase().trim())
          .filter(Boolean);
        setTrackedJobUrls(urls);
      } catch (e) {
        console.error("Error reading tracked jobs:", e);
      }
    };
    fetchTracked();
    return () => {
      active = false;
    };
  }, []); // Cargar una sola vez al montar el componente

  // Manejar el guardado de la postulación
  const handleTrackJob = async (job: JobOffer, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const appData = {
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      type: job.type,
      status: "saved" as const,
      notes: "",
      apply_url: job.applyUrl,
      cv_id: cvId || null
    };

    const jobUrlKey = (job.applyUrl || "").toLowerCase().trim();

    try {
      const res = await addJobApplication(appData);
      
      if (res.useLocalStorage) {
        const localData = localStorage.getItem("job_tracker_applications");
        const existing = localData ? JSON.parse(localData) : [];
        
        const alreadyExists = existing.some((item: any) => 
          (item.apply_url || item.applyUrl || "").toLowerCase().trim() === jobUrlKey
        );
        
        if (alreadyExists) {
          toast.info("Esta oferta ya está en tu tablero de seguimiento");
          setTrackedJobUrls(prev => {
            if (prev.includes(jobUrlKey)) return prev;
            return [...prev, jobUrlKey];
          });
          return;
        }

        const newLocalApp = {
          ...appData,
          id: `local-job-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const updated = [newLocalApp, ...existing];
        localStorage.setItem("job_tracker_applications", JSON.stringify(updated));
        toast.success(t("trackSuccess"));
      } else {
        toast.success(t("trackSuccess"));
      }
      
      setTrackedJobUrls(prev => {
        if (prev.includes(jobUrlKey)) return prev;
        return [...prev, jobUrlKey];
      });
    } catch (error) {
      toast.error("Error al añadir la oferta a tu seguimiento");
    }
  };

  // Copiar carta al portapapeles
  const handleCopyLetter = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    toast.success("Carta de presentación copiada al portapapeles");
  };

  // Generar carta de presentación con IA
  const handleGenerateLetter = async () => {
    if (!selectedJob) return;
    try {
      setIsGeneratingLetter(true);
      const letter = await generateCoverLetterAction(
        cvData,
        selectedJob.title,
        selectedJob.company,
        selectedJob.description,
        locale
      );
      setGeneratedLetter(letter);
      toast.success("Carta de presentación redactada con éxito");
    } catch (error: any) {
      toast.error(error.message || "Error al generar la carta");
      console.error(error);
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  // Guardar carta de presentación en el CV
  const handleSaveLetter = async () => {
    if (!cvId || !generatedLetter) return;
    try {
      setIsSavingLetter(true);
      await saveCoverLetterToCV(cvId, generatedLetter);
      toast.success("¡Carta de presentación guardada con éxito en tu Currículum!");
    } catch (error: any) {
      toast.error(error.message || "Error al guardar la carta en el currículum");
      console.error(error);
    } finally {
      setIsSavingLetter(false);
    }
  };

  // Cargar ofertas iniciales basadas en el perfil de CV
  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getJobRecommendations(initialJobTitle, initialSkills, locale);
        setJobs(data);
      } catch (error) {
        console.error("Error loading initial job recommendations:", error);
      }
    });
  }, [initialJobTitle, initialSkills, locale]);

  // Manejar búsqueda en tiempo real
  const handleSearch = () => {
    startTransition(async () => {
      try {
        const data = await getJobRecommendations(searchQuery, initialSkills, locale);
        setJobs(data);
      } catch (error) {
        console.error("Error searching jobs:", error);
      }
    });
  };

  // Disparar búsqueda al presionar Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Filtrar ofertas por tipo de jornada localmente
  const filteredJobs = jobs.filter((job) => {
    if (filterType === "all") return true;
    if (filterType === "remote") return job.type === "Remoto";
    if (filterType === "hybrid") return job.type === "Híbrido";
    if (filterType === "onsite") return job.type === "Presencial";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Search Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-xl border border-border/40 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            {t("jobsTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("jobsSubtitle")}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center grow md:max-w-xl">
          <div className="relative grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("searchPlaceholder")}
              className="pl-9 h-10 w-full rounded-lg"
            />
          </div>
          <Button onClick={handleSearch} disabled={isPending} className="h-10 cursor-pointer">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {t("edit")} {/* Usamos "edit" de forma genérica como buscar, o reusar traducciones */}
            Buscar
          </Button>
        </div>
      </div>

      {/* Tabs / Filter Badges */}
      <div className="flex flex-wrap gap-2 pb-1">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          onClick={() => setFilterType("all")}
          size="sm"
          className="rounded-full h-8 cursor-pointer"
        >
          {t("allTypes")}
        </Button>
        <Button
          variant={filterType === "remote" ? "default" : "outline"}
          onClick={() => setFilterType("remote")}
          size="sm"
          className="rounded-full h-8 cursor-pointer"
        >
          {t("remote")}
        </Button>
        <Button
          variant={filterType === "hybrid" ? "default" : "outline"}
          onClick={() => setFilterType("hybrid")}
          size="sm"
          className="rounded-full h-8 cursor-pointer"
        >
          {t("hybrid")}
        </Button>
        <Button
          variant={filterType === "onsite" ? "default" : "outline"}
          onClick={() => setFilterType("onsite")}
          size="sm"
          className="rounded-full h-8 cursor-pointer"
        >
          {t("onsite")}
        </Button>
      </div>

      {/* Job Grid / Empty State */}
      {isPending && jobs.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Buscando ofertas compatibles...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="border-dashed py-12 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <Briefcase className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-semibold text-lg">No encontramos ofertas</h3>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm px-4">
            Intenta cambiar los términos de búsqueda o añade más habilidades a tu Currículum para ver más resultados.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredJobs.map((job, idx) => {
              const isHighMatch = job.matchScore >= 85;
              const isMediumMatch = job.matchScore >= 70 && job.matchScore < 85;

              return (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="h-full"
                >
                  <Card 
                    className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-border/60 hover:border-primary/50 cursor-pointer group bg-white dark:bg-zinc-900 overflow-hidden relative"
                    onClick={() => setSelectedJob(job)}
                  >
                    {/* Top glassmorphic gradient bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-purple-500 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity" />

                    <CardHeader className="pb-3 relative">
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1 grow">
                          <Badge variant="secondary" className="bg-primary/5 text-primary border border-primary/10 rounded-full font-semibold px-2.5 py-0.5 text-xs mb-1.5 inline-block">
                            {job.company}
                          </Badge>
                          <CardTitle className="text-base font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {job.title}
                          </CardTitle>
                        </div>

                        {/* Match Circle */}
                        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                          <svg className="w-12 h-12 -rotate-90">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              className="stroke-zinc-100 dark:stroke-zinc-800"
                              strokeWidth="3.5"
                              fill="transparent"
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              className={`transition-all duration-1000 ${
                                isHighMatch 
                                  ? "stroke-emerald-500" 
                                  : isMediumMatch 
                                    ? "stroke-amber-500" 
                                    : "stroke-blue-500"
                              }`}
                              strokeWidth="3.5"
                              fill="transparent"
                              strokeDasharray="125.6"
                              strokeDashoffset={125.6 - (125.6 * job.matchScore) / 100}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-[10px] font-extrabold leading-none">{job.matchScore}%</span>
                            <span className="text-[6px] text-muted-foreground uppercase scale-85 mt-0.5">{t("matchScore")}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="grow text-sm text-muted-foreground space-y-4 pb-4">
                      {/* Job Metadata details */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          <span className="font-medium text-foreground">{job.salary}</span>
                        </div>
                      </div>

                      {/* Text Snippet */}
                      <p className="line-clamp-3 text-xs leading-relaxed">
                        {job.description}
                      </p>

                      {/* Matching skills tags inside Card */}
                      {job.skillsMatched.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider block">
                            Habilidades coincidentes:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {job.skillsMatched.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-medium rounded">
                                {skill}
                              </Badge>
                            ))}
                            {job.skillsMatched.length > 3 && (
                              <span className="text-[9px] text-muted-foreground font-medium pl-1 self-center">
                                +{job.skillsMatched.length - 3} más
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-3 border-t border-border/40 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between gap-2">
                      <Button variant="ghost" size="sm" className="w-full text-xs font-semibold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                        {t("viewDetails")}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`px-3 text-xs font-semibold rounded-lg cursor-pointer shrink-0 ${trackedJobUrls.includes((job.applyUrl || "").toLowerCase().trim()) ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10' : 'border-border/60 hover:border-primary/40 text-muted-foreground hover:text-primary'}`}
                        disabled={trackedJobUrls.includes((job.applyUrl || "").toLowerCase().trim())}
                        onClick={(e) => handleTrackJob(job, e)}
                      >
                        {trackedJobUrls.includes((job.applyUrl || "").toLowerCase().trim()) ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </Button>

                      <Button 
                        size="sm" 
                        className="w-full text-xs font-semibold rounded-lg cursor-pointer bg-linear-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(job.applyUrl, "_blank");
                        }}
                      >
                        {t("applyNow")}
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Details Dialog / Modal */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        {selectedJob && (
          <DialogContent className="max-w-2xl rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
            <DialogHeader className="space-y-2 pb-4 border-b">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <Badge className="bg-primary/10 text-primary border-primary/20 rounded font-semibold text-xs mb-1">
                    {selectedJob.company}
                  </Badge>
                  <DialogTitle className="text-xl font-bold leading-tight">
                    {selectedJob.title}
                  </DialogTitle>
                  <DialogDescription className="flex flex-wrap gap-x-4 gap-y-2 text-xs pt-1.5">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {selectedJob.location}</span>
                    <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {selectedJob.type}</span>
                    <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> {selectedJob.salary}</span>
                  </DialogDescription>
                </div>

                {/* Match indicator inside modal */}
                <div className="shrink-0 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-2 rounded-xl">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <div className="text-right leading-none">
                    <div className="text-base font-extrabold">{selectedJob.matchScore}%</div>
                    <div className="text-[7px] font-bold uppercase tracking-wider mt-0.5">{t("matchScore")}</div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Modal Body */}
            <div className="py-4 space-y-6 text-sm">
              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  {t("jobDetails")}
                </h4>
                <p className="text-muted-foreground leading-relaxed text-xs">
                  {selectedJob.description}
                </p>
              </div>

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border">
                {/* Matched skills */}
                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {t("skillsMatched")} ({selectedJob.skillsMatched.length})
                  </h5>
                  {selectedJob.skillsMatched.length === 0 ? (
                    <span className="text-xs text-muted-foreground block italic">Ninguna coincidencia directa</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedJob.skillsMatched.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 rounded px-2 py-0.5 text-[10px] font-medium">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Missing skills */}
                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    {t("skillsMissing")} ({selectedJob.skillsMissing.length})
                  </h5>
                  {selectedJob.skillsMissing.length === 0 ? (
                    <span className="text-xs text-muted-foreground block italic">¡Cumples con todos los requerimientos!</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedJob.skillsMissing.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 rounded px-2 py-0.5 text-[10px] font-medium">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements & Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Requirements */}
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground">{t("requirements")}</h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {selectedJob.requirements.map((req, idx) => {
                      const isMatched = selectedJob.skillsMatched.includes(req);
                      return (
                        <li key={idx} className="flex items-start gap-2">
                          {isMatched ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          )}
                          <span className={isMatched ? "text-foreground font-medium" : ""}>{req}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground">{t("benefits")}</h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {selectedJob.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Generador de Carta de Presentación con IA */}
              <div className="border-t pt-6 space-y-4">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  Carta de Presentación Inteligente (Gemini IA)
                </h4>
                {generatedLetter ? (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <textarea
                      value={generatedLetter}
                      onChange={(e) => setGeneratedLetter(e.target.value)}
                      className="w-full h-64 p-3 text-xs bg-zinc-50 dark:bg-zinc-950 border rounded-lg resize-y focus:ring-1 focus:ring-primary outline-none font-sans leading-relaxed text-foreground"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopyLetter} className="text-xs shrink-0 cursor-pointer">
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copiar al portapapeles
                      </Button>
                      <Button variant="secondary" size="sm" onClick={handleSaveLetter} disabled={isSavingLetter} className="text-xs grow cursor-pointer">
                        {isSavingLetter ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                        Guardar directamente en mi Currículum
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleGenerateLetter}
                    disabled={isGeneratingLetter}
                    className="w-full text-xs font-semibold rounded-lg cursor-pointer border-primary/30 hover:border-primary text-primary hover:bg-primary/5 flex items-center justify-center gap-2"
                  >
                    {isGeneratingLetter ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-primary mr-1.5" />
                        Redactando carta personalizada con Gemini...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-primary" />
                        Redactar Carta de Presentación con Gemini IA
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <DialogFooter className="border-t pt-4 flex flex-row items-center justify-end gap-3 shrink-0">
              <Button 
                variant="outline" 
                disabled={trackedJobUrls.includes((selectedJob.applyUrl || "").toLowerCase().trim())}
                onClick={() => handleTrackJob(selectedJob)}
                className={`h-10 text-xs rounded-lg cursor-pointer mr-auto flex items-center gap-1.5 ${trackedJobUrls.includes((selectedJob.applyUrl || "").toLowerCase().trim()) ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5' : 'border-primary/20 hover:border-primary/40 text-primary hover:bg-primary/5'}`}
              >
                {trackedJobUrls.includes((selectedJob.applyUrl || "").toLowerCase().trim()) ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    En Seguimiento
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4 text-primary" />
                    {t("trackJob")}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setSelectedJob(null)} className="h-10 text-xs rounded-lg cursor-pointer">
                Cerrar
              </Button>
              <Button 
                className="h-10 text-xs rounded-lg cursor-pointer bg-linear-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95"
                onClick={() => window.open(selectedJob.applyUrl, "_blank")}
              >
                {t("applyNow")}
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
