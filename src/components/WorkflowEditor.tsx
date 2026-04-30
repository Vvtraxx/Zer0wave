"use client";

import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
} from "reactflow";

import "reactflow/dist/style.css";

import AINode from "@/components/nodes/AINode";
import TriggerNode from "@/components/nodes/TriggerNode";
import ActionNode from "@/components/nodes/ActionNode";
import HttpNode from "@/components/nodes/HttpNode";
import IfNode from "@/components/nodes/IfNode";

import ExecutionTimeline from "@/components/ExecutionTimeline";

const nodeTypes = {
  ai: AINode,
  trigger: TriggerNode,
  action: ActionNode,
  http: HttpNode,
  if: IfNode,
};

export default function WorkflowEditor({ value, onChange }: any) {
  const [nodes, setNodes, onNodesChange] = useNodesState(value?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(value?.edges || []);

  const [logs, setLogs] = useState<any[]>([]);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // 🔗 conexão com IF inteligente
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: Date.now().toString(),
      };

      const sourceNode = nodes.find((n) => n.id === params.source);

      if (sourceNode?.type === "if") {
        const branch = prompt("Digite: true ou false");

        if (branch !== "true" && branch !== "false") {
          alert("Use apenas 'true' ou 'false'");
          return;
        }

        newEdge.label = branch;
      }

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes]
  );

  // 💾 salvar workflow
  useEffect(() => {
    onChange({ nodes, edges });
  }, [nodes, edges]);

  // 🧠 update correto (SEM mutação direta)
  const updateNodeData = (id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            }
          : node
      )
    );
  };

  // ➕ criar nodes
  function createNode(type: string) {
    const id = Date.now().toString();

    let data: any = {};

    switch (type) {
      case "ai":
        data = { prompt: "" };
        break;

      case "http":
        data = {
          method: "GET",
          url: "",
          headers: "",
          body: "",
        };
        break;

      case "if":
        data = {
          a: "{{input}}",
          op: "==",
          b: "",
        };
        break;
    }

    setNodes((nds) => [
      ...nds,
      {
        id,
        type,
        position: {
          x: Math.random() * 400,
          y: Math.random() * 400,
        },
        data,
      },
    ]);
  }

  // 🧪 EXECUÇÃO COM TIMELINE VISUAL
  async function runWorkflow() {
    setIsRunning(true);
    setLogs([]);
    setActiveNode(null);

    try {
      const res = await fetch("/api/run-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nodes, edges }),
      });

      const data = await res.json();

      setLogs(data.logs || []);

      // 🎬 animação estilo DevTools
      for (const log of data.logs) {
        setActiveNode(log.nodeId);

        await new Promise((r) => setTimeout(r, 500));
      }

      setActiveNode(null);
    } catch (err) {
      console.error("Erro:", err);
    }

    setIsRunning(false);
  }

  return (
    <div>
      {/* 🔥 CONTROLES */}
      <div className="flex gap-2 mb-2 flex-wrap">
        <button
          onClick={() => createNode("trigger")}
          className="bg-green-500 px-3 py-1 rounded text-sm"
        >
          + Trigger
        </button>

        <button
          onClick={() => createNode("http")}
          className="bg-blue-500 px-3 py-1 rounded text-sm"
        >
          + HTTP
        </button>

        <button
          onClick={() => createNode("ai")}
          className="bg-purple-500 px-3 py-1 rounded text-sm"
        >
          + AI
        </button>

        <button
          onClick={() => createNode("if")}
          className="bg-yellow-500 px-3 py-1 rounded text-sm"
        >
          + IF
        </button>

        <button
          onClick={() => createNode("action")}
          className="bg-indigo-500 px-3 py-1 rounded text-sm"
        >
          + Action
        </button>

        <button
          onClick={runWorkflow}
          disabled={isRunning}
          className="bg-red-500 px-3 py-1 rounded text-sm"
        >
          {isRunning ? "Rodando..." : "▶ Run Flow"}
        </button>
      </div>

      {/* 🎛️ EDITOR */}
      <div className="h-[500px] bg-zinc-900 rounded">
        <ReactFlow
          nodes={nodes.map((node) => {
            const log = logs.find((l) => l.nodeId === node.id);

            return {
              ...node,

              // 🔥 HIGHLIGHT ATIVO
              style:
                node.id === activeNode
                  ? {
                      border: "2px solid #22c55e",
                      boxShadow: "0 0 10px #22c55e",
                    }
                  : {},

              data: {
                ...node.data,
                id: node.id,
                updateNode: updateNodeData,
                debug: log || null,
              },
            };
          })}
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

      {/* 🧠 TIMELINE */}
      <ExecutionTimeline logs={logs} />
    </div>
  );
}