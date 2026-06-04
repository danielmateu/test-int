"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Brain, X, Copy, Check, FileText, 
  CornerDownLeft, Loader2, ArrowRight, Type, Sparkle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { generateCopilotContentAction } from "@/app/actions/ai";
import { CVData } from "./types";

interface AICopilotProps {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

export function AICopilot({ data, setData }: AICopilotProps) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"generate" | "improve">("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [section, setSection] = useState("summary");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  // Estados específicos para mejorar borrador
  const [draft, setDraft] = useState("");

  const handleGenerate = async () => {
    const activeText = tab === "generate" ? prompt : draft;
    if (!activeText.trim()) {
      toast.error(tab === "generate" ? "Escribe una instrucción primero." : "Escribe o pega un borrador primero.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await generateCopilotContentAction(
        activeText,
        tab === "generate" ? "generate" : "improve",
        section,
        locale
      );
      setResult(response);
      toast.success("¡Contenido optimizado por la IA!");
    } catch (err: any) {
      toast.error(err.message || "Error al procesar con IA.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickImprove = async (actionType: "improve" | "shorten" | "star" | "grammar") => {
    const activeText = tab === "generate" ? prompt : draft;
    if (!activeText.trim()) {
      toast.error("Ingresa texto para aplicar la mejora rápida.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await generateCopilotContentAction(
        activeText,
        actionType,
        section,
        locale
      );
      setResult(response);
      toast.success("¡Mejora rápida completada!");
    } catch (err: any) {
      toast.error(err.message || "Error al procesar.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!result) return;

    setData((prev) => {
      const next = { ...prev };
      if (section === "summary") {
        next.personalInfo = { ...next.personalInfo, summary: result };
      } else if (section === "coverLetter") {
        next.coverLetter = result;
      } else if (section === "other") {
        next.other = result;
      } else if (section === "skills") {
        const parsed = result.split(",").map((s) => s.trim()).filter(Boolean);
        next.skills = Array.from(new Set([...next.skills, ...parsed]));
      } else if (section === "experience") {
        const newExp = {
          id: Date.now().toString(),
          company: "Nueva Empresa / Organización",
          role: "Nuevo Puesto",
          startDate: "",
          endDate: "",
          description: result,
        };
        next.experience = [...next.experience, newExp];
      } else if (section === "projects") {
        const newProj = {
          id: Date.now().toString(),
          name: "Nuevo Proyecto",
          startDate: "",
          endDate: "",
          url: "",
          description: result,
        };
        next.projects = [...(next.projects || []), newProj];
      }
      return next;
    });

    const labelMap: Record<string, string> = {
      summary: "Perfil Profesional",
      experience: "Nueva Experiencia",
      projects: "Nuevo Proyecto",
      skills: "Habilidades",
      other: "Información Adicional",
      coverLetter: "Carta de Presentación",
    };
    toast.success(`Texto aplicado a la sección: ${labelMap[section]}`);
  };

  const clearAll = () => {
    setPrompt("");
    setDraft("");
    setResult("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden flex flex-col items-end gap-4 font-sans">
      {/* Expanded panel with glassmorphism */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-80 sm:w-96 rounded-2xl border bg-background/95 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col border-indigo-500/20 max-h-[520px]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 px-4 py-3.5 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Brain className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    Copiloto de Escritura IA
                    <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-indigo-500/20">
                      Beta
                    </span>
                  </h4>
                  <p className="text-[10px] text-muted-foreground">Tu redactor inteligente de CV</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content Tabs */}
            <div className="flex border-b text-[11px] font-bold bg-muted/20">
              <button
                onClick={() => { setTab("generate"); setResult(""); }}
                className={`flex-1 py-2.5 text-center cursor-pointer border-b-2 transition-all ${
                  tab === "generate" 
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-background" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Generar
              </button>
              <button
                onClick={() => { setTab("improve"); setResult(""); }}
                className={`flex-1 py-2.5 text-center cursor-pointer border-b-2 transition-all ${
                  tab === "improve" 
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-background" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Mejorar Borrador
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 max-h-[380px] no-scrollbar">
              {/* Context Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  Sección del currículum de destino:
                </label>
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger className="w-full h-8.5 text-xs rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50">
                    <SelectValue placeholder="Selecciona sección..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary" className="text-xs cursor-pointer">Perfil Profesional</SelectItem>
                    <SelectItem value="experience" className="text-xs cursor-pointer">Nueva Experiencia Laboral</SelectItem>
                    <SelectItem value="projects" className="text-xs cursor-pointer">Nuevo Proyecto</SelectItem>
                    <SelectItem value="skills" className="text-xs cursor-pointer">Habilidades / Competencias</SelectItem>
                    <SelectItem value="other" className="text-xs cursor-pointer">Información Adicional</SelectItem>
                    <SelectItem value="coverLetter" className="text-xs cursor-pointer">Carta de Presentación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Main Inputs */}
              {tab === "generate" ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    ¿Qué quieres que redacte la IA?
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ej. Escribe la descripción para un rol de Ingeniero Cloud gestionando Kubernetes y Terraform..."
                    className="w-full h-24 text-xs rounded-xl bg-zinc-50/20 dark:bg-zinc-950/20 resize-none p-3.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    Pega tu borrador o texto tosco:
                  </label>
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Ej. Fui el encargado de migrar la base de datos a AWS y funcionó un 30% más rápido..."
                    className="w-full h-24 text-xs rounded-xl bg-zinc-50/20 dark:bg-zinc-950/20 resize-none p-3.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold shadow-md text-white flex items-center justify-center gap-1.5"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Procesando con IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      {tab === "generate" ? "Redactar Contenido" : "Mejorar Borrador"}
                    </>
                  )}
                </Button>

                {/* Quick actions for fine tuning */}
                {((tab === "generate" && prompt.trim()) || (tab === "improve" && draft.trim())) && (
                  <div className="pt-2">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 text-center">
                      Ajustes rápidos:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleQuickImprove("improve")}
                        className="h-8 text-[10px] rounded-lg cursor-pointer flex items-center gap-1 bg-zinc-50/30 dark:bg-zinc-900/30"
                      >
                        👔 Profesionalizar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleQuickImprove("star")}
                        className="h-8 text-[10px] rounded-lg cursor-pointer flex items-center gap-1 bg-zinc-50/30 dark:bg-zinc-900/30"
                      >
                        ⭐ Método STAR
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleQuickImprove("shorten")}
                        className="h-8 text-[10px] rounded-lg cursor-pointer flex items-center gap-1 bg-zinc-50/30 dark:bg-zinc-900/30"
                      >
                        ✂️ Acortar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleQuickImprove("grammar")}
                        className="h-8 text-[10px] rounded-lg cursor-pointer flex items-center gap-1 bg-zinc-50/30 dark:bg-zinc-900/30"
                      >
                        ✍️ Ortografía
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Results area */}
              {result && (
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      Resultado propuesto:
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="h-6 text-[9px] text-muted-foreground hover:text-foreground cursor-pointer px-1.5"
                    >
                      Limpiar todo
                    </Button>
                  </div>
                  <div className="p-3.5 rounded-xl border border-indigo-500/10 bg-indigo-500/5 dark:bg-indigo-500/10 text-xs leading-relaxed max-h-[140px] overflow-y-auto no-scrollbar font-sans whitespace-pre-line text-foreground">
                    {result}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="h-8 text-[11px] rounded-lg cursor-pointer flex items-center gap-1 bg-background"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApply}
                      className="h-8 text-[11px] rounded-lg cursor-pointer flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    >
                      <CornerDownLeft className="w-3.5 h-3.5" />
                      Aplicar al CV
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-xl text-white transition-all duration-300 relative border border-white/10 ${
          isOpen
            ? "bg-zinc-800 hover:bg-zinc-900 border-zinc-700 hover:scale-105"
            : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-110 rotate-0 hover:rotate-12 hover:shadow-indigo-500/25 ring-4 ring-indigo-500/20"
        }`}
        title="Copiloto de Escritura IA"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative flex items-center justify-center"
            >
              <Sparkles className="w-6 h-6 fill-white/10" />
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500 border border-white/20"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
