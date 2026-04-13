"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Automations() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [newAutomation, setNewAutomation] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 🔄 buscar do banco
  useEffect(() => {
    fetchAutomations();
  }, []);

  async function fetchAutomations() {
    const { data, error } = await supabase
      .from("automations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (data) setAutomations(data);
  }

  // ➕ adicionar no banco
  async function addAutomation() {
    if (!newAutomation) return;

    const { data, error } = await supabase
      .from("automations")
      .insert([
        {
          name: newAutomation,
          prompt: "Descreva o que essa automação deve fazer",
        },
      ])
      .select();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setAutomations([data[0], ...automations]);
      setNewAutomation("");
    }
  }

  // 🔄 toggle (banco)
  async function toggleAutomation(id: string) {
    const item = automations.find((a) => a.id === id);
    if (!item) return;

    await supabase
      .from("automations")
      .update({ active: !item.active })
      .eq("id", id);

    setAutomations(
      automations.map((a) =>
        a.id === id ? { ...a, active: !a.active } : a
      )
    );
  }

  // ❌ delete (banco)
  async function deleteAutomation(id: string) {
    await supabase.from("automations").delete().eq("id", id);

    setAutomations(automations.filter((a) => a.id !== id));
  }

  // ✏️ editar prompt (banco)
  async function updatePrompt(id: string, newPrompt: string) {
    await supabase
      .from("automations")
      .update({ prompt: newPrompt })
      .eq("id", id);

    setAutomations(
      automations.map((item) =>
        item.id === id ? { ...item, prompt: newPrompt } : item
      )
    );
  }

  // 🧠 testar IA
  async function testAI() {
    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({
        prompt: "Responda como um atendente educado: olá",
      }),
    });

    const data = await res.json();
    alert(data.text);
  }

  // 🚀 executar automação
  async function runAutomation(item: any) {
    setLoadingId(item.id);

    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({
        prompt: item.prompt,
      }),
    });

    const data = await res.json();

    setLoadingId(null);

    alert(`Resultado:\n\n${data.text}`);
  }

  return (
    <div className="p-8 pt-24 text-white max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Automations</h1>

      {/* Teste IA */}
      <button
        onClick={testAI}
        className="bg-purple-500 px-4 py-2 rounded mb-6"
      >
        Testar IA
      </button>

      {/* Input */}
      <div className="flex gap-3 mb-6">
        <input
          value={newAutomation}
          onChange={(e) => setNewAutomation(e.target.value)}
          placeholder="Nova automação..."
          className="flex-1 p-2 rounded bg-zinc-900 border border-white/10"
        />

        <button
          onClick={addAutomation}
          className="bg-cyan-400 text-black px-4 rounded"
        >
          Add
        </button>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {automations.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-zinc-900 p-4 rounded-lg"
          >
            <div className="w-full">
              <p className="font-medium">{item.name}</p>

              <p className="text-xs text-gray-400 mt-2">Prompt da IA:</p>

              <input
                value={item.prompt}
                onChange={(e) =>
                  updatePrompt(item.id, e.target.value)
                }
                className="text-xs bg-zinc-800 p-1 rounded w-full outline-none"
              />

              <span
                className={
                  item.active
                    ? "text-green-400 text-sm"
                    : "text-gray-400 text-sm"
                }
              >
                {item.active ? "Ativo" : "Inativo"}
              </span>
            </div>

            <div className="flex gap-3 ml-4">
              <button
                onClick={() => runAutomation(item)}
                disabled={loadingId === item.id}
                className="text-sm bg-purple-500 px-3 py-1 rounded"
              >
                {loadingId === item.id ? "Rodando..." : "Run"}
              </button>

              <button
                onClick={() => toggleAutomation(item.id)}
                className="text-sm bg-yellow-400 text-black px-3 py-1 rounded"
              >
                Toggle
              </button>

              <button
                onClick={() => deleteAutomation(item.id)}
                className="text-sm bg-red-500 px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}