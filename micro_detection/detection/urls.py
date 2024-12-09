from django.urls import path
from .views import detect_microorganisms

urlpatterns = [
    path('detect/', detect_microorganisms, name='detect_microorganisms'),  
]
