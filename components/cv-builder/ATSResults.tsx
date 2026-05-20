"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertCircle, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface ATSAnalysis {
  score: number;
  checks: {
    hasContactInfo: boolean;
    hasSimpleFormatting: boolean;
    hasKeywords: boolean;
    hasStandardSections: boolean;
    hasNoTables: boolean;
    hasNoImages: boolean;
    hasReadableFont: boolean;
  };
  suggestions: string[];
  detectedSections: string[];
  keywords: string[];
}

interface ATSResultsProps {
  analysis: ATSAnalysis;
}

export function ATSResults({ analysis }: ATSResultsProps) {

  console.log(analysis)
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bueno";
    return "Necesita mejoras";
  };

  const checks = [
    {
      label: "Información de contacto",
      passed: analysis.checks.hasContactInfo,
      description: "Email, teléfono y ubicación visibles"
    },
    {
      label: "Formato simple",
      passed: analysis.checks.hasSimpleFormatting,
      description: "Sin elementos complejos que dificulten el parsing"
    },
    {
      label: "Palabras clave relevantes",
      passed: analysis.checks.hasKeywords,
      description: "Incluye términos relacionados con el puesto"
    },
    {
      label: "Secciones estándar",
      passed: analysis.checks.hasStandardSections,
      description: "Experiencia, educación, habilidades claramente definidas"
    },
    {
      label: "Sin tablas complejas",
      passed: analysis.checks.hasNoTables,
      description: "Las tablas pueden confundir a los ATS"
    },
    {
      label: "Sin imágenes decorativas",
      passed: analysis.checks.hasNoImages,
      description: "Los ATS no pueden leer imágenes"
    },
    {
      label: "Fuente legible",
      passed: analysis.checks.hasReadableFont,
      description: "Fuente estándar y tamaño adecuado"
    }
  ];

  const passedChecks = checks.filter(c => c.passed).length;

  return (
    <div className="space-y-6">
      {/* Puntuación general */}
      <Card>
        <CardHeader>
          <CardTitle>Puntuación ATS</CardTitle>
          <CardDescription>
            Compatibilidad con sistemas de seguimiento de candidatos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-5xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {getScoreLabel(analysis.score)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">
                {passedChecks}/{checks.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Comprobaciones superadas
              </p>
            </div>
          </div>
          <Progress value={analysis.score} className="h-3" />
        </CardContent>
      </Card>

      {/* Análisis detallado */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Detallado</CardTitle>
          <CardDescription>
            Comprobaciones realizadas en tu CV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checks.map((check, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="mt-0.5">
                  {check.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{check.label}</p>
                    <Badge variant={check.passed ? "default" : "destructive"} className="text-xs">
                      {check.passed ? "✓" : "✗"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {check.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sugerencias de mejora */}
      {analysis.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Recomendaciones de Mejora
            </CardTitle>
            <CardDescription>
              Aplica estos cambios para mejorar tu puntuación ATS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm flex-1">{suggestion}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Secciones detectadas */}
      {analysis.detectedSections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Secciones Detectadas</CardTitle>
            <CardDescription>
              El ATS identificó estas secciones en tu CV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.detectedSections.map((section, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {section}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Palabras clave */}
      {analysis.keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Palabras Clave Encontradas</CardTitle>
            <CardDescription>
              Términos relevantes que los ATS pueden identificar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.slice(0, 20).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {analysis.keywords.length > 20 && (
                <Badge variant="outline" className="text-xs">
                  +{analysis.keywords.length - 20} más
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información adicional */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Sobre este análisis</AlertTitle>
        <AlertDescription className="text-xs">
          Este análisis proporciona una evaluación general de la compatibilidad ATS.
          Los resultados pueden variar según el sistema ATS específico usado por cada empresa.
          Te recomendamos siempre adaptar tu CV a cada oferta de trabajo.
        </AlertDescription>
      </Alert>
    </div>
  );
}
