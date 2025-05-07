import os

import tensorflow as tf
from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        import os

        import tensorflow as tf

        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, 'Model_VGG16.h5')

        # Carregar o modelo e guardar como atributo da instância
        self.model = tf.keras.models.load_model(model_path)
