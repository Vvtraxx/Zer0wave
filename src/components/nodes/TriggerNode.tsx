"use client";

import DebugPanel from "@/components/DebugPanel";

export default function TriggerNode({ data, id }: any) {
  const update = (field: string, value: any) => {
    data?.updateNode?.(id, {
      [field]: value,
    });
  };

  return (
    <div className="bg-green-600 text-white p-3 rounded w-64 min-h-[130px]">
      <p className="font-bold">⚡ Trigger</p>

      <select
        value={data?.type ?? "manual"}
        onChange={(e) => update("type", e.target.value)}
        className="w-full mt-2 text-black p-1 rounded"
      >
        <option value="manual">Manual</option>
        <option value="cron">Cron</option>
      </select>

      {data?.type === "cron" && (
        <input
          placeholder="*/5 * * * *"
          value={data?.cron ?? ""}
          onChange={(e) => update("cron", e.target.value)}
          className="w-full mt-2 text-black p-1 rounded"
        />
      )}

      {/* 🔥 DEBUG */}
      <DebugPanel debug={data?.debug} />
    </div>
  );
}