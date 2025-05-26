"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

interface Resultado {
    paciente: string;
    nome: string;
    probabilidade: number;
    status: string;
    classe: string;
    imagem: string;
}

export default function AnaliseFraturas() {
    const [usuario, setUsuario] = useState<string | null>(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nomePaciente, setNomePaciente] = useState("");
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [resultados, setResultados] = useState<Resultado[]>([]);

    useEffect(() => {
        const user = localStorage.getItem("usuario");
        if (user) {
            setUsuario(user);
        } else {
            window.location.href = "/login"; // Redireciona se não estiver logado
        }
    }, []);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const filesWithPreview = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages(filesWithPreview);
    };


    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!nomePaciente.trim()) {
            alert("Digite o nome do paciente.");
            return;
        }

        if (images.length === 0) {
            alert("Por favor, selecione pelo menos uma imagem.");
            return;
        }

        setLoading(true);
        const resultadosTemp: Resultado[] = [];

        for (const { file, preview } of images) {
            const formData = new FormData();
            formData.append("imagem", file);
            formData.append("paciente", nomePaciente);

            try {
                const res = await fetch("http://127.0.0.1:8000/api/classificar/", {
                    method: "POST",
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    resultadosTemp.push({
                        paciente: nomePaciente,
                        nome: file.name,
                        probabilidade: Math.round(data.resultados[0].probabilidade * 100),
                        status:
                            data.resultados[0].classe === "fraturadas"
                                ? "Alta probabilidade de fratura"
                                : "Baixa probabilidade de fratura",
                        classe: data.resultados[0].classe,
                        imagem: preview, // ← adiciona preview no resultado
                    });
                } else {
                    resultadosTemp.push({
                        paciente: nomePaciente,
                        nome: file.name,
                        probabilidade: 0,
                        status: "Erro na análise",
                        classe: "erro",
                        imagem: preview,
                    });
                }
            } catch (error) {
                resultadosTemp.push({
                    paciente: nomePaciente,
                    nome: file.name,
                    probabilidade: 0,
                    status: "Erro na conexão",
                    classe: "erro",
                    imagem: preview,
                });
            }
        }


        setResultados((prev) => [...prev, ...resultadosTemp]);
        setLoading(false);
        setNomePaciente("");
        setImages([]);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {usuario && (
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Bem-vindo, {usuario}</h1>
                    {!mostrarFormulario && (
                        <button
                            onClick={() => setMostrarFormulario(true)}
                            className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded"
                        >
                            Adicionar Paciente
                        </button>
                    )}
                </div>
            )}

            {mostrarFormulario && (
                <>
                    <form
                        onSubmit={handleSubmit}
                        className="border-2 border-dashed border-pink-300 rounded-lg p-8 text-center mb-8"
                    >
                        <div className="mb-4">
                            <label className="block mb-2 text-sm text-gray-700 font-medium">Nome do Paciente:</label>
                            <input
                                type="text"
                                value={nomePaciente}
                                onChange={(e) => setNomePaciente(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                                placeholder="Ex: João da Silva"
                            />

                        </div>

                        <div className="text-pink-500 text-3xl mb-4">⬆</div>
                        <p className="mb-4 text-gray-600">
                            Selecione imagens de exame do paciente
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            multiple
                            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-100 file:text-pink-800 hover:file:bg-pink-200 mb-4"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 ${loading ? "opacity-50" : ""
                                }`}
                        >
                            {loading ? "Enviando..." : "Analisar Imagens"}
                        </button>
                    </form>

                    {images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            {images.map((img, i) => (
                                <div key={i} className="border rounded overflow-hidden flex items-center justify-center h-40 bg-gray-50">
                                    <img src={img.preview} alt={`Prévia ${i}`} className="max-h-full max-w-full object-contain" />
                                </div>
                            ))}
                        </div>
                    )}



                    {resultados.length > 0 && (
                        <>
                            <h2 className="text-xl font-semibold mb-4">Resultados da Análise</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {resultados.map((resultado, index) => (
                                    <div
                                        key={index}
                                        className={`flex border-2 rounded-lg overflow-hidden shadow transition-all duration-300 ${resultado.classe === "fraturadas" ? "border-red-400" : "border-green-400"
                                            }`}
                                    >
                                        <div className="w-1/2 bg-gray-100 flex items-center justify-center h-40">
                                            <img
                                                src={resultado.imagem}
                                                alt={resultado.nome}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        </div>
                                        <div className="w-1/2 p-4">
                                            <h3 className="font-semibold text-gray-800">{resultado.nome}</h3>
                                            <p className="text-sm text-gray-600 mb-1">
                                                Paciente: <strong>{resultado.paciente}</strong>
                                            </p>
                                            <div className="text-sm text-gray-600 mb-2">Probabilidade de fratura</div>
                                            <div className="w-full bg-gray-200 h-2 rounded-full mb-1">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${resultado.classe === "fraturadas"
                                                            ? "bg-red-500"
                                                            : "bg-green-500"
                                                        }`}
                                                    style={{ width: `${resultado.probabilidade}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                {resultado.status} ({resultado.probabilidade}%)
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </>
                    )}
                </>
            )}
        </div>
    );
}
