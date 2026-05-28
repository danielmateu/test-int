"use server";

import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripeApiKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeApiKey ? new Stripe(stripeApiKey) : null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseSecret, { db: { schema: 'next_auth' } });

// 1. Obtener el estado de suscripción del usuario
export async function getUserSubscriptionStatusAction(): Promise<{ isPremium: boolean; status: string; currentPeriodEnd?: string; useLocalStorage?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { isPremium: false, status: "free" };
  }

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("subscription_status, subscription_current_period_end")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.warn("[getUserSubscriptionStatusAction] DB query failed, falling back to localStorage detection:", error.message);
      return { isPremium: false, status: "free", useLocalStorage: true };
    }

    if (!user) {
      return { isPremium: false, status: "free" };
    }

    const status = user.subscription_status || "free";
    const periodEnd = user.subscription_current_period_end;

    // Si es active o trialing y no ha expirado
    const isPremium = 
      (status === "active" || status === "trialing") && 
      (!periodEnd || new Date(periodEnd) > new Date());

    return { 
      isPremium, 
      status, 
      currentPeriodEnd: periodEnd || undefined 
    };
  } catch (err: any) {
    console.error("[getUserSubscriptionStatusAction] Exception caught:", err.message);
    return { isPremium: false, status: "free", useLocalStorage: true };
  }
}

// 2. Crear una sesión de Checkout de Stripe (o simulación)
export async function createCheckoutSessionAction(
  priceId: string = "price_premium_monthly",
  locale: string = "es"
): Promise<{ url: string; simulated?: boolean }> {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    throw new Error("No autorizado");
  }

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Si Stripe no está configurado, forzamos simulación demo
  if (!stripe) {
    console.log("[Stripe] Secret key not configured. Using simulated checkout session.");
    return { 
      url: `${appUrl}/${locale}/dashboard?session_id=sim_checkout_${Math.random().toString(36).substring(2, 10)}`,
      simulated: true 
    };
  }

  try {
    // Buscar si el usuario ya tiene customer_id en la base de datos
    const { data: user } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", session.user.id)
      .single();

    let customerId = user?.stripe_customer_id;

    if (!customerId) {
      // Crear cliente en Stripe
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: { userId: session.user.id }
      });
      customerId = customer.id;

      // Guardar customerId en la base de datos
      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", session.user.id);
    }

    // Crear la sesión de suscripción en Stripe
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId, // Debe crearse este price ID en tu Stripe Dashboard
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${appUrl}/${locale}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/${locale}/dashboard`,
      locale: locale === "es" ? "es" : "en",
      metadata: { userId: session.user.id }
    });

    if (!checkoutSession.url) {
      throw new Error("Error al crear URL de Stripe");
    }

    return { url: checkoutSession.url };
  } catch (err: any) {
    console.error("[Stripe checkout error] falling back to simulated session:", err.message);
    return { 
      url: `${appUrl}/${locale}/dashboard?session_id=sim_checkout_${Math.random().toString(36).substring(2, 10)}`,
      simulated: true 
    };
  }
}

// 3. Crear sesión de Portal de Cliente Stripe para gestionar suscripción
export async function createCustomerPortalAction(): Promise<{ url: string; simulated?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!stripe) {
    return { url: `${appUrl}/`, simulated: true };
  }

  try {
    const { data: user } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", session.user.id)
      .single();

    if (!user?.stripe_customer_id) {
      throw new Error("No tienes una cuenta de cobro activa.");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${appUrl}/dashboard`
    });

    return { url: portalSession.url };
  } catch (err: any) {
    console.error("[Stripe portal error]", err.message);
    return { url: `${appUrl}/dashboard`, simulated: true };
  }
}

// 4. Activar/Desactivar Suscripción Premium Simulada
export async function simulateUpgradeAction(enable: boolean = true): Promise<{ success: boolean; useLocalStorage?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  try {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const updateFields = enable ? {
      subscription_status: "active",
      subscription_current_period_end: nextMonth.toISOString(),
      stripe_subscription_id: "sim_sub_" + Math.random().toString(36).substring(2, 12)
    } : {
      subscription_status: "free",
      subscription_current_period_end: new Date().toISOString(),
      stripe_subscription_id: null
    };

    console.log("[simulateUpgradeAction] Setting simulated status to:", enable ? "active" : "free");
    const { error } = await supabase
      .from("users")
      .update(updateFields)
      .eq("id", session.user.id);

    if (error) {
      console.warn("[simulateUpgradeAction] DB update failed. Advising client to fallback to LocalStorage:", error.message);
      return { success: true, useLocalStorage: true };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[simulateUpgradeAction] Exception:", err.message);
    return { success: true, useLocalStorage: true };
  }
}
