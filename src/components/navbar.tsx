"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // pegar usuário atual
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setUser(data.user);
        setLoading(false);
      }
    });

    // listener auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function login() {
    const email = window.prompt("Digite seu email:");

    if (!email || !email.includes("@")) {
      alert("Email inválido");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin, // 🔥 dinâmico
      },
    });

    if (error) {
      console.error(error);
      alert("Erro ao enviar email");
    } else {
      alert("Verifique seu email 📩");
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-md border-b border-white/10 z-20">
      <div className="w-full flex justify-between items-center px-8 py-4 text-white">

        {/* LOGO */}
        <Link
          href="/"
          className="text-xl font-bold text-cyan-400 hover:text-cyan-300 transition"
        >
          Zer0wave
        </Link>

        {/* MENU */}
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

        {/* AUTH */}
        {loading ? (
          <div className="text-sm text-gray-500">...</div>
        ) : user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              {user.email}
            </span>

            <button
              onClick={logout}
              className="bg-red-500 px-4 py-2 rounded-md text-sm hover:bg-red-400 transition"
            >
              Sair
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className="bg-cyan-400 text-black px-5 py-2 rounded-md text-sm font-semibold hover:bg-cyan-300 transition"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}