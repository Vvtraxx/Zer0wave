"use client";

import DebugPanel from "@/components/DebugPanel";

export default function HttpNode({ data, id }: any) {
  const update = (field: string, value: any) => {
    data?.updateNode?.(id, {
      [field]: value,
    });
  };

  return (
    <div className="bg-blue-900 p-3 rounded w-72 min-h-[180px] text-white">
      <p className="font-bold mb-2">🌐 HTTP</p>

      <select
        value={data?.method ?? "GET"}
        onChange={(e) => update("method", e.target.value)}
        className="w-full mb-2 text-black p-1 rounded"
      >
        <option>GET</option>
        <option>POST</option>
        <option>PUT</option>
        <option>DELETE</option>
      </select>

      <input
        placeholder="https://api.exemplo.com"
        value={data?.url ?? ""}
        onChange={(e) => update("url", e.target.value)}
        className="w-full text-black p-1 rounded mb-2"
      />

      <textarea
        placeholder='Headers JSON {"Authorization":"Bearer {{token}}"}'
        value={data?.headers ?? ""}
        onChange={(e) => update("headers", e.target.value)}
        className="w-full text-black p-1 rounded mb-2"
      />

      <textarea
        placeholder='Body JSON {"msg":"{{input}}"}'
        value={data?.body ?? ""}
        onChange={(e) => update("body", e.target.value)}
        className="w-full text-black p-1 rounded"
      />

      {/* 🔥 DEBUG */}
      <DebugPanel debug={data?.debug} />
    </div>
  );
}