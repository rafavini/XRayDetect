import numpy as np
from django.apps import apps
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from PIL import Image
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

# As classes do seu modelo
class_names = ['fraturadas', 'nao-fraturadas']

class ClassificarMultiplasImagens(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        arquivos = request.FILES.getlist('imagem')
        resultados = []

        try:
            IMG_SIZE = 128
            model = apps.get_app_config('api').model

            for arquivo in arquivos:
                imagem = Image.open(arquivo).convert('RGB').resize((IMG_SIZE, IMG_SIZE))
                imagem_array = np.array(imagem).astype(float)
                imagem_array = np.expand_dims(imagem_array, axis=0)

                probs = model.predict(imagem_array)
                c = np.argmax(probs)
                probabilidade = float(np.max(probs))

                resultados.append({
                    'nome': arquivo.name,
                    'classe': class_names[c],
                    'indice': int(c),
                    'probabilidade': probabilidade,
                })

            return Response({'resultados': resultados})

        except Exception as e:
            return Response({'erro': str(e)}, status=500)




class SimpleLoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Usuário e senha são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)

        if user is not None:
            return Response({'message': 'Login bem-sucedido.', 'username': user.username})
        else:
            return Response({'error': 'Credenciais inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)
        


class SimpleRegisterView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if User.objects.filter(username=username).exists():
            return Response({"error": "Usuário já existe."}, status=400)
        User.objects.create_user(username=username, password=password)
        return Response({"message": "Usuário cadastrado com sucesso."}, status=201)