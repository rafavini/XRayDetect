"use client";

import { FormEvent, useState } from "react";

export default function LoginCadastro() {
    const [aba, setAba] = useState<"login" | "cadastro">("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMensagem("");

        const endpoint =
            aba === "login"
                ? "http://localhost:8000/api/login/"
                : "http://localhost:8000/api/cadastrar/";

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("usuario", username); // Salva o nome
                window.location.href = "/analise"; // Redireciona para a tela principal
            } else {
                setMensagem(data.error || "Erro ao autenticar.");
            }
        } catch (err) {
            setMensagem("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-200 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-center text-pink-600 mb-6">
                    {aba === "login" ? "Entrar no sistema" : "Criar uma conta"}
                </h1>

                <div className="flex mb-6 border rounded-full overflow-hidden">
                    <button
                        onClick={() => setAba("login")}
                        className={`flex-1 py-2 text-sm font-medium transition ${aba === "login"
                            ? "bg-pink-500 text-white"
                            : "bg-white text-pink-500 hover:bg-pink-50"
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setAba("cadastro")}
                        className={`flex-1 py-2 text-sm font-medium transition ${aba === "cadastro"
                            ? "bg-pink-500 text-white"
                            : "bg-white text-pink-500 hover:bg-pink-50"
                            }`}
                    >
                        Cadastro
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
                    >
                        {loading
                            ? aba === "login"
                                ? "Entrando..."
                                : "Cadastrando..."
                            : aba === "login"
                                ? "Entrar"
                                : "Cadastrar"}
                    </button>
                </form>

                {mensagem && (
                    <div
                        className={`mt-4 text-sm text-center font-medium ${mensagem.toLowerCase().includes("sucesso") ||
                            mensagem.toLowerCase().includes("bem")
                            ? "text-green-600"
                            : "text-red-600"
                            }`}
                    >
                        {mensagem}
                    </div>
                )}
            </div>
        </div>
    );
}
