"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Automations() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [newAutomation, setNewAutomation] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 🔐 pegar usuário
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoadingUser(false);
    }

    getUser();
  }, []);

  // 🔄 buscar automações
  useEffect(() => {
    if (user) fetchAutomations();
  }, [user]);

  async function fetchAutomations() {
    const { data, error } = await supabase
      .from("automations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setAutomations(data || []);
  }

  async function addAutomation() {
    if (!newAutomation || !user) return;

    const { data, error } = await supabase
      .from("automations")
      .insert([
        {
          name: newAutomation,
          prompt: "Descreva o que essa automação deve fazer",
          active: false,
          user_id: user.id,
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

  async function deleteAutomation(id: string) {
    await supabase.from("automations").delete().eq("id", id);
    setAutomations(automations.filter((a) => a.id !== id));
  }

  async function toggleAutomation(id: string, current: boolean) {
    await supabase
      .from("automations")
      .update({ active: !current })
      .eq("id", id);

    setAutomations(
      automations.map((a) =>
        a.id === id ? { ...a, active: !current } : a
      )
    );
  }

  async function runAutomation(item: any) {
    setLoadingId(item.id);

    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({ prompt: item.prompt }),
    });

    const data = await res.json();

    setLoadingId(null);

    alert(data.text);
  }

  // 🧠 LOADING STATE (ESSENCIAL)
  if (loadingUser) {
    return (
      <div className="text-white p-8 pt-24">
        Carregando...
      </div>
    );
  }

  // 🔒 NÃO LOGADO
  if (!user) {
    return (
      <div className="text-white p-8 pt-24">
        Faça login para ver suas automações
      </div>
    );
  }

  // 🚀 APP NORMAL
  return (
    <div className="p-8 pt-24 text-white max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Automations</h1>

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

      <div className="space-y-3">
        {automations.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-zinc-900 p-4 rounded-lg"
          >
            <div className="w-full">
              <p className="font-medium">{item.name}</p>

              <input
                value={item.prompt}
                onChange={(e) =>
                  supabase
                    .from("automations")
                    .update({ prompt: e.target.value })
                    .eq("id", item.id)
                }
                className="text-xs bg-zinc-800 p-1 rounded w-full mt-2"
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
                onClick={() =>
                  toggleAutomation(item.id, item.active)
                }
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