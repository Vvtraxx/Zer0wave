import { NextResponse } from "next/server";
import { executeWorkflow } from "@/lib/workflowEngine";

const MAX_EXECUTION_TIME = 15000; // 15s

export async function POST(req: Request) {
  const start = Date.now();

  try {
    // 📦 parse seguro
    let body: any;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "JSON inválido" },
        { status: 400 }
      );
    }

    // 🧱 validação estrutural
    if (!body || !Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow inválido (nodes/edges obrigatórios)",
        },
        { status: 400 }
      );
    }

    // 🛑 evitar execução vazia
    if (body.nodes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow vazio",
        },
        { status: 400 }
      );
    }

    // ⏱ timeout manual (proteção)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout de execução")), MAX_EXECUTION_TIME)
    );

    const executionPromise = executeWorkflow(body);

    const result: any = await Promise.race([
      executionPromise,
      timeoutPromise,
    ]);

    const totalTime = Date.now() - start;

    // 📊 resposta padronizada
    return NextResponse.json({
      success: true,
      meta: {
        totalTime,
        nodeCount: body.nodes.length,
        edgeCount: body.edges.length,
      },
      outputs: result?.outputs || {},
      logs: result?.logs || [],
    });
  } catch (err: any) {
    console.error("🔥 RUN WORKFLOW ERROR:", err);

    const totalTime = Date.now() - start;

    return NextResponse.json(
      {
        success: false,
        meta: {
          totalTime,
        },
        error: err?.message || "Erro interno",
      },
      { status: 500 }
    );
  }
}