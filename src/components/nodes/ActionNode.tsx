"use client";

import DebugPanel from "@/components/DebugPanel";

export default function ActionNode({ id, data }: any) {
  return (
    <div className="bg-blue-600 text-white p-3 rounded w-56 min-h-[120px] shadow-lg">
      <p className="font-bold">📤 Action</p>
      <p className="text-xs">Executar ação</p>

      {/* 🔥 DEBUG */}
      <DebugPanel debug={data.debug} />
    </div>
  );
}