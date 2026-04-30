"use client";

import DebugPanel from "@/components/DebugPanel";

export default function AINode({ id, data }: any) {
  return (
    <div className="bg-purple-600 text-white p-3 rounded w-64 min-h-[140px]">
      <p className="font-bold">🤖 AI</p>

      <textarea
        value={data?.prompt ?? ""}
        onChange={(e) =>
          data?.updateNode?.(id, {
            prompt: e.target.value,
          })
        }
        className="w-full mt-2 p-1 text-black text-xs rounded"
      />

      {/* 🔥 DEBUG */}
      <DebugPanel debug={data?.debug} />
    </div>
  );
}