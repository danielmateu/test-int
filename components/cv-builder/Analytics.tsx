"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  getJobApplications, 
  JobApplication 
} from "@/app/actions/tracker";
import { 
  getInterviewSimulationsAction,
  InterviewSimulationRecord 
} from "@/app/actions/interview";
import { 
  TrendingUp, Award, Briefcase, Sparkles, RefreshCw, FileText, CheckCircle2, AlertTriangle, Loader2 
} from "lucide-react";

interface AnalyticsProps {
  cvsCount: number;
}

export function Analytics({ cvsCount }: AnalyticsProps) {
  const t = useTranslations("Dashboard");

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<InterviewSimulationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        // 1. Cargar postulaciones
        const appRes = await getJobApplications();
        let apps: JobApplication[] = [];
        if (appRes.useLocalStorage) {
          const localData = localStorage.getItem("job_tracker_applications");
          if (localData) apps = JSON.parse(localData);
        } else {
          apps = appRes.data || [];
        }
        setApplications(apps);

        // 2. Cargar simulaciones de entrevistas
        const intRes = await getInterviewSimulationsAction();
        let ints: InterviewSimulationRecord[] = [];
        if (intRes.useLocalStorage) {
          const localData = localStorage.getItem("job_interview_simulations");
          if (localData) ints = JSON.parse(localData);
        } else {
          ints = intRes.data || [];
        }
        setInterviews(ints);
      } catch (error) {
        console.error("Error loading analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // --- CÁLCULO DE MÉTRICAS CLAVE ---
  const totalApps = applications.length;
  const interviewingCount = applications.filter(a => a.status === "interviewing").length;
  const offerCount = applications.filter(a => a.status === "offer").length;
  const rejectedCount = applications.filter(a => a.status === "rejected").length;
  const appliedCount = applications.filter(a => a.status === "applied").length;
  const savedCount = applications.filter(a => a.status === "saved").length;

  // Tasa de conversión a entrevista ((interviewing + offer) / total * 100)
  const interviewConversionRate = totalApps > 0 
    ? Math.round(((interviewingCount + offerCount) / totalApps) * 100)
    : 0;

  // Nota media de entrevistas
  const avgInterviewScore = interviews.length > 0
    ? Math.round(interviews.reduce((acc, curr) => acc + curr.score, 0) / interviews.length)
    : 0;

  // --- DATOS PARA GRÁFICO DE EMBUDO (Barchart Horizontal) ---
  const funnelData = [
    { name: "Guardadas", value: savedCount, color: "oklch(0.708 0 0)" },
    { name: "Postulado", value: appliedCount, color: "oklch(0.6 0.118 184.704)" },
    { name: "En Entrevista", value: interviewingCount, color: "oklch(0.769 0.188 70.08)" },
    { name: "Oferta Recibida", value: offerCount, color: "oklch(0.696 0.17 162.48)" },
    { name: "Descartado", value: rejectedCount, color: "oklch(0.704 0.191 22.216)" }
  ];

  // --- DATOS PARA GRÁFICO DE RENDIMIENTO (Donut) ---
  const scoreCategories = [
    { name: "Sobresaliente (>= 85)", value: interviews.filter(i => i.score >= 85).length, color: "oklch(0.696 0.17 162.48)" },
    { name: "Notable (70-84)", value: interviews.filter(i => i.score >= 70 && i.score < 85).length, color: "oklch(0.6 0.118 184.704)" },
    { name: "Aprobado (50-69)", value: interviews.filter(i => i.score >= 50 && i.score < 70).length, color: "oklch(0.769 0.188 70.08)" },
    { name: "Necesita Mejora (< 50)", value: interviews.filter(i => i.score < 50).length, color: "oklch(0.704 0.191 22.216)" }
  ].filter(c => c.value > 0); // Solo graficar categorías que tengan elementos

  // Si no hay entrevistas, mostramos una categoría vacía de prueba
  const displayScoreCategories = scoreCategories.length > 0 
    ? scoreCategories 
    : [{ name: "Sin datos", value: 1, color: "oklch(0.708 0 0 / 15%)" }];

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-xl border border-border/40 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Métricas de Progreso
          </h2>
          <p className="text-sm text-muted-foreground">Analiza el rendimiento de tus currículums y tu preparación para entrevistas</p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading} className="cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Recargar
        </Button>
      </div>

      {isLoading && applications.length === 0 && interviews.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Cargando métricas de progreso...</p>
        </div>
      ) : (
        <>
          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI 1: Total Candidaturas */}
            <Card className="bg-white dark:bg-zinc-900 border border-border/50 shadow-xs hover:border-primary/20 transition-all">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Candidaturas</span>
                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">{totalApps}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Ofertas seguidas en tu tablero</p>
              </CardContent>
            </Card>

            {/* KPI 2: Tasa Conversión a Entrevista */}
            <Card className="bg-white dark:bg-zinc-900 border border-border/50 shadow-xs hover:border-primary/20 transition-all">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tasa de Entrevistas</span>
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">{interviewConversionRate}%</div>
                <p className="text-[10px] text-muted-foreground mt-1">Postulaciones que consiguen contacto</p>
              </CardContent>
            </Card>

            {/* KPI 3: Puntuación Media Entrevistas */}
            <Card className="bg-white dark:bg-zinc-900 border border-border/50 shadow-xs hover:border-primary/20 transition-all">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nota Media Simulador</span>
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">{avgInterviewScore > 0 ? `${avgInterviewScore}/100` : "S/D"}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Rendimiento evaluado por Gemini IA</p>
              </CardContent>
            </Card>

            {/* KPI 4: Total CVs Activos */}
            <Card className="bg-white dark:bg-zinc-900 border border-border/50 shadow-xs hover:border-primary/20 transition-all">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Currículums Activos</span>
                <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">{cvsCount}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Versiones creadas y optimizadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos en dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Gráfico 1: Embudo de Candidaturas */}
            <Card className="bg-white dark:bg-zinc-900 border border-border/40 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Briefcase className="w-4.5 h-4.5 text-primary" />
                  Embudo de Candidaturas (Kanban)
                </CardTitle>
                <CardDescription>Distribución absoluta de tus ofertas de trabajo por etapa del proceso</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {totalApps === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                    <AlertTriangle className="w-8 h-8 text-muted-foreground opacity-50" />
                    <p className="text-xs text-muted-foreground">No hay candidaturas en tu tablero.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={funnelData}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis type="number" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)', 
                          borderColor: 'var(--border)', 
                          borderRadius: '8px',
                          fontSize: '11px',
                          color: 'var(--foreground)'
                        }} 
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Gráfico 2: Nivel en Entrevistas */}
            <Card className="bg-white dark:bg-zinc-900 border border-border/40 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
                  Distribución de Calificaciones (Entrevista IA)
                </CardTitle>
                <CardDescription>Clasificación de tu desempeño en base a las notas otorgadas por Gemini</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex flex-col sm:flex-row items-center justify-around gap-4">
                {interviews.length === 0 ? (
                  <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-2">
                    <Sparkles className="w-8 h-8 text-muted-foreground opacity-50" />
                    <p className="text-xs text-muted-foreground">Aún no has completado ninguna simulación.</p>
                    <p className="text-[10px] text-muted-foreground">Practica en la pestaña "Entrevista IA" para obtener tu primer reporte.</p>
                  </div>
                ) : (
                  <>
                    {/* Donut Chart */}
                    <div className="w-44 h-44 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={displayScoreCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {displayScoreCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Leyendas y consejos personalizados */}
                    <div className="space-y-4 grow max-w-sm">
                      <div className="space-y-2">
                        {scoreCategories.map((cat, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className="font-bold text-foreground">{cat.value}</span>
                            <span className="text-muted-foreground">{cat.name}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-3 space-y-1">
                        <span className="text-[9px] font-bold text-primary uppercase tracking-wider block">Recomendación de Gemini</span>
                        <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
                          {avgInterviewScore >= 85 ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span><strong>¡Excelente nivel de comunicación!</strong> Tus respuestas demuestran un nivel sobresaliente. Mantén la confianza y cuida la comunicación no verbal en la entrevista real.</span>
                            </>
                          ) : avgInterviewScore >= 70 ? (
                            <>
                              <TrendingUp className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                              <span><strong>¡Buen nivel!</strong> Tienes bases sólidas. Intenta enriquecer tus respuestas con la **metodología STAR** (Situación, Tarea, Acción, Resultado) para alcanzar el nivel experto.</span>
                            </>
                          ) : avgInterviewScore >= 50 ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span><strong>Progresando adecuadamente.</strong> Procura estructurar mejor tus experiencias. Te recomendamos simular ofertas específicas en lugar de generales.</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <span><strong>Área de oportunidad alta.</strong> Revisa las respuestas modelo / ideales recomendadas por Gemini al final del simulador y utilízalas como guía para reescribir tus logros.</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

          </div>
        </>
      )}
    </div>
  );
}
