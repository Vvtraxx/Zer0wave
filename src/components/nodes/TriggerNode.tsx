"use client";

import DebugPanel from "@/components/DebugPanel";

export default function TriggerNode({ id, data }: any) {
  const update = (field: string, value: any) => {
    data.updateNode(id, {
      [field]: value,
    });
  };

  const type = data.type || "manual";

  return (
    <div className="bg-green-600 text-white p-3 rounded w-64 min-h-[130px] shadow-lg">
      <p className="font-bold">⚡ Trigger</p>

      <select
        value={type}
        onChange={(e) => update("type", e.target.value)}
        className="w-full mt-2 text-black p-1 rounded"
      >
        <option value="manual">Manual</option>
        <option value="cron">Cron</option>
      </select>

      {type === "cron" && (
        <input
          placeholder="*/5 * * * *"
          value={data.cron || ""}
          onChange={(e) => update("cron", e.target.value)}
          className="w-full mt-2 text-black p-1 rounded"
        />
      )}

      {/* 🔥 DEBUG */}
      <DebugPanel debug={data.debug} />
    </div>
  );
}