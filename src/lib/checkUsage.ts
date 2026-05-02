import { createClient } from "@supabase/supabase-js";
import { PLAN_LIMITS } from "./planLimits";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function checkUsage(workspaceId: string) {
  // 🔥 pega subscription (seguro)
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const plan = sub?.plan || "free";
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];

  // 🔥 pega ou cria usage
  let { data: usage } = await supabase
    .from("usage_metrics")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  // 🧠 se não existir → cria
  if (!usage) {
    const { data: created } = await supabase
      .from("usage_metrics")
      .insert({
        workspace_id: workspaceId,
        runs_count: 0,
      })
      .select()
      .single();

    usage = created;
  }

  // 🚫 valida limite
  if ((usage.runs_count || 0) >= limit.runs) {
    throw new Error("Limite do plano atingido");
  }

  return {
    plan,
    usage,
    limit,
  };
}