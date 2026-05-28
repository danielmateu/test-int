"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { FileText, Plus, Trash2, Edit2, LogOut, Briefcase } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import { deleteCV } from "@/app/actions/cv";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { RecommendedJobs } from "@/components/cv-builder/RecommendedJobs";
import { JobTracker } from "@/components/cv-builder/JobTracker";
import { InterviewSimulator } from "@/components/cv-builder/InterviewSimulator";
import type { JobOffer } from "@/app/actions/jobs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CVPreview } from "@/components/cv-builder/CVPreview";
import { CVData } from "@/components/cv-builder/types";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CVUploader } from "@/components/cv-builder/CVUploader";
import { ATSResults, ATSAnalysis } from "@/components/cv-builder/ATSResults";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";

interface CVList {
  id: string;
  updated_at: string;
  title: string;
  content: CVData;
}

function CVThumbnail({ content }: { content: CVData }) {
  return (
    <div
      className="w-full overflow-hidden rounded-sm bg-white border border-slate-100 relative select-none pointer-events-none"
      style={{ height: '158px' }}
    >
      <div
        className="absolute top-0 left-0"
        style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: '793px' }}
      >
        <CVPreview data={content} />
      </div>
      {/* Fade overlay */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-white to-transparent" />
    </div>
  );
}

export function DashboardClient({
  initialCvs,
  userName,
  userImage
}: {
  initialCvs: CVList[],
  userName: string,
  userImage?: string | null
}) {
  const [cvs, setCvs] = useState(initialCvs);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<JobOffer[]>([]);
  const [trackedJobUrls, setTrackedJobUrls] = useState<string[]>([]);
  const router = useRouter();
  const t = useTranslations("Dashboard");

  const activeCV = cvs[0];
  const activeJobTitle = activeCV?.content?.personalInfo?.jobTitle || "";
  const activeSkills = activeCV?.content?.skills || [];

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t("deleteConfirm"))) return;

    try {
      await deleteCV(id);
      setCvs(cvs.filter(cv => cv.id !== id));
      toast.success(t("deleteSuccess"));
    } catch (error) {
      toast.error(t("deleteError"));
    }
  }

  const handleATSUpload = async (file: File) => {
    setIsAnalyzing(true);
    setAtsAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/validate-ats", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al analizar el CV");
      }

      setAtsAnalysis(data.analysis);
      toast.success("Análisis ATS completado");
    } catch (error: any) {
      toast.error(error.message || "Error al analizar el CV");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">

        <header className="flex justify-between items-center border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground mt-2">{t("subtitle")} ({cvs.length}/4 {t("used")})</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2 cursor-pointer">
                  <Avatar>
                    <AvatarImage src={userImage || ""} />
                    <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <Tabs defaultValue="cvs" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="cvs">Mis CVs</TabsTrigger>
            <TabsTrigger value="ats">Validador ATS</TabsTrigger>
            <TabsTrigger value="jobs">Ofertas de Empleo</TabsTrigger>
            <TabsTrigger value="tracker">{t("trackerTab")}</TabsTrigger>
            <TabsTrigger value="interview">{t("interviewTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="cvs" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {cvs.map((cv, idx) => (
                  <motion.div
                    key={cv.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="h-full"
                  >
                    <Card
                      key={cv.id}
                      className="hover:border-primary transition-colors cursor-pointer group h-full flex flex-col"
                      onClick={() => router.push(`/builder?id=${cv.id}`)}
                    >
                      <CardHeader>
                        <CardTitle className="flex justify-between items-start text-lg">
                          <span className="truncate pr-2">{cv.title}</span>
                          <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0" />
                        </CardTitle>
                        <CardDescription>
                          {t("updated")} {new Date(cv.updated_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grow">
                        <CVThumbnail content={cv.content} />
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/builder?id=${cv.id}`); }}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          {t("edit")}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={(e) => handleDelete(cv.id, e)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}

                {/* Create New Card */}
                {cvs.length < 8 ? (
                  <Link href="/builder">
                    <Card className="border-dashed hover:border-primary transition-colors cursor-pointer h-full min-h-62.5 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-medium text-lg">{t("createNew")}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{8 - cvs.length} {t("available")}</p>
                    </Card>
                  </Link>
                ) : (
                  <Card className="border-dashed h-full min-h-62.5 flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 opacity-75">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-lg text-muted-foreground">{t("limitReached")}</h3>
                    <p className="text-sm text-muted-foreground mt-1 text-center px-4">
                      {t("limitMsg")}
                    </p>
                  </Card>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="ats" className="mt-6">
            <div className="space-y-6">
              <CVUploader onUpload={handleATSUpload} isAnalyzing={isAnalyzing} />

              {atsAnalysis && (
                <ATSResults analysis={atsAnalysis} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            {cvs.length === 0 ? (
              <Card className="border-dashed py-12 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <Briefcase className="w-12 h-12 text-muted-foreground mb-4 opacity-50 animate-bounce" />
                <h3 className="font-semibold text-lg">{t("limitReached")}</h3>
                <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm px-4">
                  {t("noCvs")}
                </p>
                <Button className="mt-4 cursor-pointer" asChild>
                  <Link href="/builder">{t("createNew")}</Link>
                </Button>
              </Card>
            ) : (
              <RecommendedJobs
                cvId={activeCV.id}
                cvData={activeCV.content}
                initialJobTitle={activeJobTitle}
                initialSkills={activeSkills}
                jobs={recommendedJobs}
                setJobs={setRecommendedJobs}
                trackedJobUrls={trackedJobUrls}
                setTrackedJobUrls={setTrackedJobUrls}
              />
            )}
          </TabsContent>

          <TabsContent value="tracker" className="mt-6">
            <JobTracker cvs={cvs} />
          </TabsContent>

          <TabsContent value="interview" className="mt-6">
            {cvs.length === 0 ? (
              <Card className="border-dashed py-12 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <Briefcase className="w-12 h-12 text-muted-foreground mb-4 opacity-50 animate-bounce" />
                <h3 className="font-semibold text-lg">{t("limitReached")}</h3>
                <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm px-4">
                  {t("noCvs")}
                </p>
                <Button className="mt-4 cursor-pointer" asChild>
                  <Link href="/builder">{t("createNew")}</Link>
                </Button>
              </Card>
            ) : (
              <InterviewSimulator cvs={cvs} />
            )}
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
