"use client";

export default function ExecutionTimeline({ logs }: any) {
  if (!logs?.length) return null;

  return (
    <div className="mt-4 bg-black/80 p-4 rounded">
      <h2 className="text-sm mb-3">🧠 Execution Timeline</h2>

      <div className="space-y-2">
        {logs.map((log: any, i: number) => (
          <div
            key={i}
            className="p-2 bg-zinc-800 rounded text-xs"
          >
            <div className="flex justify-between">
              <span>Node: {log.nodeId}</span>
              <span>{log.time}ms</span>
            </div>

            <div>
              {log.status === "success" ? "🟢" : "🔴"}
            </div>

            <pre className="mt-1 whitespace-pre-wrap">
              {JSON.stringify(log.output, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
