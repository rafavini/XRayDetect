import numpy as np
from django.apps import apps
from PIL import Image
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

# As classes do seu modelo
class_names = ['fraturadas', 'nao-fraturadas']

class ClassificarImagem(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        arquivo = request.FILES['imagem']

        try:
            # Abrir imagem, converter para RGB e redimensionar (igual ao script local)
            IMG_SIZE = 128  # ajuste aqui para 224 se seu modelo usa esse tamanho
            imagem = Image.open(arquivo).convert('RGB').resize((IMG_SIZE, IMG_SIZE))
            imagem_array = np.array(imagem).astype(float)
            imagem_array = np.expand_dims(imagem_array, axis=0)  # (1, IMG_SIZE, IMG_SIZE, 3)

            # Obter o modelo carregado no apps.py
            model = apps.get_app_config('api').model

            # Fazer a predição
            probs = model.predict(imagem_array)
            c = np.argmax(probs)  # pega o índice da maior probabilidade
            probabilidade = float(np.max(probs))  # maior valor da predição

            resultado = {
                'classe': class_names[c],
                'indice': int(c),
                'probabilidade': probabilidade,
                'raw_probs': probs.tolist()  # opcional: envia todas as probabilidades
            }

            return Response(resultado)

        except Exception as e:
            return Response({'erro': str(e)}, status=500)
