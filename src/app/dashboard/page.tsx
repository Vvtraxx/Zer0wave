export default function Dashboard() {
  return (
    <div className="p-8 pt-24 text-white">

      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Resumo */}
      <div className="flex gap-6 mb-8">
        <div className="bg-zinc-900 p-4 rounded-lg">
          <p>Total</p>
          <h2 className="text-xl font-bold">3</h2>
        </div>

        <div className="bg-zinc-900 p-4 rounded-lg">
          <p>Ativas</p>
          <h2 className="text-xl font-bold text-green-400">2</h2>
        </div>

        <div className="bg-zinc-900 p-4 rounded-lg">
          <p>Inativas</p>
          <h2 className="text-xl font-bold text-red-400">1</h2>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-zinc-900 p-6 rounded-lg">
        <h2 className="mb-4 font-semibold">Suas automações</h2>

        <ul className="space-y-3">
          <li className="flex justify-between">
            <span>Auto responder mensagem</span>
            <span className="text-green-400">Ativo</span>
          </li>

          <li className="flex justify-between">
            <span>Gerar texto com IA</span>
            <span className="text-green-400">Ativo</span>
          </li>

          <li className="flex justify-between">
            <span>Salvar ideia rápida</span>
            <span className="text-gray-400">Inativo</span>
          </li>
        </ul>
      </div>

      {/* Botão */}
      <button className="mt-6 bg-cyan-400 text-black px-5 py-2 rounded-md font-semibold hover:bg-cyan-300 transition">
        + Nova automação
      </button>

    </div>
  );
}