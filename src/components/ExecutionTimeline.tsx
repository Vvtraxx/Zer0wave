"use client";

import { useState } from "react";

export default function ExecutionTimeline({ logs }: any) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!logs?.length) return null;

  const format = (data: any) => {
    if (typeof data === "string") return data;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="mt-4 bg-black/80 p-4 rounded border border-white/10">
      <h2 className="text-sm mb-4 text-white/80">
        🧠 Execution Timeline
      </h2>

      <div className="relative pl-4">
        {/* linha vertical */}
        <div className="absolute left-1 top-0 bottom-0 w-[2px] bg-white/10" />

        {logs.map((log: any, i: number) => {
          const isOpen = openIndex === i;

          return (
            <div key={i} className="relative mb-4">
              
              {/* bolinha */}
              <div className="absolute -left-[6px] top-2 w-3 h-3 rounded-full bg-white" />

              <div
                onClick={() =>
                  setOpenIndex(isOpen ? null : i)
                }
                className="bg-zinc-800 p-3 rounded cursor-pointer hover:bg-zinc-700 transition"
              >
                {/* header */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/80">
                    Node: {log.nodeId}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      {log.time}ms
                    </span>

                    <span>
                      {log.status === "success" && "🟢"}
                      {log.status === "error" && "🔴"}
                      {log.status === "running" && "🟡"}
                    </span>
                  </div>
                </div>

                {/* expand */}
                {isOpen && (
                  <div className="mt-3 space-y-2 text-xs">
                    
                    <div>
                      <p className="text-gray-400">INPUT</p>
                      <pre className="bg-black/50 p-2 rounded max-h-32 overflow-auto">
                        {format(log.input)}
                      </pre>
                    </div>

                    <div>
                      <p className="text-gray-400">OUTPUT</p>
                      <pre className="bg-black/50 p-2 rounded max-h-32 overflow-auto">
                        {format(log.output)}
                      </pre>
                    </div>

                    {log.error && (
                      <div>
                        <p className="text-red-400">ERROR</p>
                        <pre className="bg-red-900/40 p-2 rounded">
                          {format(log.error)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}