import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { executeWorkflow } from "@/lib/workflowEngine";

const WORKER_ID = "worker-1";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET() {
  const { data: jobs } = await supabase
    .from("job_queue")
    .select("*")
    .eq("status", "pending")
    .limit(5);

  for (const job of jobs || []) {
    // 🔒 lock
    const { data: locked } = await supabase
      .from("job_queue")
      .update({
        status: "running",
        locked_at: new Date(),
        locked_by: WORKER_ID,
      })
      .eq("id", job.id)
      .eq("status", "pending")
      .select()
      .single();

    if (!locked) continue;

    try {
      const result = await executeWorkflow(job.payload);

      await supabase.from("job_queue").update({
        status: "success",
        result,
      }).eq("id", job.id);

    } catch (err: any) {
      const attempts = job.attempts + 1;

      const retry = attempts < job.max_attempts;

      await supabase.from("job_queue").update({
        status: retry ? "pending" : "failed",
        attempts,
        error: err.message,
        run_at: retry
          ? new Date(Date.now() + attempts * 60000)
          : null,
      }).eq("id", job.id);
    }
  }

  return NextResponse.json({ ok: true });
}