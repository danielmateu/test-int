"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, Sparkles, Loader2, CreditCard, RefreshCw, Zap, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import {
  createCheckoutSessionAction,
  createCustomerPortalAction,
  simulateUpgradeAction
} from "@/app/actions/stripe";

interface PricingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isPremium: boolean;
  currentPeriodEnd?: string;
  onSubscriptionUpdate: () => void;
}

export function PricingModal({
  isOpen,
  onOpenChange,
  isPremium,
  currentPeriodEnd,
  onSubscriptionUpdate
}: PricingModalProps) {
  const t = useTranslations("Dashboard");
  const router = useRouter();

  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  // 1. Manejar checkout real de Stripe (con fallback de simulación si no hay claves)
  const handleStripeCheckout = async () => {
    setIsLoadingCheckout(true);
    try {
      const res = await createCheckoutSessionAction("price_premium_monthly", "es");

      console.log(res)

      if (res.simulated) {
        // Stripe no está configurado en el servidor, procedemos con Checkout Simulado
        toast.info("Stripe no está configurado en .env.local. Redirigiendo a pasarela demo...");
        setTimeout(async () => {
          try {
            const upgradeRes = await simulateUpgradeAction(true);
            if (upgradeRes.useLocalStorage) {
              localStorage.setItem("simulated_is_premium", "true");
              localStorage.setItem("simulated_premium_date", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
            }
            onSubscriptionUpdate();
            toast.success("¡Suscripción Premium activada con éxito (Modo Demo)!");
            onOpenChange(false);
            router.refresh();
          } catch (demoErr) {
            toast.error("Error al activar simulación");
          } finally {
            setIsLoadingCheckout(false);
          }
        }, 1500);
      } else {
        // Redirigir a pasarela real de Stripe
        window.location.href = res.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Error al iniciar proceso de suscripción");
      setIsLoadingCheckout(false);
    }
  };

  // 2. Gestionar suscripción real mediante Portal de Stripe
  const handleStripePortal = async () => {
    setIsLoadingPortal(true);
    try {
      const res = await createCustomerPortalAction();
      if (res.simulated) {
        toast.info("Portal simulado: Puedes cancelar o activar tu cuenta con los botones de testeo.");
        setIsLoadingPortal(false);
      } else {
        window.location.href = res.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Error al redirigir al portal de facturación");
      setIsLoadingPortal(false);
    }
  };

  // 3. Activar suscripción simulada con un solo clic (Para pruebas y presentación)
  const handleSimulatedUpgrade = async (enable: boolean) => {
    setIsLoadingDemo(true);
    try {
      const res = await simulateUpgradeAction(enable);

      if (res.useLocalStorage) {
        if (enable) {
          localStorage.setItem("simulated_is_premium", "true");
          localStorage.setItem("simulated_premium_date", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
        } else {
          localStorage.setItem("simulated_is_premium", "false");
          localStorage.removeItem("simulated_premium_date");
        }
      }

      onSubscriptionUpdate();

      if (enable) {
        toast.success("¡Cuenta actualizada a Premium ✨ (Modo Demo)!");
      } else {
        toast.success("¡Cuenta devuelta a Plan Gratuito con éxito!");
      }
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar estado demo");
    } finally {
      setIsLoadingDemo(false);
    }
  };

  // Parsear la fecha del periodo de facturación actual
  const formattedDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl rounded-3xl p-6 overflow-y-auto md:p-8"
      // style={{ maxHeight: "80vh" }}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-primary via-purple-500 to-blue-500 opacity-90" />

        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-black tracking-tight leading-tight flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            {t("pricingTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground max-w-lg mx-auto">
            {t("pricingSubtitle")}
          </DialogDescription>
        </DialogHeader>

        {/* Current status banner */}
        <div className="bg-zinc-50 dark:bg-zinc-950  rounded-2xl border border-dashed flex flex-col sm:flex-row gap-3 items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${isPremium ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-primary/10 text-primary"
              }`}>
              {isPremium ? <Zap className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
            </div>
            <div className="space-y-0.5 text-left">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Estado de tu cuenta</span>
              <p className="text-xs font-bold text-foreground leading-tight">
                {isPremium
                  ? t("pricingStatusPremium", { date: formattedDate })
                  : t("pricingStatusFree")}
              </p>
            </div>
          </div>
          {isPremium && (
            <Button
              variant="outline"
              onClick={handleStripePortal}
              disabled={isLoadingPortal}
              className="h-9 text-xs rounded-xl cursor-pointer"
            >
              {isLoadingPortal ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
              {t("pricingManageSubscription")}
            </Button>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 items-stretch">

          {/* Plan Gratuito Card */}
          <Card className={`border-border/60 bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-xs relative ${!isPremium ? "ring-1 ring-primary/20 border-primary/20" : ""
            }`}>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-bold">{t("pricingFreeTitle")}</CardTitle>
                {!isPremium && <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] rounded-full">Activo</Badge>}
              </div>
              <CardDescription className="text-2xl font-black text-foreground pt-2">0€ <span className="text-xs font-normal text-muted-foreground">/ gratis siempre</span></CardDescription>
            </CardHeader>
            <CardContent className="grow">
              <div className="space-y-3.5 pt-2">
                {t("pricingFreeFeatures").split("\n").map((feat, i) => (
                  <div key={i} className="flex gap-2.5 items-start text-xs text-muted-foreground leading-snug">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>{feat.replace("•", "").trim()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-6 border-t bg-zinc-50/20 dark:bg-zinc-900/10">
              {isPremium ? (
                <Button
                  onClick={() => handleSimulatedUpgrade(false)}
                  disabled={isLoadingDemo}
                  variant="outline"
                  className="w-full text-xs font-semibold cursor-pointer h-10 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  {isLoadingDemo ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                  {t("pricingDemoteSim")}
                </Button>
              ) : (
                <Button disabled variant="secondary" className="w-full text-xs font-semibold h-10 rounded-xl">
                  Plan Actual
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Plan Premium Card */}
          <Card className={`bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-sm relative overflow-hidden ${isPremium
            ? "ring-1 ring-emerald-500/20 border-emerald-500/20"
            : "ring-2 ring-primary border-primary/40"
            }`}>
            {/* Ribbon glow */}
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none select-none">
              <div className="absolute top-3.5 -right-9 bg-linear-to-r from-primary to-purple-600 text-white font-extrabold text-[8px] uppercase tracking-wider py-1 px-9 rotate-45 shadow-xs">
                PRO ✨
              </div>
            </div>

            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-bold text-primary flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-primary animate-pulse" />
                  {t("pricingPremiumTitle")}
                </CardTitle>
                {isPremium && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] rounded-full border border-emerald-500/20">Activo</Badge>}
              </div>
              <CardDescription className="text-2xl font-black text-foreground pt-2">
                {t("pricingPremiumPrice")}
              </CardDescription>
            </CardHeader>
            <CardContent className="grow">
              <div className="space-y-3.5 pt-2">
                {t("pricingPremiumFeatures").split("\n").map((feat, i) => (
                  <div key={i} className="flex gap-2.5 items-start text-xs text-foreground leading-snug font-medium">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat.replace("•", "").trim()}</span>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="pt-6 border-t bg-primary/5">
              {!isPremium ? (
                <div className="flex flex-col gap-2.5 w-full">
                  <Button
                    onClick={handleStripeCheckout}
                    disabled={isLoadingCheckout}
                    className="w-full text-xs font-semibold cursor-pointer bg-linear-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95 h-10 rounded-xl shadow-xs"
                  >
                    {isLoadingCheckout ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        Conectando pasarela...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                        {t("pricingCheckoutReal")}
                      </>
                    )}
                  </Button>

                  {/* Simulated shortcut for faster testing/demoing */}
                  <Button
                    onClick={() => handleSimulatedUpgrade(true)}
                    disabled={isLoadingDemo}
                    variant="outline"
                    className="w-full text-xs font-semibold cursor-pointer border-dashed border-primary/50 text-primary hover:bg-primary/5 h-10 rounded-xl"
                  >
                    {isLoadingDemo ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                    {t("pricingCheckoutSim")}
                  </Button>
                </div>
              ) : (
                <Button disabled variant="outline" className="w-full text-xs font-semibold h-10 rounded-xl border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                  <Check className="w-4 h-4 mr-1.5 text-emerald-500" />
                  Suscrito Premium Pro
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Demo sandbox warnings alert */}
        <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-2xl flex gap-3 items-start mt-6 text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p>
            <strong>Sandbox de Prueba Habilitado:</strong> Para facilitar la evaluación de la plataforma por el usuario, si no configuras claves reales de Stripe, puedes activar o desactivar la suscripción Premium al instante usando el botón <strong>"Simular Premium"</strong>. Se desbloquearán todas las limitaciones de inmediato.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
