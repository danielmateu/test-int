"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Sparkles, Zap, Layout, Download, CheckCircle } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { motion, useScroll, useTransform } from "framer-motion";
import { CustomCursor } from "@/components/custom-cursor";

// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 overflow-hidden relative">
      <CustomCursor />
      {/* Navigation - Glassmorphism */}
      <nav className="fixed w-full border-b border-border/40 bg-background/60 backdrop-blur-xl z-50 transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2 group">
            <motion.div
              // whileHover={{ rotate: 12 }}
              // transition={{ duration: 0.3 }}
              className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 text-primary-foreground rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-200 group-hover:scale-105 group-hover:transition-transform"
            >
              <FileText className="w-5 h-5" />
            </motion.div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">CV AI Builder</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:inline-flex hover:bg-primary/10" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button className="rounded-full shadow-lg shadow-primary/25 transition-transform hover:scale-105" asChild>
              <Link href="/register">Empezar Gratis</Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto text-center max-w-5xl relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>La nueva era de los currículums</span>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Crea tu currículum perfecto en <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-blue-600 animate-gradient-x">
                cuestión de minutos
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Nuestra herramienta impulsada por IA maquetará tu CV en tiempo real con un diseño profesional, destacando lo mejor de ti.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
              <Button size="lg" className="relative overflow-hidden rounded-full h-14 px-8 text-lg w-full sm:w-auto shadow-xl shadow-primary/30 transition-all hover:shadow-primary/60 hover:scale-[1.03] active:scale-95 group" asChild>
                <Link href="/register">
                  <span className="relative z-10 flex items-center">
                    Crear mi CV gratis <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite] z-0"></div>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto border-border/50 hover:bg-muted/50 transition-all" asChild>
                <Link href="/builder">
                  Probar Demo Interactiva
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Hero Image Mockup (Abstract) */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="px-4 pb-24 relative z-20"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl p-2 md:p-4 relative overflow-hidden">
            {/* Decorational top bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            {/* Mock UI content (Builder representation) */}
            <div className="flex h-[400px] p-2 gap-4 opacity-80 select-none pointer-events-none">
              {/* Left sidebar - Controls */}
              <div className="w-1/3 flex flex-col gap-4">
                {/* Tabs */}
                <div className="flex bg-muted/50 rounded-lg p-1">
                  <div className="flex-1 bg-background shadow-sm rounded-md h-8 flex items-center justify-center text-xs font-medium">Contenido</div>
                  <div className="flex-1 h-8 flex items-center justify-center text-xs text-muted-foreground">Diseño</div>
                </div>
                {/* Form fields */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-muted-foreground/30 rounded"></div>
                    <div className="h-8 bg-muted/50 rounded-md border border-border/50"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-24 bg-muted-foreground/30 rounded"></div>
                    <div className="h-8 bg-muted/50 rounded-md border border-border/50"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="h-3 w-12 bg-muted-foreground/30 rounded"></div>
                      <div className="h-8 bg-muted/50 rounded-md border border-border/50"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-3 w-12 bg-muted-foreground/30 rounded"></div>
                      <div className="h-8 bg-muted/50 rounded-md border border-border/50"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-20 bg-muted-foreground/30 rounded"></div>
                    <div className="h-20 bg-muted/50 rounded-md border border-border/50"></div>
                  </div>
                </div>
              </div>

              {/* Right side - Preview (A4 Paper mockup) */}
              <div className="flex-1 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-lg p-4 flex justify-center overflow-hidden">
                <div className="w-full max-w-[220px] bg-white shadow-xl shadow-black/10 rounded-sm p-4 flex flex-col gap-3 relative overflow-hidden">
                  {/* CV Header */}
                  <div className="flex gap-3 items-center border-b pb-3 border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-3/4 bg-slate-800 rounded"></div>
                      <div className="h-2 w-1/2 bg-blue-600 rounded"></div>
                      <div className="flex gap-2">
                        <div className="h-1.5 w-1/4 bg-slate-300 rounded"></div>
                        <div className="h-1.5 w-1/4 bg-slate-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                  {/* CV Body */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="h-2 w-1/4 bg-slate-800 rounded"></div>
                      <div className="h-1.5 w-full bg-slate-200 rounded"></div>
                      <div className="h-1.5 w-5/6 bg-slate-200 rounded"></div>
                      <div className="h-1.5 w-4/6 bg-slate-200 rounded"></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-1/4 bg-slate-800 rounded"></div>
                      <div className="flex justify-between">
                        <div className="h-1.5 w-1/3 bg-slate-600 rounded"></div>
                        <div className="h-1.5 w-1/6 bg-slate-300 rounded"></div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded"></div>
                      <div className="h-1.5 w-5/6 bg-slate-200 rounded"></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <div className="h-1.5 w-1/3 bg-slate-600 rounded"></div>
                        <div className="h-1.5 w-1/6 bg-slate-300 rounded"></div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded"></div>
                      <div className="h-1.5 w-4/6 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none"></div>
          </div>
        </div>
      </motion.section>

      {/* Bento Grid Features */}
      <section className="py-24 bg-zinc-50/50 dark:bg-zinc-900/20 relative">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Herramientas <span className="text-primary">Premium</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todo el poder de un diseñador profesional, simplificado en una interfaz intuitiva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
            {/* Feature 1 - Large */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 row-span-1 bg-card rounded-3xl p-8 border border-border/50 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                  <Layout className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Diseño en Tiempo Real</h3>
                  <p className="text-muted-foreground">Previsualiza instantáneamente cada cambio. Ajusta tipografías, colores y espaciados sin recargar la página.</p>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="col-span-1 row-span-1 bg-gradient-to-br from-primary to-purple-600 rounded-3xl p-8 text-primary-foreground shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <Sparkles className="w-24 h-24" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end">
                <h3 className="text-2xl font-bold mb-2">Asistencia de IA</h3>
                <p className="text-primary-foreground/80 text-sm">Genera resúmenes y descripciones impactantes con un solo clic.</p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="col-span-1 row-span-1 bg-card rounded-3xl p-8 border border-border/50 shadow-sm relative overflow-hidden group"
            >
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Exportación Perfecta</h3>
              <p className="text-muted-foreground text-sm">PDFs optimizados para ATS (Sistemas de Seguimiento de Candidatos), en formato A4 perfecto.</p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 row-span-1 bg-card rounded-3xl p-8 border border-border/50 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute left-0 bottom-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent z-0"></div>
              <div className="relative z-10 flex items-center gap-8 h-full">
                <div className="flex-1">
                  <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Rendimiento Extremo</h3>
                  <p className="text-muted-foreground">Aplicación rápida, fluida y segura. Tu información se guarda automáticamente en la nube.</p>
                </div>
                <div className="hidden md:flex flex-1 items-center justify-center">
                  <div className="w-full max-w-[200px] space-y-3">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-green-500"
                      />
                    </div>
                    <div className="h-2 w-4/5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "80%" }}
                        transition={{ duration: 1.5, delay: 0.7 }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Cómo Funciona</h2>
            <p className="text-lg text-muted-foreground">Tres simples pasos para conseguir el trabajo de tus sueños.</p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block"></div>

            <div className="space-y-12 relative">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
              >
                <div className="md:w-1/2 md:pr-12 text-left md:text-right">
                  <h3 className="text-2xl font-bold mb-2">1. Completa tu Perfil</h3>
                  <p className="text-muted-foreground">Introduce tus datos, experiencia y educación en nuestros formularios guiados. La IA puede ayudarte a redactar tus logros.</p>
                </div>
                <div className="absolute left-0 -top-5 md:top-4 md:left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-background border-4 border-primary flex items-center justify-center z-10 shadow-lg shadow-primary/20 font-bold text-xl text-primary ">
                  1
                </div>
                <div className="md:w-1/2 md:pl-12 hidden md:block">
                  <div className="bg-card p-4 rounded-xl border shadow-sm">
                    <div className="space-y-3 opacity-50">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-10 bg-muted rounded w-full"></div>
                      <div className="h-10 bg-muted rounded w-full"></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative flex flex-col md:flex-row-reverse items-start md:items-center justify-between gap-8"
              >
                <div className="md:w-1/2 md:pl-12 text-left">
                  <h3 className="text-2xl font-bold mb-2">2. Personaliza el Diseño</h3>
                  <p className="text-muted-foreground">Elige entre múltiples plantillas profesionales. Cambia colores, tipografías y el orden de las secciones en tiempo real.</p>
                </div>
                <div className="absolute left-0 -top-5 md:top-0 md:left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-background border-4 border-purple-500 flex items-center justify-center z-10 shadow-lg shadow-purple-500/20 font-bold text-xl text-purple-500">
                  2
                </div>
                <div className="md:w-1/2 md:pr-12 hidden md:block text-right">
                  <div className="bg-card p-4 rounded-xl border shadow-sm flex gap-2 justify-end">
                    <div className="w-8 h-8 rounded-full bg-blue-500"></div>
                    <div className="w-8 h-8 rounded-full bg-purple-500"></div>
                    <div className="w-8 h-8 rounded-full bg-green-500"></div>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
              >
                <div className="md:w-1/2 md:pr-12 text-left md:text-right">
                  <h3 className="text-2xl font-bold mb-2">3. Descarga y Triunfa</h3>
                  <p className="text-muted-foreground">Exporta tu CV en un PDF perfecto y listo para imprimir, sin marcas de agua ni bordes extraños.</p>
                </div>
                <div className="absolute left-0 md:left-1/2 -top-5 md:top-4 -translate-x-1/2 w-14 h-14 rounded-full bg-primary text-primary-foreground border-4 border-background flex items-center justify-center z-10 shadow-lg font-bold text-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="md:w-1/2 md:pl-12 hidden md:block">
                  <Button variant="outline" className="w-full pointer-events-none h-16 text-lg rounded-xl border-primary text-primary">
                    <Download className="mr-2" /> CV_Final.pdf
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para destacar?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Únete a miles de profesionales que ya han mejorado sus oportunidades laborales con un currículum impactante.
          </p>
          <Button size="lg" className="relative overflow-hidden rounded-full h-16 px-10 text-xl shadow-xl shadow-primary/30 transition-all hover:shadow-primary/60 hover:scale-[1.03] active:scale-95 group" asChild>
            <Link href="/register">
              <span className="relative z-10 flex items-center">
                Crear mi CV Gratis <Sparkles className="ml-2 w-5 h-5 transition-transform group-hover:scale-110 " />
              </span>
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite] z-0"></div>
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-background relative z-10">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">CV AI Builder</span>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} CV AI Builder. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
}

