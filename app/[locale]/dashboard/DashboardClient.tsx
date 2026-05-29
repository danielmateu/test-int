"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { FileText, Plus, Trash2, Edit2, LogOut, Briefcase, Zap, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import { deleteCV } from "@/app/actions/cv";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { RecommendedJobs } from "@/components/cv-builder/RecommendedJobs";
import { JobTracker } from "@/components/cv-builder/JobTracker";
import { InterviewSimulator } from "@/components/cv-builder/InterviewSimulator";
import { PricingModal } from "@/components/cv-builder/PricingModal";
import { Analytics } from "@/components/cv-builder/Analytics";
import { getUserSubscriptionStatusAction } from "@/app/actions/stripe";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

  // Estados de Suscripción Premium
  const [isPremium, setIsPremium] = useState(false);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | undefined>(undefined);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const checkSubscription = async () => {
    try {
      const res = await getUserSubscriptionStatusAction();
      if (res.useLocalStorage) {
        const localIsPremium = localStorage.getItem("simulated_is_premium") === "true";
        const localDate = localStorage.getItem("simulated_premium_date") || undefined;
        setIsPremium(localIsPremium);
        setCurrentPeriodEnd(localDate);
      } else {
        setIsPremium(res.isPremium);
        setCurrentPeriodEnd(res.currentPeriodEnd);
      }
    } catch (err) {
      console.error("Error loading subscription in client:", err);
      const localIsPremium = localStorage.getItem("simulated_is_premium") === "true";
      const localDate = localStorage.getItem("simulated_premium_date") || undefined;
      setIsPremium(localIsPremium);
      setCurrentPeriodEnd(localDate);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  const router = useRouter();
  const t = useTranslations("Dashboard");

  const activeCV = cvs[0];
  const activeJobTitle = activeCV?.content?.personalInfo?.jobTitle || "";
  const activeSkills = activeCV?.content?.skills || [];

  const [cvToDeleteId, setCvToDeleteId] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!cvToDeleteId) return;

    try {
      await deleteCV(cvToDeleteId);
      setCvs(cvs.filter(cv => cv.id !== cvToDeleteId));
      toast.success(t("deleteSuccess"));
    } catch (error) {
      toast.error(t("deleteError"));
    } finally {
      setCvToDeleteId(null);
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
    <>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 md:p-12">
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">

          <header className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center border-b pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("title")}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">{t("subtitle")} ({cvs.length}/{isPremium ? 8 : 2} {t("used")})</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              {/* Premium Upgrade Badge Button */}
              <Button
                onClick={() => setIsPricingOpen(true)}
                variant={isPremium ? "outline" : "default"}
                className={`h-9 px-4 rounded-xl text-xs font-bold shrink-0 cursor-pointer ${isPremium
                  ? "border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30"
                  : "bg-linear-to-r from-primary via-purple-500 to-blue-500 hover:opacity-95 shadow-xs text-white"
                  }`}
              >
                {isPremium ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 fill-emerald-500 animate-pulse text-emerald-500" />
                    {t("premiumBadge")}
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 mr-1.5 fill-white text-white" />
                    {t("upgradeButton")}
                  </>
                )}
              </Button>

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
            <TabsList className="grid grid-cols-6 w-full h-auto p-1 gap-1 bg-muted rounded-lg md:grid-cols-6 md:h-9 md:p-[3px] md:gap-0">
              <TabsTrigger value="cvs" className="col-span-3 md:col-span-1 h-9 text-xs sm:text-sm">Mis CVs</TabsTrigger>
              <TabsTrigger value="ats" className="col-span-3 md:col-span-1 h-9 text-xs sm:text-sm">Validador ATS</TabsTrigger>
              <TabsTrigger value="jobs" className="col-span-3 md:col-span-1 h-9 text-xs sm:text-sm">Ofertas de Empleo</TabsTrigger>
              <TabsTrigger value="tracker" className="col-span-3 md:col-span-1 h-9 text-xs sm:text-sm">{t("trackerTab")}</TabsTrigger>
              <TabsTrigger value="interview" className="col-span-3 md:col-span-1 h-9 text-xs sm:text-sm">{t("interviewTab")}</TabsTrigger>
              <TabsTrigger value="analytics" className="col-span-3 md:col-span-1 h-9 text-xs sm:text-sm">Estadísticas</TabsTrigger>
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
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setCvToDeleteId(cv.id); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}

                  {/* Create New Card */}
                  {cvs.length < (isPremium ? 8 : 2) ? (
                    <Link href="/builder">
                      <Card className="border-dashed hover:border-primary transition-colors cursor-pointer h-full min-h-62.5 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Plus className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-medium text-lg">{t("createNew")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{(isPremium ? 8 : 2) - cvs.length} {t("available")}</p>
                      </Card>
                    </Link>
                  ) : (
                    <Card
                      onClick={() => !isPremium && setIsPricingOpen(true)}
                      className={`border-dashed h-full min-h-62.5 flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900/90 opacity-75 ${!isPremium ? "cursor-pointer hover:border-primary transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-900/80" : ""}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-lg text-muted-foreground">{t("limitReached")}</h3>
                      <p className="text-sm text-muted-foreground mt-1 text-center px-4">
                        {isPremium
                          ? "Has alcanzado el límite máximo de 8 currículums."
                          : t("premiumLimitCVError") || t("limitMsg")}
                      </p>
                      {!isPremium && (
                        <span className="text-[10px] font-bold text-primary mt-2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 fill-primary animate-pulse" />
                          Haz clic para mejorar a Premium
                        </span>
                      )}
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
                  isPremium={isPremium}
                  onUpgradeClick={() => setIsPricingOpen(true)}
                />
              )}
            </TabsContent>

            <TabsContent value="tracker" className="mt-6">
              <JobTracker cvs={cvs} isPremium={isPremium} onUpgradeClick={() => setIsPricingOpen(true)} />
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
                <InterviewSimulator
                  cvs={cvs}
                  isPremium={isPremium}
                  onUpgradeClick={() => setIsPricingOpen(true)}
                />
              )}
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <Analytics cvsCount={cvs.length} />
            </TabsContent>
          </Tabs>


        </div>


      </div>
      <PricingModal
        isOpen={isPricingOpen}
        onOpenChange={setIsPricingOpen}
        isPremium={isPremium}
        currentPeriodEnd={currentPeriodEnd}
        onSubscriptionUpdate={checkSubscription}
      />
      <AlertDialog open={!!cvToDeleteId} onOpenChange={(open) => !open && setCvToDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white cursor-pointer">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
