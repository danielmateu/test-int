"use client";

import { useState } from "react";
import { CVForm } from "@/components/cv-builder/CVForm";
import { CVStyleEditor } from "@/components/cv-builder/CVStyleEditor";
import { CVPreview } from "@/components/cv-builder/CVPreview";
import { CVData } from "@/components/cv-builder/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Save, LogOut, User, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ModeToggle } from "@/components/mode-toggle";
import { useSession, signOut } from "next-auth/react";
import { saveCV, loadCV } from "@/app/actions/cv";
import { toast } from "sonner";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialData: CVData = {
  personalInfo: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    imageUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    linkedinUrl: "",
    xUrl: "",
  },
  experience: [],
  education: [],
  skills: [],
  coverLetter: "",
  theme: {
    color: "#0f172a", // Default slate-900
    font: "font-sans",
    layout: "classic",
  },
};

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <BuilderPageContent />
    </Suspense>
  );
}

function BuilderPageContent() {
  const searchParams = useSearchParams();
  const cvId = searchParams.get("id");
  const router = useRouter();

  const [cvData, setCvData] = useState<CVData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      loadCV(cvId || undefined).then((data) => {
        if (data) {
          setCvData(data.content);
          toast.success("CV cargado correctamente desde la nube");
        }
      }).catch(console.error);
    }
  }, [status, cvId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await saveCV(cvData, cvId || undefined);
      toast.success("CV guardado correctamente");
      if (res.id && res.id !== cvId) {
        router.push(`/builder?id=${res.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el CV");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen print:min-h-0 bg-zinc-50 dark:bg-zinc-950 font-sans print:bg-white print:p-0">
      <style dangerouslySetInnerHTML={{
        __html: `
        @page { size: A4; margin: 8mm 0mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}} />

      {/* Demo mode banner */}
      {status === "unauthenticated" && (
        <div className="bg-linear-to-r from-primary/90 via-purple-600/90 to-blue-600/90 text-white text-sm py-2.5 px-4 flex items-center justify-center gap-3 print:hidden flex-wrap">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="text-center">Estás usando el <strong>modo demo</strong> — tu CV no se guardará. Regístrate gratis para guardar y exportar tu trabajo.</span>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="secondary" className="h-7 text-xs rounded-full" asChild>
              <Link href="/register">Crear cuenta gratis</Link>
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs rounded-full text-white hover:bg-white/20" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Header bar - hidden when printing */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
        <nav className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-full">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href={status === "authenticated" ? "/dashboard" : "/"}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="font-bold text-xl tracking-tight hidden sm:flex items-center gap-2">
              <span>CV AI <span className="text-muted-foreground font-normal">Builder</span></span>
              <span className="text-muted-foreground mx-2">|</span>
              <input
                type="text"
                value={cvData.title || ""}
                onChange={(e) => setCvData({ ...cvData, title: e.target.value })}
                className="bg-transparent border-none outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1 text-base font-medium max-w-[200px]"
                placeholder="Mi CV"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {status === "authenticated" ? (
              <>
                <Button onClick={handleSave} disabled={isSaving} variant="outline" className="gap-2">
                  <Save className="w-4 h-4" />
                  {isSaving ? "Guardando..." : "Guardar CV"}
                </Button>
                <Button onClick={handlePrint} className="gap-2">
                  <Printer className="w-4 h-4" />
                  Exportar a PDF
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                        <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : status === "unauthenticated" ? (
              <Button asChild variant="outline" className="mr-2">
                <Link href="/login">Iniciar Sesión para guardar</Link>
              </Button>
            ) : null}

            <ModeToggle />
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="container flex flex-col xl:flex-row gap-8 p-4 md:p-8 max-w-full print:p-0 print:gap-0 print:m-0 print:block">

        {/* Left column: Form & Styles */}
        <div className="flex-1 xl:max-w-200 xl:h-[calc(100vh-8rem)] xl:overflow-y-auto print:hidden no-scrollbar pr-2">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-8">
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="styles">Diseño</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="mt-0 outline-none">
              <CVForm data={cvData} setData={setCvData} status={status} />
            </TabsContent>
            <TabsContent value="styles" className="mt-0 outline-none">
              <CVStyleEditor data={cvData} setData={setCvData} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column: Preview */}
        <div className="flex-1 flex justify-center items-start xl:h-[calc(100vh-8rem)] xl:overflow-y-auto print:h-auto print:overflow-visible print:block bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl p-4 md:p-8 print:p-0 print:bg-transparent">
          <div className="w-full max-w-[210mm] transition-all duration-300 ease-in-out print:max-w-none">
            <CVPreview data={cvData} />
          </div>
        </div>

      </main>
    </div>
  );
}
