import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Sparkles, Zap } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            CV AI Builder
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Empezar Gratis</Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 overflow-hidden relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>El maquetador de CV más inteligente</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Crea tu currículum perfecto en <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">minutos</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Nuestra herramienta maquetará tu CV en tiempo real con un diseño profesional y moderno, listo para imprimir o exportar a PDF.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto" asChild>
              <Link href="/register">
                Crear mi CV ahora <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto" asChild>
              <Link href="/builder">
                Probar Demo Sin Registro
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Todo lo que necesitas para destacar</h2>
            <p className="text-lg text-muted-foreground">Diseñado para ayudarte a conseguir tu próximo trabajo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-8 rounded-2xl shadow-sm border">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">En Tiempo Real</h3>
              <p className="text-muted-foreground">Observa cómo tu CV toma forma a medida que escribes. Sin esperas ni recargas molestas.</p>
            </div>
            <div className="bg-background p-8 rounded-2xl shadow-sm border">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Exportación Perfecta</h3>
              <p className="text-muted-foreground">Genera un PDF limpio, en formato A4 estándar, listo para ser enviado a los reclutadores.</p>
            </div>
            <div className="bg-background p-8 rounded-2xl shadow-sm border">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Diseño Profesional</h3>
              <p className="text-muted-foreground">Plantillas y estilos minimalistas creados para maximizar la legibilidad y el impacto visual.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t text-center text-muted-foreground px-4">
        <p>&copy; {new Date().getFullYear()} CV AI Builder. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
