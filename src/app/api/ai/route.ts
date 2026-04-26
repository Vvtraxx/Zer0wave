import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const resposta = `Resposta para: ${prompt}`;

    return NextResponse.json({
      text: resposta,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}