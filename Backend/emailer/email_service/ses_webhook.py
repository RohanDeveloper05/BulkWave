import json
import logging
import requests
import pytz

from django.utils.dateparse import parse_datetime

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import SESEmailEvent


logger = logging.getLogger(__name__)

# IST timezone
IST = pytz.timezone("Asia/Kolkata")


class SESWebhookAPIView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        logger.info("========== SES WEBHOOK HIT ==========")
        logger.info(f"Headers: {request.headers}")

        try:
            payload = json.loads(request.body.decode("utf-8"))
        except Exception:
            logger.error("Invalid JSON received from SNS")
            return Response({"error": "Invalid JSON"}, status=400)

        message_type = payload.get("Type")

        # -------------------------------------------------
        # SNS Subscription Confirmation
        # -------------------------------------------------
        if message_type == "SubscriptionConfirmation":

            subscribe_url = payload.get("SubscribeURL")

            if subscribe_url:
                try:
                    requests.get(subscribe_url)
                    logger.info("SNS Subscription confirmed")
                except Exception as e:
                    logger.error(f"Subscription confirmation failed: {e}")

            return Response({"message": "Subscription confirmed"})

        # -------------------------------------------------
        # SES Event Notification
        # -------------------------------------------------
        if message_type == "Notification":

            try:
                message_str = payload.get("Message", "{}")
                message = json.loads(message_str)
            except Exception:
                logger.error("Invalid Message JSON")
                return Response({"error": "Invalid message"}, status=400)

            event_type = message.get("eventType") or message.get("notificationType")

            mail = message.get("mail", {})
            message_id = mail.get("messageId")
            recipients = mail.get("destination", [])

            # -----------------------------
            # Convert SES UTC → IST
            # -----------------------------
            timestamp_str = mail.get("timestamp")
            timestamp = None

            if timestamp_str:
                parsed_time = parse_datetime(timestamp_str)

                if parsed_time:
                    ist_time = parsed_time.astimezone(IST)

                    # Remove timezone because USE_TZ = False
                    timestamp = ist_time.replace(tzinfo=None)

            saved_count = 0

            for recipient in recipients:

                obj, created = SESEmailEvent.objects.get_or_create(
                    message_id=message_id,
                    recipient=recipient,
                    event_type=event_type,
                    defaults={
                        "timestamp": timestamp,
                        "raw_event": message
                    }
                )

                if created:
                    saved_count += 1

            logger.info(f"SES Event saved: {event_type} ({saved_count} records)")

            return Response({
                "event": event_type,
                "saved": saved_count
            })

        return Response({"message": "Ignored"}, status=status.HTTP_200_OK)