export function resolveTemplate(
  text: string,
  context: Record<string, any>
) {
  if (!text) return "";

  return text.replace(/{{(.*?)}}/g, (_, key) => {
    const cleanKey = key.trim();
    return context[cleanKey] ?? "";
  });
}