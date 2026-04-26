import { resolveTemplate } from "./template";

export async function executeWorkflow(workflow: any) {
  if (!workflow?.nodes) return {};

  const { nodes, edges } = workflow;

  const outputs: Record<string, any> = {};

  // 🔗 pega próximos nodes
  function getNextNodes(nodeId: string) {
    return edges
      .filter((e: any) => e.source === nodeId)
      .map((e: any) => e.target);
  }

  // 🔎 nodes iniciais (sem entrada)
  const startNodes = nodes.filter(
    (n: any) =>
      !edges.some((e: any) => e.target === n.id)
  );

  async function runNode(node: any, input: any) {
    // 🧠 contexto dinâmico
    const context: Record<string, any> = {
      input,
    };

    // adicionar outputs anteriores
    for (const key in outputs) {
      context[`node_${key}`] = outputs[key];
    }

    let result: any = input;

    switch (node.type) {
      case "trigger":
        result = "start";
        break;

      case "ai":
        const prompt = resolveTemplate(
          node.data?.prompt || "",
          context
        );

        // 🔥 aqui depois você conecta OpenAI
        result = `AI respondeu: ${prompt}`;
        break;

      case "action":
        result = resolveTemplate(
          "Executando ação com: {{input}}",
          context
        );
        break;

      default:
        result = input;
    }

    // 💾 salvar output
    outputs[node.id] = result;

    // 🔁 continuar fluxo
    const nextIds = getNextNodes(node.id);

    for (const nextId of nextIds) {
      const nextNode = nodes.find((n: any) => n.id === nextId);
      if (nextNode) {
        await runNode(nextNode, result);
      }
    }
  }

  // 🚀 start
  await Promise.all(
    startNodes.map((n: any) => runNode(n, null))
  );

  return outputs;
}