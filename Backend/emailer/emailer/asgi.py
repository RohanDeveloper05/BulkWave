"""
ASGI config for emailer project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""
# asgi.py
import os
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'emailer.settings')

django.setup()   # ✅ ADD THIS

from channels.routing import ProtocolTypeRouter, URLRouter
import email_service.routing

application = ProtocolTypeRouter({
    # "http": get_asgi_application(),
    # "websocket": URLRouter(
    #     email_service.routing.websocket_urlpatterns
    # ),
})