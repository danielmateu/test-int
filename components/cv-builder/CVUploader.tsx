"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CVUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isAnalyzing?: boolean;
}

export function CVUploader({ onUpload, isAnalyzing = false }: CVUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword"
  ];

  const validateFile = (file: File): boolean => {
    // Validar tipo de archivo
    if (!acceptedTypes.includes(file.type)) {
      toast.error("Solo se aceptan archivos PDF o DOCX");
      return false;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("El archivo no debe superar los 5MB");
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    try {
      await onUpload(file);
    } catch (error) {
      console.error("Error al analizar:", error);
      toast.error("Error al analizar el CV");
    }
  };

  const handleRemove = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Validador ATS de CV
        </CardTitle>
        <CardDescription>
          Adjunta tu CV en formato PDF o DOCX para validar si es compatible con sistemas ATS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${isDragging 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25 hover:border-primary/50"
              }
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              Arrastra tu CV aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground">
              PDF o DOCX · Máximo 5MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="mt-1">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatFileSize(file.size)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs text-green-600">Archivo válido</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                disabled={isAnalyzing}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {file && (
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Analizando...
              </>
            ) : (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Analizar compatibilidad ATS
              </>
            )}
          </Button>
        )}

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            <strong>¿Qué es ATS?</strong> Los sistemas ATS (Applicant Tracking System) son software que 
            las empresas usan para filtrar CVs automáticamente. Un CV ATS-friendly aumenta tus posibilidades 
            de pasar estos filtros.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
