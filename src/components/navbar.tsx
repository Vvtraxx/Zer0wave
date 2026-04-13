import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-md border-b border-white/10 z-20">
      
      <div className="w-full flex justify-between items-center px-8 py-4 text-white">

        <Link href="/" className="text-xl font-bold text-cyan-400 hover:text-cyan-300 transition">
          Zer0wave
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <Link href="/dashboard" className="hover:text-cyan-400 transition">
            Dashboard
          </Link>

          <Link href="/automations" className="hover:text-cyan-400 transition">
            Automations
          </Link>

          <Link href="/docs" className="hover:text-cyan-400 transition">
            Docs
          </Link>
        </div>

        <Link
          href="/login"
          className="bg-cyan-400 text-black px-5 py-2 rounded-md text-sm font-semibold hover:bg-cyan-300 transition"
        >
          Get Started
        </Link>

      </div>

    </nav>
  );
}