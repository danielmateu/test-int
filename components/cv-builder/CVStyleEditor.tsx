import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { CVData, CVTheme, TypographySettings, SpacingSettings } from "./types";
import { Paintbrush, Type, LayoutTemplate, SlidersHorizontal } from "lucide-react";

interface CVStyleEditorProps {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

const COLORS = [
  { name: "Slate", value: "#0f172a", className: "bg-slate-900" },
  { name: "Azul", value: "#2563eb", className: "bg-blue-600" },
  { name: "Esmeralda", value: "#059669", className: "bg-emerald-600" },
  { name: "Rosa", value: "#d88295ff", className: "bg-rose-400" },
  { name: "Púrpura", value: "#7c3aed", className: "bg-violet-600" },
  { name: "Naranja", value: "#ea580c", className: "bg-orange-600" },
];

const FONTS = [
  { name: "Sans (Moderno)", value: "font-sans", className: "font-sans" },
  { name: "Serif (Clásico)", value: "font-serif", className: "font-serif" },
  { name: "Mono (Técnico)", value: "font-mono", className: "font-mono" },
  { name: "Arial (Estándar)", value: "font-[Arial]", className: "font-[Arial]" },
  { name: "Georgia (Elegante)", value: "font-[Georgia]", className: "font-[Georgia]" },
  { name: "Verdana (Legible)", value: "font-[Verdana]", className: "font-[Verdana]" },
];

const LAYOUTS = [
  { name: "Clásico", value: "classic", description: "Diseño lineal tradicional de una sola columna" },
  { name: "Dos Columnas", value: "two-column", description: "Moderno, con barra lateral para contacto y habilidades" },
  { name: "Minimalista", value: "minimalist", description: "Limpio, centrado y sin distracciones visuales" },
  { name: "Moderno", value: "modern", description: "Vibrante y contemporáneo, con toques de color y tarjetas" },
  { name: "Corporativo", value: "corporate", description: "Estructurado, profesional y muy claro para entornos formales" },
];

export function CVStyleEditor({ data, setData }: CVStyleEditorProps) {
  const handleThemeChange = (field: keyof CVTheme, value: string) => {
    setData((prev) => ({
      ...prev,
      theme: { ...prev.theme, [field]: value },
    }));
  };

  const handleTypographyChange = (field: keyof TypographySettings, value: number) => {
    setData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        typography: {
          ...(prev.theme.typography || { fontSize: 16, lineHeight: 1.5, wordSpacing: 0 }),
          [field]: value
        }
      },
    }));
  };

  const currentTypography = data.theme.typography || { fontSize: 16, lineHeight: 1.5, wordSpacing: 0 };

  const handleSpacingChange = (field: keyof SpacingSettings, value: number) => {
    setData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        spacing: {
          ...(prev.theme.spacing || { pagePadding: 48, sectionSpacing: 24, itemSpacing: 16, paragraphSpacing: 8 }),
          [field]: value
        }
      },
    }));
  };

  const currentSpacing = data.theme.spacing || { pagePadding: 48, sectionSpacing: 24, itemSpacing: 16, paragraphSpacing: 8 };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto pb-20">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Paintbrush className="w-8 h-8" />
          Estilos del CV
        </h2>
        <p className="text-muted-foreground">Personaliza el aspecto visual de tu currículum.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Paintbrush className="w-4 h-4" />
              </div>
              Color Principal
            </CardTitle>
            <CardDescription>
              Elige un color para los iconos y títulos principales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={data.theme.color}
              onValueChange={(val) => handleThemeChange("color", val)}
              className="grid grid-cols-3 sm:grid-cols-6 gap-4"
            >
              {COLORS.map((color) => (
                <div key={color.value} className="flex flex-col items-center gap-2">
                  <RadioGroupItem
                    value={color.value}
                    id={`color-${color.value}`}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={`color-${color.value}`}
                    className={`w-12 h-12 rounded-full cursor-pointer ring-offset-2 ring-offset-background transition-all hover:scale-110 ${color.className} ${data.theme.color === color.value ? "ring-2 ring-primary" : "ring-1 ring-slate-200"
                      }`}
                  >
                    <span className="sr-only">{color.name}</span>
                  </Label>
                  <span className="text-xs font-medium text-muted-foreground">{color.name}</span>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Type className="w-4 h-4" />
              </div>
              Tipografía
            </CardTitle>
            <CardDescription>
              Selecciona la fuente que mejor encaje con tu perfil profesional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={data.theme.font}
              onValueChange={(val) => handleThemeChange("font", val)}
              className="flex flex-col gap-4"
            >
              {FONTS.map((font) => (
                <div key={font.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={font.value} id={`font-${font.value}`} />
                  <Label
                    htmlFor={`font-${font.value}`}
                    className={`text-lg cursor-pointer ${font.className}`}
                  >
                    {font.name}
                    <p className="text-sm text-muted-foreground font-sans mt-1">
                      El veloz murciélago hindú comía feliz cardillo y kiwi.
                    </p>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              Ajustes de Tipografía
            </CardTitle>
            <CardDescription>
              Ajusta el tamaño, interlineado y espaciado de palabras.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Tamaño de Fuente (Base)</Label>
                <span className="text-sm text-muted-foreground">{currentTypography.fontSize}px</span>
              </div>
              <Slider
                min={12}
                max={24}
                step={1}
                value={[currentTypography.fontSize]}
                onValueChange={([val]) => handleTypographyChange("fontSize", val)}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Alto de Línea</Label>
                <span className="text-sm text-muted-foreground">{currentTypography.lineHeight}</span>
              </div>
              <Slider
                min={1}
                max={2.5}
                step={0.1}
                value={[currentTypography.lineHeight]}
                onValueChange={([val]) => handleTypographyChange("lineHeight", val)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Separación de Palabras</Label>
                <span className="text-sm text-muted-foreground">{currentTypography.wordSpacing}px</span>
              </div>
              <Slider
                min={-2}
                max={10}
                step={0.5}
                value={[currentTypography.wordSpacing]}
                onValueChange={([val]) => handleTypographyChange("wordSpacing", val)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              Ajustes de Espaciado (Bloques y Párrafos)
            </CardTitle>
            <CardDescription>
              Ajusta los márgenes de página, y separación de secciones, elementos y párrafos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Margen de la Página (Padding)</Label>
                <span className="text-sm text-muted-foreground">{currentSpacing.pagePadding}px</span>
              </div>
              <Slider
                min={16}
                max={80}
                step={2}
                value={[currentSpacing.pagePadding || 48]}
                onValueChange={([val]) => handleSpacingChange("pagePadding", val)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Espaciado entre Secciones</Label>
                <span className="text-sm text-muted-foreground">{currentSpacing.sectionSpacing}px</span>
              </div>
              <Slider
                min={8}
                max={60}
                step={2}
                value={[currentSpacing.sectionSpacing || 24]}
                onValueChange={([val]) => handleSpacingChange("sectionSpacing", val)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Espaciado entre Elementos</Label>
                <span className="text-sm text-muted-foreground">{currentSpacing.itemSpacing}px</span>
              </div>
              <Slider
                min={4}
                max={40}
                step={2}
                value={[currentSpacing.itemSpacing || 16]}
                onValueChange={([val]) => handleSpacingChange("itemSpacing", val)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Espaciado entre Párrafos</Label>
                <span className="text-sm text-muted-foreground">{currentSpacing.paragraphSpacing}px</span>
              </div>
              <Slider
                min={2}
                max={24}
                step={1}
                value={[currentSpacing.paragraphSpacing || 8]}
                onValueChange={([val]) => handleSpacingChange("paragraphSpacing", val)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <LayoutTemplate className="w-4 h-4" />
              </div>
              Estructura del Documento
            </CardTitle>
            <CardDescription>
              Selecciona la distribución visual de tu currículum.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={data.theme.layout || "classic"}
              onValueChange={(val) => handleThemeChange("layout", val)}
              className="flex flex-col gap-3"
            >
              {LAYOUTS.map((layout) => (
                <div
                  key={layout.value}
                  className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all ${data.theme.layout === layout.value || (!data.theme.layout && layout.value === "classic") ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                  onClick={() => handleThemeChange("layout", layout.value)}
                >
                  <RadioGroupItem value={layout.value} id={`layout-${layout.value}`} />
                  <Label
                    htmlFor={`layout-${layout.value}`}
                    className="cursor-pointer flex-1"
                    onClick={(e) => e.preventDefault()} // Let parent div handle the click to select radio
                  >
                    <div className="font-semibold text-base">{layout.name}</div>
                    <div className="text-sm text-muted-foreground font-normal mt-1">
                      {layout.description}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
