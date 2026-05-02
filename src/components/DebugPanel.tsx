"use client";

import { useState } from "react";

export default function DebugPanel({ debug }: any) {
  const [open, setOpen] = useState(false);

  if (!debug) return null;

  const format = (data: any) => {
    if (typeof data === "string") return data;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="mt-2 text-xs bg-black/70 backdrop-blur p-2 rounded border border-white/10">
      
      {/* HEADER */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="text-gray-400">
          ⏱ {debug.time || 0}ms
        </span>

        <div className="flex items-center gap-2">
          <span>
            {debug.status === "success" && "🟢"}
            {debug.status === "error" && "🔴"}
            {debug.status === "running" && "🟡"}
          </span>

          <span className="text-gray-500">
            {open ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* BODY */}
      {open && (
        <div className="mt-2 space-y-2">
          
          {/* INPUT */}
          <div>
            <p className="text-gray-400 mb-1">INPUT</p>
            <pre className="bg-black/50 p-2 rounded overflow-auto max-h-32">
              {format(debug.input)}
            </pre>
          </div>

          {/* OUTPUT */}
          <div>
            <p className="text-gray-400 mb-1">OUTPUT</p>
            <pre className="bg-black/50 p-2 rounded overflow-auto max-h-32">
              {format(debug.output)}
            </pre>
          </div>

          {/* ERROR */}
          {debug.error && (
            <div>
              <p className="text-red-400 mb-1">ERROR</p>
              <pre className="bg-red-900/40 p-2 rounded overflow-auto max-h-32">
                {format(debug.error)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}