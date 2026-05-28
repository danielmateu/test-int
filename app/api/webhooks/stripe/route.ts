import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripeApiKey = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const stripe = stripeApiKey ? new Stripe(stripeApiKey, { apiVersion: "2025-01-27" as any }) : null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseSecret, { db: { schema: 'next_auth' } });

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    console.error("[Stripe Webhook] Stripe is not configured or missing Webhook Secret.");
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature") || "";
  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed:`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Received event type: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          console.error("[Stripe Webhook] checkout.session.completed missing userId metadata.");
          break;
        }

        // Recuperar detalles de suscripción
        const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
        const priceId = subscription.items.data[0]?.price.id;
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        console.log(`[Stripe Webhook] checkout.session.completed for user ${userId}. Price: ${priceId}`);

        const { error } = await supabase
          .from("users")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: subscription.status,
            subscription_price_id: priceId,
            subscription_current_period_end: periodEnd
          })
          .eq("id", userId);

        if (error) {
          console.error("[Stripe Webhook] Error updating database in checkout.session.completed:", error.message);
          throw new Error(error.message);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        console.log(`[Stripe Webhook] customer.subscription.updated. Customer: ${customerId}. Status: ${subscription.status}`);

        const { error } = await supabase
          .from("users")
          .update({
            subscription_status: subscription.status,
            subscription_price_id: priceId,
            subscription_current_period_end: periodEnd
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("[Stripe Webhook] Error updating database in customer.subscription.updated:", error.message);
          throw new Error(error.message);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log(`[Stripe Webhook] customer.subscription.deleted. Customer: ${customerId}`);

        const { error } = await supabase
          .from("users")
          .update({
            subscription_status: "canceled",
            subscription_current_period_end: new Date().toISOString()
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("[Stripe Webhook] Error updating database in customer.subscription.deleted:", error.message);
          throw new Error(error.message);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`[Stripe Webhook] Error processing webhook action:`, err.message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
