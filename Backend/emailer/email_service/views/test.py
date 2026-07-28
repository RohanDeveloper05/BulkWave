import time
import smtplib
from email.mime.text import MIMEText
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings


class SesSpeedTestAPIView(APIView):
    """
    TEST ONLY API
    Measure AWS SES SMTP emails per second
    """

    def post(self, request):

        # ---------------------------------------
        # INPUT
        # ---------------------------------------
        total_emails = int(request.data.get("total_emails", 100))

        # --------------------------------------------------
        # SMTP CONFIG
        # --------------------------------------------------
        SMTP_SERVER = "email-smtp.ap-south-1.amazonaws.com"
        SMTP_PORT = 587
        SMTP_USERNAME = settings.EMAIL_HOST_USER
        SMTP_PASSWORD = settings.EMAIL_HOST_PASSWORD

        FROM_EMAIL = "info-it@rohankumar.online"

        # ---------------------------------------
        # SAME EMAIL MULTIPLE TIMES (SAFE)
        # ---------------------------------------
        TEST_EMAIL = "rohan.kumar@sharesamadhan.com"

        recipients = [TEST_EMAIL] * total_emails

        # ---------------------------------------
        # SES RATE LIMIT
        # ---------------------------------------
        SES_RATE = 14
        DELAY = 1 / SES_RATE   # 0.071 sec

        # ---------------------------------------
        # TIMER START
        # ---------------------------------------
        start_time = time.time()
        sent = 0

        # ---------------------------------------
        # SMTP CONNECTION
        # ---------------------------------------
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(SMTP_USERNAME, SMTP_PASSWORD)

            for i, email in enumerate(recipients, start=1):

                msg = MIMEText(
                    f"SES SPEED TEST EMAIL #{i}",
                    "plain"
                )

                msg["Subject"] = "SES SPEED TEST"
                msg["From"] = FROM_EMAIL
                msg["To"] = email

                smtp.send_message(msg)
                sent += 1

                # 🔥 IMPORTANT — throttle
                time.sleep(DELAY)

        # ---------------------------------------
        # TIMER END
        # ---------------------------------------
        end_time = time.time()

        total_seconds = round(end_time - start_time, 2)
        emails_per_second = round(sent / total_seconds, 2)

        # ---------------------------------------
        # RESPONSE
        # ---------------------------------------
        return Response({
            "total_emails_sent": sent,
            "total_time_seconds": total_seconds,
            "emails_per_second": emails_per_second,
            "ses_console_limit": "14 emails/sec",
            "expected_time_seconds": round(total_emails / 14, 2)
        })
