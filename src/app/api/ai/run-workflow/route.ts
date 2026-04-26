import { NextResponse } from "next/server";
import { executeWorkflow } from "@/lib/workflowEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await executeWorkflow(body);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      { error: "Erro ao executar workflow" },
      { status: 500 }
    );
  }
}