import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AIEnhanceButtonProps {
  text: string;
  context: "summary" | "experience" | "coverLetter" | "education";
  onEnhance: (enhancedText: string) => void;
  className?: string;
}

export function AIEnhanceButton({ text, context, onEnhance, className }: AIEnhanceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnhance = async () => {
    if (!text.trim()) {
      toast.error("Escribe algo de texto primero para que la IA pueda mejorarlo.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/enhance-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, context }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = typeof data.error === "string"
          ? data.error
          : "Error al conectar con la IA";
        throw new Error(errorMsg);
      }

      if (data.text) {
        onEnhance(data.text);
        toast.success("¡Texto mejorado con éxito!");
      }
    } catch (error: any) {
      toast.error(error.message || "No se pudo mejorar el texto. Revisa tu API Key.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleEnhance}
      disabled={isLoading || !text.trim()}
      className={`gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200 hover:text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900 ${className}`}
      title="Mejorar texto con Inteligencia Artificial"
      type="button"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      Mejorar con IA
    </Button>
  );
}
