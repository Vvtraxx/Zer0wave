import { resolveTemplate } from "./template";

export async function executeWorkflow(workflow: any) {
  const { nodes, edges } = workflow;

  const outputs: Record<string, any> = {};
  const logs: any[] = [];

  function getNextNodes(nodeId: string) {
    return edges.filter((e: any) => e.source === nodeId);
  }

  const startNodes = nodes.filter(
    (n: any) => !edges.some((e: any) => e.target === n.id)
  );

  async function runNode(node: any, input: any) {
    const start = Date.now();

    const context: any = { input };
    Object.keys(outputs).forEach((k) => {
      context[`node_${k}`] = outputs[k];
    });

    let result = input;
    let status = "success";
    let error = null;

    try {
      switch (node.type) {
        case "trigger":
          result = { started: true };
          break;

        case "ai":
          const prompt = resolveTemplate(
            node.data?.prompt || "",
            context
          );
          result = `AI: ${prompt}`;
          break;

        case "http":
          const url = resolveTemplate(node.data.url, context);

          const res = await fetch(url);
          result = await res.text();
          break;

        case "if":
          const a = resolveTemplate(node.data.a, context);
          const b = resolveTemplate(node.data.b, context);

          switch (node.data.op) {
            case "==":
              result = a == b;
              break;
            case "!=":
              result = a != b;
              break;
            case "includes":
              result = String(a).includes(String(b));
              break;
            default:
              result = false;
          }
          break;

        case "action":
          result = `Action: ${input}`;
          break;
      }
    } catch (err: any) {
      status = "error";
      error = err.message;
    }

    const time = Date.now() - start;

    outputs[node.id] = result;

    logs.push({
      nodeId: node.id,
      status,
      input,
      output: result,
      error,
      time,
      timestamp: new Date().toISOString(),
    });

    const nextEdges = getNextNodes(node.id);

    for (const edge of nextEdges) {
      if (node.type === "if") {
        if (String(result) !== edge.label) continue;
      }

      const nextNode = nodes.find((n: any) => n.id === edge.target);
      if (nextNode) {
        await runNode(nextNode, result);
      }
    }
  }

  for (const n of startNodes) {
    await runNode(n, null);
  }

  return { outputs, logs };
}