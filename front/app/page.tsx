"use client"

import { ChangeEvent, FormEvent, useState } from 'react';

const UploadImage = () => {
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImage(file);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!image) {
            alert('Por favor, selecione uma imagem primeiro.');
            return;
        }

        const formData = new FormData();
        formData.append('imagem', image);

        setLoading(true);

        try {
            const res = await fetch('http://127.0.0.1:8000/api/classificar/', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setResponse(data);
            } else {
                const errorData = await res.json();
                setResponse(errorData);
            }
        } catch (error) {
            console.error('Erro ao enviar a imagem:', error);
            alert('Erro ao enviar a imagem. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border">
            <h1 className="text-2xl font-bold mb-4 text-center">Envie uma foto para classificação</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200" 
                />
                <button 
                    type="submit" 
                    disabled={loading} 
                    className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {loading ? 'Enviando...' : 'Enviar Imagem'}
                </button>
            </form>

            {response && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                    <h2 className="text-lg font-semibold mb-2">Resultado da classificação:</h2>
                    <pre className="bg-white p-2 rounded text-sm overflow-x-auto">
                        {JSON.stringify(response, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default UploadImage;
