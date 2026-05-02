"use client";

import { Handle, Position } from "reactflow";
import DebugPanel from "@/components/DebugPanel";

export default function IfNode({ data, id }: any) {
  const update = (field: string, value: any) => {
    data?.updateNode?.(id, {
      [field]: value,
    });
  };

  return (
    <div className="bg-yellow-900 p-3 rounded w-72 text-white relative">
      <p className="font-bold mb-2">🔀 IF</p>

      <input
        placeholder="Valor A"
        value={data?.a ?? ""}
        onChange={(e) => update("a", e.target.value)}
        className="w-full text-black p-1 rounded mb-2"
      />

      <select
        value={data?.op ?? "=="}
        onChange={(e) => update("op", e.target.value)}
        className="w-full text-black p-1 rounded mb-2"
      >
        <option value="==">==</option>
        <option value="!=">!=</option>
        <option value=">">&gt;</option>
        <option value="<">&lt;</option>
        <option value="includes">contains</option>
      </select>

      <input
        placeholder="Valor B"
        value={data?.b ?? ""}
        onChange={(e) => update("b", e.target.value)}
        className="w-full text-black p-1 rounded mb-2"
      />

      {/* 🔥 SAÍDA TRUE */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: 40, background: "#22c55e" }}
      />

      {/* 🔥 SAÍDA FALSE */}
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: 90, background: "#ef4444" }}
      />

      {/* 🔥 ENTRADA */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
      />

      <DebugPanel debug={data?.debug} />
    </div>
  );
}