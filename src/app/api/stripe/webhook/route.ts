import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ✅ SEM apiVersion (evita erro de tipagem)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  const body = await req.text();

  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error("❌ Webhook signature error:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      // 💰 CHECKOUT FINALIZADO
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const workspaceId = session.metadata?.workspaceId;

        if (!workspaceId) {
          console.warn("⚠️ workspaceId não encontrado");
          break;
        }

        await supabase.from("subscriptions").upsert({
          workspace_id: workspaceId,
          stripe_customer_id: String(session.customer || ""),
          stripe_subscription_id: String(session.subscription || ""),
          plan: "pro",
          status: "active",
        });

        break;
      }

      // 🔄 UPDATE SUBSCRIPTION
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;

        const periodEnd = Number(sub.current_period_end || 0);

        await supabase
          .from("subscriptions")
          .update({
            status: sub.status,
            current_period_end: new Date(periodEnd * 1000),
          })
          .eq("stripe_subscription_id", sub.id);

        break;
      }

      // ❌ CANCELAMENTO
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        await supabase
          .from("subscriptions")
          .update({
            plan: "free",
            status: "canceled",
          })
          .eq("stripe_subscription_id", sub.id);

        break;
      }

      default:
        console.log("ℹ️ Evento ignorado:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("🔥 Webhook processing error:", err);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}