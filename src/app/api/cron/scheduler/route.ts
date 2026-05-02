import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET() {
  const now = new Date();

  const { data: automations } = await supabase
    .from("automations")
    .select("*")
    .eq("active", true);

  for (const auto of automations || []) {
    if (!auto.interval_minutes) continue;

    const lastRun = auto.last_run
      ? new Date(auto.last_run)
      : null;

    const shouldRun =
      !lastRun ||
      now.getTime() - lastRun.getTime() >
        auto.interval_minutes * 60000;

    if (!shouldRun) continue;

    // 🚀 cria job
    await supabase.from("job_queue").insert({
      automation_id: auto.id,
      user_id: auto.user_id,
      payload: auto.workflow,
      status: "pending",
    });

    // atualiza last_run
    await supabase
      .from("automations")
      .update({ last_run: now })
      .eq("id", auto.id);
  }

  return NextResponse.json({ ok: true });
}