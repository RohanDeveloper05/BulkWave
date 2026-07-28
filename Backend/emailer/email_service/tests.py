from django.test import TestCase

# Create your tests here.



# {
#     from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from ..serializers.email_seder_serializers import *
# from django.conf import settings
# from ..models import *
# import smtplib
# from email.mime.multipart import MIMEMultipart
# from email.mime.text import MIMEText
# from email.mime.base import MIMEBase
# from email import encoders
# import csv, io, json
# from datetime import datetime
# import pytz
# from threading import Timer
# from django.db.models import Sum
# from math import ceil
# from datetime import timedelta
# import chardet



# {
# # class SendEmailAPIView(APIView):
# #     def post(self, request):
# #         serializer = EmailSerializer(data=request.data)
# #         if serializer.is_valid():
# #             data = serializer.validated_data

# #             # SMTP Config
# #             SMTP_SERVER = "email-smtp.ap-south-1.amazonaws.com"
# #             SMTP_PORT = 587
# #             SMTP_USERNAME = settings.EMAIL_HOST_USER
# #             SMTP_PASSWORD = settings.EMAIL_HOST_PASSWORD

# #             # Create Message
# #             msg = MIMEMultipart()
# #             msg['Subject'] = data['subject']
# #             msg['From'] = f"{data['from_name']} <{data['from_email']}>"
# #             msg['Reply-To'] = data.get('reply_to', data['from_email'])  
# #             msg.attach(MIMEText(data['body'], 'html'))

# #             # Handle attachments
# #             attachments_files = data.get('attachments', [])
# #             attachment_names = []
# #             for file in attachments_files:
# #                 part = MIMEBase('application', 'octet-stream')
# #                 part.set_payload(file.read())
# #                 encoders.encode_base64(part)
# #                 part.add_header('Content-Disposition', f'attachment; filename="{file.name}"')
# #                 msg.attach(part)
# #                 attachment_names.append(file.name)

# #             # Handle recipients
# #             recipients_data = data['recipients']
# #             recipient_emails = []

# #             if recipients_data['type'] == 'single recipient':
# #                 recipient_emails.append(recipients_data['email'])

# #             elif recipients_data['type'] == 'mailing list':
# #                 # TODO: fetch emails from your DB based on list_name
# #                 recipient_emails = ["example1@gmail.com", "example2@gmail.com"]

# #             elif recipients_data['type'] == 'CSV/ Excel':
# #                 file = recipients_data['file']
# #                 decoded_file = file.read().decode('utf-8')
# #                 io_string = io.StringIO(decoded_file)
# #                 reader = csv.reader(io_string)
# #                 for row in reader:
# #                     recipient_emails.append(row[0])  # first column as email

# #             # Parse scheduled time
# #             scheduled_time = None
# #             schedule_data = data.get('schedule')
# #             if schedule_data:
# #                 date_str = schedule_data.get('date')
# #                 time_str = schedule_data.get('time')
# #                 if date_str and time_str:
# #                     dt_str = f"{date_str} {time_str}"
# #                     scheduled_time = pytz.UTC.localize(
# #                         datetime.strptime(dt_str, "%m/%d/%Y %I:%M %p")
# #                     )

# #             # Create Email Log (sent=False initially)
# #             email_log = EmailLog.objects.create(
# #                 subject=data['subject'],
# #                 from_name=data['from_name'],
# #                 from_email=data['from_email'],
# #                 reply_to=data.get('reply_to', data['from_email']),
# #                 recipients=json.dumps(recipients_data),
# #                 body=data['body'],
# #                 attachments=json.dumps(attachment_names),
# #                 scheduled_time=scheduled_time,
# #                 sent=False
# #             )

# #             # Function to send email and update log
# #             def send_and_log():
# #                 try:
# #                     self.send_email_smtp(
# #                         SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, msg, recipient_emails
# #                     )
# #                     email_log.sent = True
# #                     email_log.save()
# #                 except Exception as e:
# #                     print(f"Failed to send email: {e}")

# #             # Schedule or send immediately
# #             now = datetime.utcnow().replace(tzinfo=pytz.UTC)
# #             if scheduled_time and scheduled_time > now:
# #                 delay = (scheduled_time - now).total_seconds()
# #                 Timer(delay, send_and_log).start()
# #                 return Response({
# #                     "message": f"Email scheduled at {scheduled_time} to {recipient_emails}"
# #                 })

# #             # Immediate send if no schedule or schedule in past
# #             send_and_log()
# #             return Response({"message": f"Email sent to {recipient_emails}"})

# #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# #     def send_email_smtp(self, server, port, username, password, msg, recipient_emails):
# #         try:
# #             with smtplib.SMTP(server, port) as smtp:
# #                 smtp.starttls()
# #                 smtp.login(username, password)
# #                 # Use send_message instead of sendmail for AWS SES
# #                 for email in recipient_emails:
# #                     msg["To"] = email  # Update 'To' header per recipient
# #                     smtp.send_message(msg)
# #             print("✅ Email sent successfully via AWS SES")
# #         except Exception as e:
# #             print(f"❌ Failed to send email: {e}")

# }

# class SendEmailAPIView(APIView):

#     def post(self, request):
#         serializer = EmailSerializer(data=request.data)
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#         data = serializer.validated_data
#         now = datetime.utcnow().replace(tzinfo=pytz.UTC)

#         # --------------------------------------------------
#         # SMTP CONFIG (ONLY FOR IMMEDIATE SEND)
#         # --------------------------------------------------
#         SMTP_SERVER = "email-smtp.ap-south-1.amazonaws.com"
#         SMTP_PORT = 587
#         SMTP_USERNAME = settings.EMAIL_HOST_USER
#         SMTP_PASSWORD = settings.EMAIL_HOST_PASSWORD

#         # --------------------------------------------------
#         # RECIPIENT EMAIL LIST
#         # --------------------------------------------------
#         # Check recipient type
#         recipients_data = data.get('recipients', {})
#         recipient_type = recipients_data.get('type') or request.data.get('recipient_type')

#         if recipient_type == 'single recipient':
#             recipient_emails = [recipients_data['email']]

#         elif recipient_type == 'mailing list':
#             recipient_emails = ["example1@gmail.com", "example2@gmail.com"]

#         elif recipient_type in ['CSV/ Excel', 'upload']:
#             file = recipients_data.get('file') or request.FILES.get('recipient_file')
#             if not file:
#                 return Response({"error": "recipient_file is required"}, status=400)

#             # 1️⃣ Read raw bytes
#             raw_data = file.read()

#             # 2️⃣ Detect encoding
#             detected = chardet.detect(raw_data)
#             encoding = detected.get('encoding') or 'utf-8'

#             # 3️⃣ Decode safely (no crashes)
#             try:
#                 text = raw_data.decode(encoding)
#             except UnicodeDecodeError:
#                 text = raw_data.decode('iso-8859-1', errors='replace')

#             # 4️⃣ Remove BOM if present
#             text = text.lstrip('\ufeff')

#             # 5️⃣ IMPORTANT: newline='' fix
#             csv_file = io.StringIO(text, newline='')

#             reader = csv.reader(csv_file)

#             recipient_emails = []
#             for row in reader:
#                 if row and row[0]:
#                     email = row[0].strip()
#                     if email:
#                         recipient_emails.append(email)


#         email_count = len(recipient_emails)

#         if email_count == 0:
#             return Response(
#                 {"error": "No recipient emails found"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # --------------------------------------------------
#         # PARSE SCHEDULE TIME
#         # --------------------------------------------------
#         scheduled_time = None
#         scheduled_time_over = None

#         schedule_data = data.get('schedule')
#         if schedule_data:
#             date_str = schedule_data.get('date')
#             time_str = schedule_data.get('time')
#             if date_str and time_str:
#                 scheduled_time = pytz.UTC.localize(
#                     datetime.strptime(
#                         f"{date_str} {time_str}",
#                         "%m/%d/%Y %I:%M %p"
#                     )
#                 )

#         # --------------------------------------------------
#         # IF SCHEDULED REQUEST → ONLY SAVE
#         # --------------------------------------------------
#         if scheduled_time and scheduled_time > now:

#             # ⏱ Calculate schedule window (14 emails/sec)
#             duration_seconds = ceil(email_count / 14)
#             scheduled_time_over = scheduled_time + timedelta(seconds=duration_seconds)

#             # 🔁 Check overlapping schedules
#             overlap_exists = EmailLog.objects.filter(
#                 scheduled_time__lt=scheduled_time_over,
#                 scheduled_time_over__gt=scheduled_time
#             ).exists()

#             if overlap_exists:
#                 return Response(
#                     {"error": "Another email task already scheduled in this time window"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # 📊 Check daily limit (50,000)
#             schedule_date = scheduled_time.date()

#             today_total = EmailLog.objects.filter(
#                 scheduled_time__date=schedule_date
#             ).aggregate(
#                 total=Sum('email_count')
#             )['total'] or 0

#             if today_total + email_count > 50000:
#                 return Response(
#                     {"error": "Daily email limit of 50,000 exceeded"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # 💾 SAVE ONLY (NO SEND)
#             EmailLog.objects.create(
#                 subject=data['subject'],
#                 from_name=data['from_name'],
#                 from_email=data['from_email'],
#                 reply_to=data.get('reply_to', data['from_email']),
#                 recipients=recipients_data,
#                 body=data['body'],
#                 attachments=[f.name for f in data.get('attachments', [])],
#                 scheduled_time=scheduled_time,
#                 scheduled_time_over=scheduled_time_over,
#                 email_count=email_count,
#                 sent=False
#             )

#             return Response({
#                 "message": "Email scheduled successfully",
#                 "scheduled_time": scheduled_time,
#                 "scheduled_time_over": scheduled_time_over,
#                 "email_count": email_count
#             })

#         # --------------------------------------------------
#         # NON-SCHEDULED → SEND IMMEDIATELY
#         # --------------------------------------------------
#         msg = MIMEMultipart()
#         msg['Subject'] = data['subject']
#         msg['From'] = f"{data['from_name']} <{data['from_email']}>"
#         msg['Reply-To'] = data.get('reply_to', data['from_email'])
#         msg.attach(MIMEText(data['body'], 'html'))

#         attachment_names = []
#         for file in data.get('attachments', []):
#             part = MIMEBase('application', 'octet-stream')
#             part.set_payload(file.read())
#             encoders.encode_base64(part)
#             part.add_header(
#                 'Content-Disposition',
#                 f'attachment; filename="{file.name}"'
#             )
#             msg.attach(part)
#             attachment_names.append(file.name)

#         try:
#             self.send_email_smtp(
#                 SMTP_SERVER,
#                 SMTP_PORT,
#                 SMTP_USERNAME,
#                 SMTP_PASSWORD,
#                 msg,
#                 recipient_emails
#             )

#             EmailLog.objects.create(
#                 subject=data['subject'],
#                 from_name=data['from_name'],
#                 from_email=data['from_email'],
#                 reply_to=data.get('reply_to', data['from_email']),
#                 recipients=recipients_data,
#                 body=data['body'],
#                 attachments=attachment_names,
#                 email_count=email_count,
#                 sent=True
#             )

#             return Response({
#                 "message": "Email sent successfully",
#                 "email_count": email_count
#             })

#         except Exception as e:
#             return Response(
#                 {"error": f"Failed to send email: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     # --------------------------------------------------
#     # SMTP METHOD
#     # --------------------------------------------------
#     def send_email_smtp(self, server, port, username, password, msg, recipient_emails):
#         with smtplib.SMTP(server, port) as smtp:
#             smtp.starttls()
#             smtp.login(username, password)
#             for email in recipient_emails:
#                 msg["To"] = email
#                 smtp.send_message(msg)


    
    
# }