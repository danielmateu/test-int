"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Sparkles, Loader2, Award, ArrowRight, RefreshCw, AlertTriangle, CheckCircle2, 
  ChevronRight, ChevronDown, Building2, User, MessageSquare, Trash2,
  Mic, MicOff, Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { 
  generateInterviewQuestionsAction, 
  evaluateInterviewAnswersAction, 
  InterviewEvaluation 
} from "@/app/actions/ai";
import { getJobApplications } from "@/app/actions/tracker";
import { 
  saveInterviewSimulationAction, 
  getInterviewSimulationsAction, 
  deleteInterviewSimulationAction,
  type InterviewSimulationRecord
} from "@/app/actions/interview";

interface CVList {
  id: string;
  updated_at: string;
  title: string;
  content: any;
}

interface JobApplication {
  id: string;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  type?: string;
  status: string;
  notes?: string;
  apply_url?: string;
  cv_id?: string | null;
}

interface InterviewSimulatorProps {
  cvs: CVList[];
  applications?: JobApplication[];
  isPremium?: boolean;
  onUpgradeClick?: () => void;
}

const voiceTranslations: Record<string, {
  micTooltip: string;
  micListening: string;
  micError: string;
  micUnsupported: string;
  speakQuestion: string;
  stopSpeaking: string;
  voiceTextToggle: string;
  recordingActive: string;
}> = {
  es: {
    micTooltip: "Responder por voz (Voice-to-Text)",
    micListening: "Escuchando... habla ahora. Clica para detener.",
    micError: "Error de acceso al micrófono. Comprueba los permisos en tu navegador.",
    micUnsupported: "El reconocimiento de voz no está soportado en este navegador.",
    speakQuestion: "Escuchar pregunta (Text-to-Speech)",
    stopSpeaking: "Detener voz",
    voiceTextToggle: "Escritura manual",
    recordingActive: "Grabando respuesta..."
  },
  en: {
    micTooltip: "Answer by voice (Voice-to-Text)",
    micListening: "Listening... speak now. Click to stop.",
    micError: "Microphone access error. Check your browser permissions.",
    micUnsupported: "Speech recognition is not supported in this browser.",
    speakQuestion: "Listen to question (Text-to-Speech)",
    stopSpeaking: "Stop audio",
    voiceTextToggle: "Type manually",
    recordingActive: "Recording answer..."
  },
  ca: {
    micTooltip: "Respondre per veu (Voice-to-Text)",
    micListening: "Escoltant... parla ara. Clica per aturar.",
    micError: "Error d'accés al micròfon. Comprova els permisos al navegador.",
    micUnsupported: "El reconeixement de veu no és compatible amb aquest navegador.",
    speakQuestion: "Escoltar pregunta (Text-to-Speech)",
    stopSpeaking: "Aturar veu",
    voiceTextToggle: "Escriptura manual",
    recordingActive: "Enregistrant resposta..."
  },
  fr: {
    micTooltip: "Répondre par voix (Voice-to-Text)",
    micListening: "Écoute en cours... parlez maintenant. Cliquez pour arrêter.",
    micError: "Erreur d'accès au microphone. Vérifiez les permissions du navigateur.",
    micUnsupported: "La reconnaissance vocale n'est pas supportée par ce navigateur.",
    speakQuestion: "Écouter la question (Text-to-Speech)",
    stopSpeaking: "Arrêter l'audio",
    voiceTextToggle: "Écrire manuellement",
    recordingActive: "Enregistrement de la réponse..."
  },
  de: {
    micTooltip: "Per Sprache antworten (Voice-to-Text)",
    micListening: "Zuhören... jetzt sprechen. Klicken zum Stoppen.",
    micError: "Fehler beim Mikrofonzugriff. Überprüfen Sie die Browserberechtigungen.",
    micUnsupported: "Spracherkennung wird in diesem Browser nicht unterstützt.",
    speakQuestion: "Frage anhören (Text-to-Speech)",
    stopSpeaking: "Audio stoppen",
    voiceTextToggle: "Manuell eingeben",
    recordingActive: "Antwort wird aufgenommen..."
  },
  it: {
    micTooltip: "Rispondi a voce (Voice-to-Text)",
    micListening: "Ascolto... parla ora. Clicca per fermare.",
    micError: "Errore di accesso al microfono. Controlla i permessi del browser.",
    micUnsupported: "Il riconoscimento vocale non è supportato in questo browser.",
    speakQuestion: "Ascolta la domanda (Text-to-Speech)",
    stopSpeaking: "Ferma audio",
    voiceTextToggle: "Scrittura manuale",
    recordingActive: "Registrazione resposta..."
  },
  pt: {
    micTooltip: "Responder por voz (Voice-to-Text)",
    micListening: "Ouvindo... fale agora. Clique para parar.",
    micError: "Erro de acesso ao microfone. Verifique as permissões do navegador.",
    micUnsupported: "O reconhecimento de voz não é suportado neste navegador.",
    speakQuestion: "Ouvir pergunta (Text-to-Speech)",
    stopSpeaking: "Parar áudio",
    voiceTextToggle: "Digitação manual",
    recordingActive: "Gravando resposta..."
  }
};

export function InterviewSimulator({
  cvs,
  applications,
  isPremium = false,
  onUpgradeClick
}: InterviewSimulatorProps) {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const router = useRouter();
  const voiceTrans = voiceTranslations[locale] || voiceTranslations["es"];

  const [step, setStep] = useState<"setup" | "questions" | "results">("setup");
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Datos del empleo para la simulación
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Preguntas y respuestas
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(""));
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Evaluación final
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  
  // Pregunta activa para expandir en los resultados
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(0);

  // Cargado local fallback si no se proporciona como prop
  const [localApplications, setLocalApplications] = useState<JobApplication[]>([]);

  // Historial de simulaciones
  const [history, setHistory] = useState<InterviewSimulationRecord[]>([]);
  const [useLocalHistory, setUseLocalHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [recordToDeleteId, setRecordToDeleteId] = useState<string | null>(null);

  // Voice Simulator States and Ref
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const recognitionRef = React.useRef<any>(null);

  const startRecording = () => {
    if (typeof window === "undefined") return;

    // Stop Text-to-Speech if active
    stopSpeaking();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(voiceTranslations[locale]?.micUnsupported || voiceTranslations["en"].micUnsupported);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      const langMap: Record<string, string> = {
        es: "es-ES",
        en: "en-US",
        fr: "fr-FR",
        de: "de-DE",
        it: "it-IT",
        pt: "pt-BR",
        ca: "ca-ES"
      };
      recognition.lang = langMap[locale] || "es-ES";

      const initialAnswer = answers[currentQuestionIdx] || "";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentTranscript = (initialAnswer ? initialAnswer + " " : "") + finalTranscript + interimTranscript;
        setAnswers(prev => {
          const next = [...prev];
          next[currentQuestionIdx] = currentTranscript;
          return next;
        });
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        if (event.error === "not-allowed") {
          toast.error(voiceTranslations[locale]?.micError || voiceTranslations["en"].micError);
        } else if (event.error !== "aborted") {
          toast.error(`Error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Speech recognition initialization error:", err);
      toast.error("No se pudo iniciar el reconocimiento de voz.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setIsRecording(false);
  };

  const speakQuestion = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Stop voice recording if active
    stopRecording();

    if (isPlayingQuestion) {
      window.speechSynthesis.cancel();
      setIsPlayingQuestion(false);
      return;
    }

    // Stop any ongoing synthesis
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      es: "es-ES",
      en: "en-US",
      fr: "fr-FR",
      de: "de-DE",
      it: "it-IT",
      pt: "pt-BR",
      ca: "ca-ES"
    };
    utterance.lang = langMap[locale] || "es-ES";

    utterance.onend = () => {
      setIsPlayingQuestion(false);
    };
    utterance.onerror = () => {
      setIsPlayingQuestion(false);
    };

    setIsPlayingQuestion(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingQuestion(false);
  };

  // Detener voz y grabación al cambiar de pregunta o salir de la sección de preguntas
  useEffect(() => {
    stopRecording();
    stopSpeaking();
    return () => {
      stopRecording();
      stopSpeaking();
    };
  }, [currentQuestionIdx, step]);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await getInterviewSimulationsAction();
      if (res.useLocalStorage) {
        setUseLocalHistory(true);
        const localData = localStorage.getItem("job_interview_simulations");
        if (localData) {
          setHistory(JSON.parse(localData));
        } else {
          setHistory([]);
        }
      } else {
        setHistory(res.data);
        setUseLocalHistory(false);
      }
    } catch (error) {
      console.error("Error loading interview history:", error);
      setUseLocalHistory(true);
      const localData = localStorage.getItem("job_interview_simulations");
      if (localData) {
        setHistory(JSON.parse(localData));
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (applications) return;

    const loadTracker = async () => {
      try {
        const res = await getJobApplications();
        if (res.useLocalStorage) {
          const localData = localStorage.getItem("job_tracker_applications");
          if (localData) {
            setLocalApplications(JSON.parse(localData));
          }
        } else {
          setLocalApplications(res.data);
        }
      } catch (error) {
        console.error("Error loading job applications in simulator:", error);
      }
    };
    loadTracker();
  }, [applications]);

  useEffect(() => {
    loadHistory();
  }, []);

  const appsToUse = applications || localApplications;
  const activeCV = cvs[0];

  // 1. Manejar la selección de una oferta guardada
  const handleSelectJobApp = (appId: string) => {
    if (appId === "manual") {
      setJobTitle("");
      setCompany("");
      setJobDescription("");
      return;
    }
    const app = appsToUse.find(a => a.id === appId);
    if (app) {
      setJobTitle(app.title);
      setCompany(app.company);
      // Para la descripción, si está vacía intentamos poner algo básico o dejarlo listo para que lo edite
      setJobDescription(app.notes || "");
    }
  };

  // 2. Iniciar la simulación: Generar preguntas
  const handleStartSimulation = async () => {
    if (!activeCV) {
      toast.error(t("noCvs"));
      return;
    }

    if (!jobTitle.trim() || !company.trim()) {
      toast.error("Por favor, introduce el título del empleo y la empresa");
      return;
    }

    setIsLoading(true);
    try {
      const qs = await generateInterviewQuestionsAction(
        activeCV.content,
        jobTitle,
        company,
        jobDescription || "Puesto de desarrollador con enfoque en entrega continua.",
        locale
      );
      
      setQuestions(qs);
      setAnswers(Array(qs.length).fill(""));
      setCurrentQuestionIdx(0);
      setStep("questions");
      toast.success("¡Preguntas generadas con éxito! Buena suerte.");
    } catch (err: any) {
      toast.error(err.message || "Error al generar las preguntas");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Responder pregunta y avanzar
  const handleNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  // retroceder pregunta
  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  // Omitir pregunta actual
  const handleSkipQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIdx] = "(Pregunta omitida por el candidato)";
    setAnswers(newAnswers);
    handleNextQuestion();
  };

  // 4. Finalizar y evaluar
  const handleSubmitInterview = async () => {
    if (!activeCV) return;

    stopRecording();
    stopSpeaking();
    setIsEvaluating(true);
    try {
      const QA = questions.map((q, idx) => ({
        question: q,
        answer: answers[idx] || "(Sin respuesta)"
      }));

      const res = await evaluateInterviewAnswersAction(
        activeCV.content,
        jobTitle,
        company,
        jobDescription || "Puesto de desarrollador.",
        QA,
        locale
      );

      setEvaluation(res);
      setStep("results");
      setExpandedQuestionIdx(0);
      toast.success("¡Evaluación completada con éxito!");

      // Guardar simulación en historial
      await handleSaveSimulation(res);
    } catch (err: any) {
      toast.error(err.message || "Error al evaluar la entrevista");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveSimulation = async (evalRes: InterviewEvaluation) => {
    try {
      const QA = questions.map((q, idx) => ({
        question: q,
        answer: answers[idx] || "(Sin respuesta)"
      }));

      const res = await saveInterviewSimulationAction(
        activeCV?.id || null,
        jobTitle,
        company,
        jobDescription || "",
        evalRes.score,
        evalRes.overallFeedback,
        QA,
        evalRes.analysis
      );

      if (res.useLocalStorage) {
        const newRecord: InterviewSimulationRecord = {
          id: Math.random().toString(36).substr(2, 9),
          user_id: "local",
          cv_id: activeCV?.id || null,
          job_title: jobTitle,
          company: company,
          job_description: jobDescription,
          score: evalRes.score,
          overall_feedback: evalRes.overallFeedback,
          qa_data: QA,
          analysis_data: evalRes.analysis,
          created_at: new Date().toISOString()
        };
        const updatedHistory = [newRecord, ...history];
        setHistory(updatedHistory);
        localStorage.setItem("job_interview_simulations", JSON.stringify(updatedHistory));
      } else if (res.data) {
        setHistory(prev => [res.data!, ...prev]);
      }
      toast.success(t("interviewHistorySaveSuccess"));
    } catch (err) {
      console.error("Error saving simulation:", err);
    }
  };

  const handleViewPastEvaluation = (record: InterviewSimulationRecord) => {
    setJobTitle(record.job_title);
    setCompany(record.company);
    setJobDescription(record.job_description || "");

    const qs = record.qa_data.map(qa => qa.question);
    const ans = record.qa_data.map(qa => qa.answer);
    setQuestions(qs);
    setAnswers(ans);

    const evalRes: InterviewEvaluation = {
      score: record.score,
      overallFeedback: record.overall_feedback,
      analysis: record.analysis_data
    };
    setEvaluation(evalRes);
    setStep("results");
    setExpandedQuestionIdx(0);
  };

  const confirmDeleteHistoryItem = async () => {
    if (!recordToDeleteId) return;

    const updatedHistory = history.filter(item => item.id !== recordToDeleteId);
    setHistory(updatedHistory);

    if (useLocalHistory) {
      localStorage.setItem("job_interview_simulations", JSON.stringify(updatedHistory));
      toast.success(t("interviewHistoryDeleteSuccess"));
      setRecordToDeleteId(null);
    } else {
      try {
        const res = await deleteInterviewSimulationAction(recordToDeleteId);
        if (res.useLocalStorage) {
          setUseLocalHistory(true);
          localStorage.setItem("job_interview_simulations", JSON.stringify(updatedHistory));
        }
        toast.success(t("interviewHistoryDeleteSuccess"));
      } catch (err) {
        toast.error("Error al eliminar del historial");
        loadHistory();
      } finally {
        setRecordToDeleteId(null);
      }
    }
  };

  // 5. Reiniciar simulación
  const handleRestart = () => {
    setStep("setup");
    setQuestions([]);
    setAnswers([]);
    setEvaluation(null);
    setCurrentQuestionIdx(0);
    loadHistory();
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-xl border border-border/40 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            {t("interviewTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("interviewSubtitle")}</p>
        </div>

        {step === "results" && (
          <Button onClick={handleRestart} variant="outline" className="cursor-pointer h-10 text-xs">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("interviewRestart")}
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: CONFIGURATION / SETUP */}
        {step === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-border/60 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-purple-500 to-blue-500 opacity-80" />
              
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  {t("interviewSetupTitle")}
                </CardTitle>
                <CardDescription>
                  Configura los detalles de la oferta para que Gemini formule preguntas adaptadas a tu CV ({activeCV?.title || "Sin CV"}).
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {!isPremium && history.length >= 2 && (
                  <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-lg flex gap-2.5 items-start text-xs text-amber-700 dark:text-amber-400 font-medium">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold">Límite de Simulaciones Guardadas Alcanzado (2/2)</p>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">Has guardado el máximo de 2 simulaciones de entrevista de tu plan gratuito. ¡Mejora al Plan Premium para simular sin límites!</p>
                    </div>
                  </div>
                )}
                {/* Select from applications tracker */}
                {appsToUse.length > 0 ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">
                      {t("interviewSelectJob")}
                    </label>
                    <Select onValueChange={handleSelectJobApp}>
                      <SelectTrigger className="w-full h-10 rounded-lg text-xs">
                        <SelectValue placeholder="Selecciona una de tus ofertas seguidas..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">-- Rellenar manualmente --</SelectItem>
                        {appsToUse.map((app) => (
                          <SelectItem key={app.id} value={app.id}>
                            {app.title} - {app.company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-dashed flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      {t("interviewNoJobTracked")}
                    </span>
                  </div>
                )}

                {/* Manual Form fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground block">
                        Título del Puesto
                      </label>
                      <Input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder={t("interviewJobTitlePlaceholder")}
                        className="h-10 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground block">
                        Empresa
                      </label>
                      <Input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder={t("interviewCompanyPlaceholder")}
                        className="h-10 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">
                      Descripción del Empleo / Requisitos (Opcional)
                    </label>
                    <Textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder={t("interviewDescPlaceholder")}
                      className="h-32 rounded-lg text-xs bg-zinc-50/50 dark:bg-zinc-950/50 resize-none"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t pt-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                {!isPremium && history.length >= 2 ? (
                  <Button
                    onClick={onUpgradeClick}
                    className="w-full cursor-pointer bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-500/95 hover:to-teal-600/95 text-xs font-bold rounded-lg h-10 shadow-md text-white flex items-center justify-center gap-1.5 animate-pulse"
                  >
                    <Sparkles className="w-4 h-4 fill-white text-white" />
                    Desbloquear Simulaciones Ilimitadas (Upgrade Premium)
                  </Button>
                ) : (
                  <Button
                    onClick={handleStartSimulation}
                    disabled={isLoading || !activeCV}
                    className="w-full cursor-pointer bg-linear-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95 text-xs font-semibold rounded-lg h-10 shadow-xs"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white mr-2" />
                        {t("interviewLoadingQuestions")}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white mr-2" />
                        {t("interviewStartButton")}
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Historial de Simulaciones */}
            {history.length > 0 && (
              <div className="mt-8 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-primary" />
                    {t("interviewHistoryTitle")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("interviewHistorySubtitle")}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {history.map((record) => (
                    <div 
                      key={record.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-border/40 bg-white dark:bg-zinc-900 gap-4 hover:border-primary/20 transition-all shadow-xs group"
                    >
                      <div className="space-y-1 grow pr-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{record.company}</span>
                          <Badge className={`text-[9px] font-bold px-1.5 py-0 rounded border ${
                            record.score >= 80 
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                              : record.score >= 60 
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" 
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          }`}>
                            {t("interviewHistoryScore", { score: record.score })}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{record.job_title}</h4>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {t("interviewHistoryDate", { date: new Date(record.created_at || "").toLocaleDateString() })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:self-center shrink-0">
                        <Button 
                          onClick={() => handleViewPastEvaluation(record)} 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-[11px] rounded-lg cursor-pointer"
                        >
                          {t("interviewHistoryView")}
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                        <Button 
                           onClick={(e) => { e.stopPropagation(); setRecordToDeleteId(record.id); }} 
                           variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2: ACTIVE QUESTIONNAIRE SIMULATION */}
        {step === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-border/60 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs relative">
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800">
                <div 
                  className="h-full bg-linear-to-r from-primary to-purple-600 transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                />
              </div>

              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="bg-primary/5 border border-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                    {t("interviewQuestionNum", { current: currentQuestionIdx + 1, total: questions.length })}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{company} - {jobTitle}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 min-h-64 flex flex-col justify-between">
                {/* Motion for each question fade-in */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-xl border flex flex-col sm:flex-row gap-4 items-start justify-between">
                      <div className="flex gap-3.5 items-start grow">
                        <div className="w-10 h-10 shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                          Q
                        </div>
                        <div className="space-y-1 grow">
                          <span className="text-[10px] uppercase font-bold text-primary tracking-wide block">Pregunta de Reclutador IA</span>
                          <p className="text-xs font-bold text-foreground leading-relaxed">
                            {questions[currentQuestionIdx]}
                          </p>
                        </div>
                      </div>
                      
                      {/* Text-to-Speech button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => speakQuestion(questions[currentQuestionIdx])}
                        className="h-8 text-[11px] rounded-lg cursor-pointer flex items-center gap-1.5 px-3 self-end sm:self-start hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        {isPlayingQuestion ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 text-rose-500 animate-spin" />
                            {voiceTrans.stopSpeaking}
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-primary" />
                            {voiceTrans.speakQuestion}
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground block flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-primary" />
                          {t("interviewYourAnswerLabel")}
                        </label>
                        
                        {isRecording && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] text-rose-600 dark:text-rose-400 font-bold animate-pulse">
                            {voiceTrans.recordingActive}
                          </div>
                        )}
                      </div>
                      
                      <div className="relative">
                        <Textarea
                          value={answers[currentQuestionIdx]}
                          onChange={(e) => {
                            const newAns = [...answers];
                            newAns[currentQuestionIdx] = e.target.value;
                            setAnswers(newAns);
                          }}
                          placeholder={t("interviewPlaceholderAnswer")}
                          className="w-full h-44 rounded-xl text-xs bg-zinc-50/20 dark:bg-zinc-950/20 resize-none p-3.5 pr-14 focus:ring-1 focus:ring-primary outline-none"
                        />
                        
                        {/* Mic recording button inside Textarea */}
                        <div className="absolute bottom-3.5 right-3.5">
                          <button
                            type="button"
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-all duration-300 ${
                              isRecording 
                                ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/20" 
                                : "bg-primary hover:bg-primary/90 text-white hover:scale-105"
                            }`}
                            title={isRecording ? voiceTrans.micListening : voiceTrans.micTooltip}
                          >
                            {isRecording ? (
                              <MicOff className="w-4 h-4" />
                            ) : (
                              <Mic className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Waveform graphic visualization */}
                      {isRecording && (
                        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 rounded-xl text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                          <div className="flex gap-0.5 items-center h-3">
                            <span className="w-0.75 h-3 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-0.75 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-0.75 h-3.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            <span className="w-0.75 h-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "450ms" }} />
                          </div>
                          <span>{voiceTrans.micListening}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Question actions block */}
                <div className="flex flex-col sm:flex-row gap-3 items-center pt-6 border-t">
                  {currentQuestionIdx > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={handlePrevQuestion}
                      className="w-full sm:w-auto h-10 text-xs font-semibold cursor-pointer"
                    >
                      Atrás
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    onClick={handleSkipQuestion}
                    disabled={isEvaluating}
                    className="w-full sm:w-auto text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer h-10 ml-auto"
                  >
                    {t("interviewSkip")}
                  </Button>

                  {currentQuestionIdx < questions.length - 1 ? (
                    <Button
                      onClick={handleNextQuestion}
                      className="w-full sm:w-auto h-10 text-xs font-semibold cursor-pointer bg-primary hover:bg-primary/90"
                    >
                      {t("interviewNext")}
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitInterview}
                      disabled={isEvaluating}
                      className="w-full sm:w-auto h-10 text-xs font-semibold cursor-pointer bg-linear-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95 shadow-xs"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white mr-2" />
                          {t("interviewEvaluating")}
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4 text-white mr-2" />
                          {t("interviewSubmit")}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 3: MOCK INTERVIEW RESULTS & FEEDBACK DASHBOARD */}
        {step === "results" && evaluation && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Top Scorecard & Overall Feedback Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score card gauge */}
              <Card className="border-border/60 bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("interviewScoreCard")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grow flex flex-col items-center justify-center p-6 relative">
                  {/* Gauge indicator */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-36 h-36 -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="64"
                        className="stroke-zinc-100 dark:stroke-zinc-800"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="64"
                        className={`transition-all duration-1000 ${
                          evaluation.score >= 80 
                            ? "stroke-emerald-500" 
                            : evaluation.score >= 60 
                              ? "stroke-amber-500" 
                              : "stroke-rose-500"
                        }`}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="401.9"
                        strokeDashoffset={401.9 - (401.9 * evaluation.score) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-foreground">{evaluation.score}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-extrabold mt-0.5">SCORE</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-4 text-center justify-center">
                  <Badge className={`px-3 py-1 font-bold text-xs rounded-full border ${
                    evaluation.score >= 80 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                      : evaluation.score >= 60 
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" 
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  }`}>
                    {evaluation.score >= 80 ? "Aprobado Excelente" : evaluation.score >= 60 ? "Aprobado Justo" : "Necesita Mejorar"}
                  </Badge>
                </CardFooter>
              </Card>

              {/* Overall recruitment comment */}
              <Card className="md:col-span-2 border-border/60 bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    {t("interviewOverallFeedback")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grow p-6">
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {evaluation.overallFeedback}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Question breakdown expansion list */}
            <Card className="border-border/60 bg-white dark:bg-zinc-900 shadow-xs">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  {t("interviewQuestionsAnalysis")}
                </CardTitle>
                <CardDescription>
                  Revisa tu respuesta para cada pregunta, el feedback del reclutador y la respuesta idónea propuesta por la IA.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0 divide-y">
                {evaluation.analysis.map((qa, index) => {
                  const isExpanded = expandedQuestionIdx === index;
                  const hasAnswered = qa.answer && !qa.answer.includes("omitida") && !qa.answer.includes("Sin respuesta");

                  return (
                    <div key={index} className="w-full">
                      {/* Question Trigger Bar */}
                      <button
                        onClick={() => setExpandedQuestionIdx(isExpanded ? null : index)}
                        className="w-full p-5 flex items-center justify-between text-left hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors cursor-pointer outline-none"
                      >
                        <div className="flex gap-3 items-center grow pr-4">
                          <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
                            hasAnswered 
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                              : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-xs font-bold text-foreground line-clamp-1 leading-snug">
                            {qa.question}
                          </span>
                        </div>
                        <div className="shrink-0 text-muted-foreground">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </button>

                      {/* Expandable content area */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden bg-zinc-50/40 dark:bg-zinc-950/10"
                          >
                            <div className="p-6 pt-0 space-y-5 text-xs leading-relaxed border-t border-border/20">
                              {/* Candidate Answer */}
                              <div className="space-y-1.5 pt-4">
                                <span className="font-bold text-foreground flex items-center gap-1.5 uppercase text-[9px] tracking-wide text-zinc-500">
                                  <User className="w-3.5 h-3.5 shrink-0" />
                                  {t("interviewCandidateAnswer")}
                                </span>
                                <div className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                                  hasAnswered 
                                    ? "bg-white dark:bg-zinc-900 border-border/80 text-foreground" 
                                    : "bg-amber-500/5 border-amber-500/15 text-amber-600 dark:text-amber-400 font-medium italic"
                                }`}>
                                  {qa.answer}
                                </div>
                              </div>

                              {/* AI Feedback */}
                              <div className="space-y-1.5">
                                <span className="font-bold text-primary flex items-center gap-1.5 uppercase text-[9px] tracking-wide">
                                  <Award className="w-3.5 h-3.5 shrink-0" />
                                  {t("interviewFeedbackIA")}
                                </span>
                                <p className="text-xs text-muted-foreground leading-relaxed p-0.5 whitespace-pre-line">
                                  {qa.feedback}
                                </p>
                              </div>

                              {/* Ideal Answer Suggestion */}
                              <div className="space-y-2 border-t pt-4">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase text-[9px] tracking-wide">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  {t("interviewIdealAnswer")}
                                </span>
                                <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 text-xs text-foreground leading-relaxed whitespace-pre-line">
                                  {qa.idealAnswer}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={!!recordToDeleteId} onOpenChange={(open) => !open && setRecordToDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteHistoryItem} className="bg-red-500 hover:bg-red-600 text-white cursor-pointer">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
