"use client";

import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";

import "reactflow/dist/style.css";

import AINode from "@/components/nodes/AINode";
import TriggerNode from "@/components/nodes/TriggerNode";
import ActionNode from "@/components/nodes/ActionNode";

const nodeTypes = {
  ai: AINode,
  trigger: TriggerNode,
  action: ActionNode,
};

export default function WorkflowEditor({ value, onChange }: any) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    value?.nodes || []
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    value?.edges || []
  );

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  // 💾 salvar workflow corretamente
  useEffect(() => {
    onChange({ nodes, edges });
  }, [nodes, edges]);

  // 🧠 atualizar data do node (CORRETO)
  const updateNodeData = (id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  };

  // ➕ criar nodes
  function createNode(type: string) {
    const id = Date.now().toString();

    let data: any = {};

    if (type === "ai") data = { prompt: "" };

    setNodes((nds) => [
      ...nds,
      {
        id,
        type,
        position: {
          x: Math.random() * 250,
          y: Math.random() * 250,
        },
        data,
      },
    ]);
  }

  // 🧪 rodar workflow direto (debug)
  async function runWorkflow() {
    const res = await fetch("/api/run-workflow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nodes, edges }),
    });

    const data = await res.json();

    console.log("RESULT:", data);
    alert(JSON.stringify(data, null, 2));
  }

  return (
    <div>
      {/* 🔥 CONTROLES */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => createNode("trigger")}
          className="bg-green-500 px-3 py-1 rounded text-sm"
        >
          + Trigger
        </button>

        <button
          onClick={() => createNode("ai")}
          className="bg-purple-500 px-3 py-1 rounded text-sm"
        >
          + AI
        </button>

        <button
          onClick={() => createNode("action")}
          className="bg-blue-500 px-3 py-1 rounded text-sm"
        >
          + Action
        </button>

        <button
          onClick={runWorkflow}
          className="bg-red-500 px-3 py-1 rounded text-sm"
        >
          ▶ Run Flow
        </button>
      </div>

      {/* 🎛️ EDITOR */}
      <div className="h-[400px] bg-zinc-900 rounded">
        <ReactFlow
          nodes={nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              updateNode: updateNodeData,
            },
          }))}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}