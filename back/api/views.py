import numpy as np
from django.apps import apps
from PIL import Image
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView


class ClassificarImagem(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        arquivo = request.FILES['imagem']

        # Abrir imagem e forçar conversão para RGB (3 canais)
        imagem = Image.open(arquivo).convert('RGB').resize((128, 128))
        imagem_array = np.array(imagem) / 255.0

        # Garantir shape (1, 128, 128, 3)
        imagem_array = np.expand_dims(imagem_array, axis=0)

        model = apps.get_app_config('api').model

        try:
            predicao = model.predict(imagem_array)
            classe = np.argmax(predicao, axis=1)[0]
            return Response({'classe': int(classe)})
        except Exception as e:
            return Response({'erro': str(e)}, status=500)
