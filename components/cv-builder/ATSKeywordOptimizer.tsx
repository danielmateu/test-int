"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { analyzeATSJobFitAction, ATSJobFitAnalysis } from "@/app/actions/ai";
import { toast } from "sonner";
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Zap, 
  Loader2, 
  Plus, 
  AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CVData } from "./types";

interface ATSKeywordOptimizerProps {
  cvData: CVData;
  setData: (data: CVData) => void;
  locale: string;
  jobDescription: string;
  setJobDescription: (val: string) => void;
  analysis: ATSJobFitAnalysis | null;
  setAnalysis: (val: ATSJobFitAnalysis | null) => void;
}

export function ATSKeywordOptimizer({
  cvData,
  setData,
  locale,
  jobDescription,
  setJobDescription,
  analysis,
  setAnalysis
}: ATSKeywordOptimizerProps) {
  const t = useTranslations("ATSKeywordOptimizer");
  const [isPending, startTransition] = useTransition();
  
  // Local state to manage keywords in real-time
  const [matchingKeywords, setMatchingKeywords] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Escapar caracteres especiales para RegExp
  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  // Función inteligente de escaneo de palabra clave
  const checkKeywordInText = (text: string, kw: string) => {
    const escaped = escapeRegExp(kw);
    // Si contiene caracteres especiales como C++ o .NET, hacemos includes simple
    if (/[^a-zA-Z0-9_]/.test(kw)) {
      return text.toLowerCase().includes(kw.toLowerCase());
    }
    // De lo contrario, usamos límites de palabra para evitar falsos positivos
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(text);
  };

  // Compila todo el texto disponible en el CV actual en un solo string
  const getCVTextRepresentation = (cv: CVData): string => {
    let text = "";
    
    // Perfil profesional y puesto
    text += ` ${cv.personalInfo?.fullName || ""}`;
    text += ` ${cv.personalInfo?.jobTitle || ""}`;
    text += ` ${cv.personalInfo?.summary || ""}`;
    
    // Experiencia
    if (cv.experience && cv.experience.length > 0) {
      cv.experience.forEach(exp => {
        text += ` ${exp.role || ""} ${exp.company || ""} ${exp.description || ""}`;
      });
    }
    
    // Educación
    if (cv.education && cv.education.length > 0) {
      cv.education.forEach(edu => {
        text += ` ${edu.degree || ""} ${edu.institution || ""} ${edu.description || ""}`;
      });
    }
    
    // Habilidades
    if (cv.skills && cv.skills.length > 0) {
      text += ` ${cv.skills.join(" ")}`;
    }
    
    // Proyectos
    if (cv.projects && cv.projects.length > 0) {
      cv.projects.forEach(proj => {
        text += ` ${proj.name || ""} ${proj.description || ""}`;
      });
    }
    
    // Otros
    if (cv.other) {
      text += ` ${cv.other}`;
    }
    
    return text;
  };

  // Real-time scan engine: Runs locally whenever cvData or raw analysis changes
  useEffect(() => {
    if (!analysis) return;

    const cvText = getCVTextRepresentation(cvData);
    
    // Combine all discovered keywords from Gemini to have the total set
    const allKeywords = Array.from(new Set([...analysis.matchingKeywords, ...analysis.missingKeywords]));
    
    const matched: string[] = [];
    const missing: string[] = [];
    
    allKeywords.forEach(kw => {
      if (checkKeywordInText(cvText, kw)) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    });

    setMatchingKeywords(matched);
    setMissingKeywords(missing);

    // Calculate score dynamically based on keyword presence
    if (allKeywords.length > 0) {
      const baseRatio = matched.length / allKeywords.length;
      // Adjust score starting from the baseline score calculated by Gemini
      // to make it consistent, but reactive to changes
      const score = Math.round(baseRatio * 100);
      setCurrentScore(score);
    }
  }, [cvData, analysis]);

  const handleAnalyze = () => {
    if (!jobDescription.trim()) {
      toast.warning(t("placeholder"));
      return;
    }

    startTransition(async () => {
      try {
        const res = await analyzeATSJobFitAction(cvData, jobDescription, locale);
        setAnalysis(res);
        setMatchingKeywords(res.matchingKeywords);
        setMissingKeywords(res.missingKeywords);
        setCurrentScore(res.score);
        toast.success("Análisis de coincidencia completado");
      } catch (err: any) {
        toast.error(err.message || "Error al analizar coincidencia");
      }
    });
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success(t("copySuccess"));
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAddSkill = (skill: string) => {
    if (!cvData.skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
      const updatedSkills = [...cvData.skills, skill];
      setData({
        ...cvData,
        skills: updatedSkills
      });
      toast.success(`${t("addedToSkillsSuccess")} (${skill})`);
    } else {
      toast.info("Esta habilidad ya está en tu currículum.");
    }
  };

  // Helpers to render sections labels
  const getSectionLabel = (section: string) => {
    switch (section) {
      case "summary": return t("sectionSummary");
      case "experience": return t("sectionExperience");
      case "skills": return t("sectionSkills");
      case "projects": return t("sectionProjects");
      case "other": return t("sectionOther");
      default: return section;
    }
  };

  // Color helper for match score
  const getScoreColor = (score: number) => {
    if (score < 50) return "text-red-500 stroke-red-500";
    if (score < 75) return "text-amber-500 stroke-amber-500";
    return "text-emerald-500 stroke-emerald-500";
  };

  const getScoreBgCircleColor = (score: number) => {
    if (score < 50) return "stroke-red-100 dark:stroke-red-950/40";
    if (score < 75) return "stroke-amber-100 dark:stroke-amber-950/40";
    return "stroke-emerald-100 dark:stroke-emerald-950/40";
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border bg-card/60 backdrop-blur-md shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            {t("title")}
          </CardTitle>
          <CardDescription>
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={t("placeholder")}
            className="min-h-36 resize-y focus-visible:ring-primary rounded-xl"
            disabled={isPending}
          />
          <Button
            onClick={handleAnalyze}
            disabled={isPending}
            className="w-full h-11 text-sm font-medium rounded-xl relative overflow-hidden group cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("btnAnalyzing")}
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2 fill-primary-foreground text-primary-foreground group-hover:scale-120 group-hover:rotate-12 transition-transform duration-300" />
                {t("btnAnalyze")}
              </>
            )}
            <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {analysis ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Realtime Alert Banner */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-primary/95 leading-relaxed font-medium">
                {t("scanRealtimeAlert")}
              </p>
            </motion.div>

            {/* Score and Keyword Badges Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Radial Score Gauge Card */}
              <Card className="md:col-span-4 flex flex-col items-center justify-center p-6 border bg-card/40 backdrop-blur-md shadow-sm relative overflow-hidden">
                <CardHeader className="p-0 text-center pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("scoreLabel")}
                  </span>
                </CardHeader>
                <div className="relative flex items-center justify-center w-36 h-36">
                  {/* Radial progress ring */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="58"
                      className={`stroke-8 fill-none transition-colors duration-500 ${getScoreBgCircleColor(currentScore)}`}
                    />
                    <motion.circle
                      cx="72"
                      cy="72"
                      r="58"
                      className={`stroke-8 fill-none transition-all duration-500 ease-out ${getScoreColor(currentScore)}`}
                      strokeDasharray={2 * Math.PI * 58}
                      strokeDashoffset={2 * Math.PI * 58 * (1 - currentScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Internal Score Text */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <motion.span 
                      key={currentScore}
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-extrabold tracking-tight"
                    >
                      {currentScore}%
                    </motion.span>
                  </div>
                </div>
              </Card>

              {/* Keywords Pills Card */}
              <Card className="md:col-span-8 border bg-card/40 backdrop-blur-md shadow-sm">
                <CardContent className="p-6 space-y-5">
                  
                  {/* Missing Keywords list */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 dark:text-red-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      {t("missingKeywords", { count: missingKeywords.length })}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      <AnimatePresence>
                        {missingKeywords.length > 0 ? (
                          missingKeywords.map(kw => (
                            <motion.div
                              key={kw}
                              layoutId={`kw-${kw}`}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-950/60 select-none group"
                            >
                              <span>{kw}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleAddSkill(kw)}
                                className="w-4.5 h-4.5 rounded-full text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 p-0 cursor-pointer"
                                title={t("addToSkills")}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </Button>
                            </motion.div>
                          ))
                        ) : (
                          <motion.span 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="text-xs text-muted-foreground italic pl-1"
                          >
                            ¡Ninguna palabra clave ausente! Buen trabajo.
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <hr className="border-border/60" />

                  {/* Matching Keywords list */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      {t("matchingKeywords", { count: matchingKeywords.length })}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      <AnimatePresence>
                        {matchingKeywords.map(kw => (
                          <motion.div
                            key={kw}
                            layoutId={`kw-${kw}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-950/50 select-none"
                          >
                            <Check className="w-3.5 h-3.5 stroke-3 shrink-0" />
                            <span>{kw}</span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                </CardContent>
              </Card>

            </div>

            {/* AI Tailoring suggestions list */}
            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <Card className="border bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {t("suggestionsTitle")}
                  </CardTitle>
                  <CardDescription>
                    {t("suggestionsDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 border-t">
                  <div className="divide-y divide-border/60">
                    {analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="p-5 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                        <div className="shrink-0 flex items-center">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                            {getSectionLabel(suggestion.section)}
                          </span>
                        </div>
                        <div className="grow space-y-2">
                          <p className="text-sm font-medium text-foreground leading-relaxed">
                            {suggestion.tip}
                          </p>
                          {suggestion.phrasing && (
                            <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-border/80 rounded-xl p-3.5 relative group flex items-start gap-2 max-w-full">
                              <span className="text-xs text-muted-foreground leading-relaxed grow break-words font-mono select-all">
                                {suggestion.phrasing}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleCopy(suggestion.phrasing || "", index)}
                                className="w-7 h-7 hover:bg-zinc-200 dark:hover:bg-zinc-800 p-0 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                                title={t("copyTooltip")}
                              >
                                {copiedIndex === index ? (
                                  <Check className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-dashed py-12 rounded-2xl flex flex-col items-center justify-center text-center bg-zinc-50/20 dark:bg-zinc-900/5"
          >
            <Zap className="w-12 h-12 text-muted-foreground opacity-30 mb-4 animate-bounce" />
            <p className="text-sm text-muted-foreground px-6 max-w-xs">
              {t("noAnalysisYet")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
