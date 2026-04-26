"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import WorkflowEditor from "@/components/WorkflowEditor";

export default function Automations() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [newAutomation, setNewAutomation] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [editingPrompts, setEditingPrompts] = useState<any>({});
  const [selectedAutomation, setSelectedAutomation] = useState<any>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [editingWorkflow, setEditingWorkflow] = useState<any>(null);

  // 🔐 USER
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoadingUser(false);
    }
    getUser();
  }, []);

  // 🔄 FETCH
  useEffect(() => {
    if (user) fetchAutomations();
  }, [user]);

  async function fetchAutomations() {
    const { data } = await supabase
      .from("automations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setAutomations(data || []);
  }

  // ➕ ADD
  async function addAutomation() {
    if (!newAutomation || !user) return;

    const { data } = await supabase
      .from("automations")
      .insert([
        {
          name: newAutomation,
          prompt: "Descreva o que essa automação deve fazer",
          active: false,
          user_id: user.id,
          interval_minutes: 0,
          workflow: null,
        },
      ])
      .select();

    if (data) {
      setAutomations((prev) => [data[0], ...prev]);
      setNewAutomation("");
    }
  }

  // ❌ DELETE
  async function deleteAutomation(id: string) {
    await supabase.from("automations").delete().eq("id", id);
    setAutomations((prev) => prev.filter((a) => a.id !== id));
  }

  // 🔄 TOGGLE
  async function toggleAutomation(id: string, current: boolean) {
    await supabase
      .from("automations")
      .update({ active: !current })
      .eq("id", id);

    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, active: !current } : a
      )
    );
  }

  // ✍️ PROMPT
  function handlePromptChange(id: string, value: string) {
    setEditingPrompts((prev: any) => ({ ...prev, [id]: value }));
  }

  async function savePrompt(id: string) {
    const value = editingPrompts[id];
    if (value === undefined) return;

    await supabase
      .from("automations")
      .update({ prompt: value })
      .eq("id", id);

    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, prompt: value } : a
      )
    );
  }

  // ⏱ INTERVALO
  async function updateInterval(id: string, value: number) {
    await supabase
      .from("automations")
      .update({ interval_minutes: value })
      .eq("id", id);

    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, interval_minutes: value } : a
      )
    );
  }

  // 🤖 RUN
  async function runAutomation(item: any) {
    setLoadingId(item.id);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: item.prompt }),
      });

      const data = await res.json();

      await supabase.from("automation_runs").insert([
        {
          automation_id: item.id,
          user_id: user.id,
          response: data.text,
          status: "success",
        },
      ]);

      alert(data.text);
    } catch (err: any) {
      await supabase.from("automation_runs").insert([
        {
          automation_id: item.id,
          user_id: user.id,
          status: "error",
          error: err.message,
        },
      ]);

      alert("Erro ao rodar automação");
    }

    setLoadingId(null);
  }

  // 📊 RUNS
  async function fetchRuns(id: string) {
    const { data } = await supabase
      .from("automation_runs")
      .select("*")
      .eq("automation_id", id)
      .order("created_at", { ascending: false });

    setRuns(data || []);
  }

  if (loadingUser) return <div className="text-white p-8 pt-24">Carregando...</div>;
  if (!user) return <div className="text-white p-8 pt-24">Faça login</div>;

  return (
    <div className="p-8 pt-24 text-white max-w-3xl mx-auto">
      <h1 className="text-2xl mb-6">Automations</h1>

      {/* ADD */}
      <div className="flex gap-2 mb-6">
        <input
          value={newAutomation}
          onChange={(e) => setNewAutomation(e.target.value)}
          className="flex-1 p-2 bg-zinc-900 rounded"
        />
        <button onClick={addAutomation} className="bg-cyan-400 px-4 rounded">
          Add
        </button>
      </div>

      {/* LISTA */}
      {automations.map((item) => (
        <div key={item.id} className="bg-zinc-900 p-4 mb-3 rounded">
          <p>{item.name}</p>

          <input
            type="number"
            value={item.interval_minutes || 0}
            onChange={(e) =>
              updateInterval(item.id, Number(e.target.value))
            }
            className="mt-2 bg-zinc-800 p-1 rounded w-20"
          />

          <textarea
            value={editingPrompts[item.id] ?? item.prompt}
            onChange={(e) =>
              handlePromptChange(item.id, e.target.value)
            }
            onBlur={() => savePrompt(item.id)}
            className="w-full mt-2 bg-zinc-800 p-2 rounded"
          />

          <div className="flex gap-2 mt-3">
            <button onClick={() => runAutomation(item)} className="bg-purple-500 px-3 py-1 rounded">
              Run
            </button>

            <button onClick={() => toggleAutomation(item.id, item.active)} className="bg-yellow-400 px-3 py-1 rounded">
              Toggle
            </button>

            <button onClick={() => deleteAutomation(item.id)} className="bg-red-500 px-3 py-1 rounded">
              Delete
            </button>

            <button
              onClick={() => {
                setSelectedAutomation(item);
                fetchRuns(item.id);
              }}
              className="bg-blue-500 px-3 py-1 rounded"
            >
              Runs
            </button>

            <button
              onClick={() => setEditingWorkflow(item)}
              className="bg-indigo-500 px-3 py-1 rounded"
            >
              Workflow
            </button>
          </div>
        </div>
      ))}

      {/* DASHBOARD */}
      {selectedAutomation && (
        <div className="mt-10 bg-zinc-900 p-6 rounded">
          <h2>Execuções - {selectedAutomation.name}</h2>

          <button onClick={() => setSelectedAutomation(null)} className="bg-red-500 px-3 py-1 rounded mb-4">
            Fechar
          </button>

          {runs.map((run) => (
            <div key={run.id} className="bg-zinc-800 p-3 mb-2 rounded">
              <div className="flex justify-between text-xs">
                <span>{new Date(run.created_at).toLocaleString()}</span>
                <span>{run.status === "success" ? "🟢" : "🔴"}</span>
              </div>
              <p className="mt-2">{run.response || run.error}</p>
            </div>
          ))}
        </div>
      )}

      {/* WORKFLOW */}
      {editingWorkflow && (
        <div className="mt-10 bg-zinc-900 p-6 rounded">
          <h2>Workflow - {editingWorkflow.name}</h2>

          <WorkflowEditor
            value={editingWorkflow.workflow}
            onChange={async (wf: any) => {
              await supabase
                .from("automations")
                .update({ workflow: wf })
                .eq("id", editingWorkflow.id);
            }}
          />

          <button
            onClick={() => setEditingWorkflow(null)}
            className="mt-4 bg-red-500 px-3 py-1 rounded"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}