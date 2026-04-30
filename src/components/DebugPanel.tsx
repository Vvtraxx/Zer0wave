"use client";

export default function DebugPanel({ debug }: any) {
  if (!debug) return null;

  const format = (value: any) => {
    if (value === null || value === undefined) return "null";

    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return "[object]";
      }
    }

    return String(value);
  };

  return (
    <div className="mt-2 text-xs bg-black/80 p-2 rounded border border-white/10">
      <div className="flex justify-between items-center">
        <span>⏱ {debug.time ?? 0}ms</span>

        <span>
          {debug.status === "success" ? "🟢" : "🔴"}
        </span>
      </div>

      <div className="mt-2 space-y-1">
        <div>
          <p className="text-gray-400">📥 Input</p>
          <pre className="whitespace-pre-wrap">
            {format(debug.input)}
          </pre>
        </div>

        <div>
          <p className="text-gray-400">📤 Output</p>
          <pre className="whitespace-pre-wrap">
            {format(debug.output)}
          </pre>
        </div>
      </div>

      {debug.error && (
        <div className="mt-2 text-red-400">
          ❌ {format(debug.error)}
        </div>
      )}
    </div>
  );
}