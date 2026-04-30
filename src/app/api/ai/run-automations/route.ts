import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { executeWorkflow } from "@/lib/workflowEngine";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const startedAt = Date.now();

  try {
    const now = new Date();

    const { data: automations, error } = await supabase
      .from("automations")
      .select("*")
      .eq("active", true);

    if (error) throw error;

    const results = [];

    for (const auto of automations || []) {
      const runStart = Date.now();

      try {
        // ⏱ ignorar se não tem intervalo
        if (!auto.interval_minutes) continue;

        const lastRun = auto.last_run
          ? new Date(auto.last_run)
          : null;

        const shouldRun =
          !lastRun ||
          now.getTime() - lastRun.getTime() >
            auto.interval_minutes * 60000;

        if (!shouldRun) continue;

        // 🔒 LOCK SIMPLES (evita duplicação)
        const { data: locked } = await supabase
          .from("automations")
          .update({ last_run: now })
          .eq("id", auto.id)
          .select()
          .single();

        if (!locked) continue;

        let result: any;
        let status = "success";
        let errorMsg = null;

        try {
          if (auto.workflow) {
            result = await executeWorkflow(auto.workflow);
          } else {
            result = {
              legacy: `Resposta para: ${auto.prompt}`,
            };
          }
        } catch (err: any) {
          status = "error";
          errorMsg = err.message;
          result = null;
        }

        const duration = Date.now() - runStart;

        // 💾 salvar execução COMPLETA
        await supabase.from("automation_runs").insert([
          {
            automation_id: auto.id,
            user_id: auto.user_id,
            response: result ? JSON.stringify(result) : null,
            status,
            error: errorMsg,
            duration_ms: duration,
          },
        ]);

        results.push({
          id: auto.id,
          status,
          duration,
        });
      } catch (err: any) {
        console.error("Erro em automação:", auto.id, err);

        await supabase.from("automation_runs").insert([
          {
            automation_id: auto.id,
            user_id: auto.user_id,
            status: "error",
            error: err.message,
          },
        ]);
      }
    }

    return NextResponse.json({
      ok: true,
      ran: results.length,
      totalTime: Date.now() - startedAt,
      results,
    });
  } catch (err: any) {
    console.error("CRON ERROR:", err);

    return NextResponse.json(
      {
        ok: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}