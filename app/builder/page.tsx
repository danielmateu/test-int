"use client";

import { useState } from "react";
import { CVForm } from "@/components/cv-builder/CVForm";
import { CVPreview } from "@/components/cv-builder/CVPreview";
import { CVData } from "@/components/cv-builder/types";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

const initialData: CVData = {
  personalInfo: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    imageUrl: "",
  },
  experience: [],
  education: [],
  skills: [],
};

export default function BuilderPage() {
  const [cvData, setCvData] = useState<CVData>(initialData);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans print:bg-white print:p-0">
      {/* Header bar - hidden when printing */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-full">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="font-bold text-xl tracking-tight hidden sm:block">
              CV AI <span className="text-muted-foreground font-normal">Builder</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Exportar a PDF
            </Button>
            <ModeToggle />
          </div>
        </div>

      </header>

      {/* Main content */}
      <main className="container flex flex-col xl:flex-row gap-8 p-4 md:p-8 max-w-full print:p-0 print:gap-0 print:m-0 print:block">

        {/* Left column: Form */}
        <div className="flex-1 xl:max-w-[800px] xl:h-[calc(100vh-8rem)] xl:overflow-y-auto print:hidden no-scrollbar pr-2">
          <CVForm data={cvData} setData={setCvData} />
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
