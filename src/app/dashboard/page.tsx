"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

export default function Dashboard() {
  const [runs, setRuns] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: "all",
    automation: "all",
  });

  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [runs, filters]);

  async function fetchData() {
    const { data: runsData } = await supabase
      .from("automation_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    const { data: autos } = await supabase
      .from("automations")
      .select("id, name");

    setRuns(runsData || []);
    setAutomations(autos || []);
  }

  function applyFilters() {
    let data = [...runs];

    if (filters.status !== "all") {
      data = data.filter((r) => r.status === filters.status);
    }

    if (filters.automation !== "all") {
      data = data.filter(
        (r) => r.automation_id === filters.automation
      );
    }

    setFiltered(data);
    generateStats(data);
  }

  function generateStats(data: any[]) {
    const success = data.filter((r) => r.status === "success").length;
    const error = data.filter((r) => r.status === "error").length;

    const avg =
      data.reduce((acc, r) => acc + (r.duration_ms || 0), 0) /
      (data.length || 1);

    setStats({
      total: data.length,
      success,
      error,
      avg: Math.round(avg),
    });
  }

  // 📈 gráfico linha
  const lineData = filtered.map((r) => ({
    time: format(new Date(r.created_at), "HH:mm"),
    duration: r.duration_ms || 0,
  }));

  // 🥧 gráfico status
  const pieData = [
    { name: "Sucesso", value: stats.success || 0 },
    { name: "Erro", value: stats.error || 0 },
  ];

  return (
    <div className="p-8 text-white max-w-7xl mx-auto">
      <h1 className="text-2xl mb-6">📊 Dashboard SaaS</h1>

      {/* 🔍 FILTROS */}
      <div className="flex gap-4 mb-6">
        <select
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value }))
          }
          className="bg-zinc-900 p-2 rounded"
        >
          <option value="all">Todos status</option>
          <option value="success">Sucesso</option>
          <option value="error">Erro</option>
        </select>

        <select
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              automation: e.target.value,
            }))
          }
          className="bg-zinc-900 p-2 rounded"
        >
          <option value="all">Todas automações</option>
          {automations.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🔥 KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card title="Execuções" value={stats.total} />
        <Card title="Sucesso" value={stats.success} />
        <Card title="Erros" value={stats.error} />
        <Card title="Tempo médio" value={`${stats.avg} ms`} />
      </div>

      {/* 📈 GRÁFICOS */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Linha */}
        <div className="bg-zinc-900 p-4 rounded h-[300px]">
          <h2 className="mb-2">Tempo de execução</h2>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="duration" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pizza */}
        <div className="bg-zinc-900 p-4 rounded h-[300px]">
          <h2 className="mb-2">Status</h2>

          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={80}
                label
              >
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📜 HISTÓRICO */}
      <div className="bg-zinc-900 p-4 rounded">
        <h2 className="mb-4">Histórico</h2>

        <div className="space-y-2 max-h-[400px] overflow-auto">
          {filtered.map((run) => (
            <div
              key={run.id}
              className="bg-zinc-800 p-3 rounded text-sm"
            >
              <div className="flex justify-between">
                <span>
                  {new Date(run.created_at).toLocaleString()}
                </span>
                <span>
                  {run.status === "success" ? "🟢" : "🔴"}
                </span>
              </div>

              <div className="text-xs mt-1">
                ⏱ {run.duration_ms || 0} ms
              </div>

              {run.error && (
                <p className="text-red-400 text-xs">
                  ❌ {run.error}
                </p>
              )}

              {run.response && (
                <pre className="text-xs mt-2 whitespace-pre-wrap">
                  {run.response}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-zinc-900 p-4 rounded">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-xl">{value}</p>
    </div>
  );
}