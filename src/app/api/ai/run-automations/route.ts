import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { executeWorkflow } from "@/lib/workflowEngine";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const now = new Date();

    const { data: automations, error } = await supabase
      .from("automations")
      .select("*")
      .eq("active", true);

    if (error) throw error;

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

      let result;

      // 🧠 usa workflow se existir
      if (auto.workflow) {
        result = await executeWorkflow(auto.workflow);
      } else {
        result = {
          legacy: `Resposta para: ${auto.prompt}`,
        };
      }

      // 💾 salvar execução
      await supabase.from("automation_runs").insert([
        {
          automation_id: auto.id,
          user_id: auto.user_id,
          response: JSON.stringify(result),
          status: "success",
        },
      ]);

      // 🔄 atualizar last_run
      await supabase
        .from("automations")
        .update({ last_run: now })
        .eq("id", auto.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}