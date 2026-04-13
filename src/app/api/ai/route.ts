async function testAI() {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({
        prompt: "Responda como um atendente educado: olá",
      }),
    });

    const text = await res.text(); // 👈 ao invés de json
    console.log(text);

    alert(text);
  } catch (err) {
    console.error(err);
    alert("Erro na API");
  }
}