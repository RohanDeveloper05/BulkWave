from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from ..serializers.email_seder_serializers import EmailSerializer
from ..models import EmailCampaign, EmailList, EmailAttachment, Campaign
from ..services import send_bulk, extract_file, get_schedule, get_list_recipients


class SendEmailAPIView(APIView):
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        schedule_time = get_schedule(data)

        # ---------------- CAMPAIGN FLAG ----------------
        is_campaign = data.get("is_campaign", False)
        campaign_obj = None

        # ---------------- CREATE CAMPAIGN (OPTIONAL) ----------------
        if is_campaign:
            campaign_obj = Campaign.objects.create(
                name=data.get("campaign_name"),
                description=data.get("campaign_description"),
                recipient_source=data["recipient_type"],
            )

        # ---------------- EMAIL BODY ----------------
        if data["email_format"] == "HTML":
            body = f"TEMPLATE::{data.get('email_template')}"
        else:
            body = data.get("email_text")

        # ---------------- CREATE EMAIL CAMPAIGN ----------------
        email_campaign = EmailCampaign.objects.create(
            campaign=campaign_obj,  # ✅ NULL if normal email
            subject=data["subject"],
            from_name=data["from_name"],
            from_email=data["from_email"],
            reply_to=data.get("reply_to"),
            body=body,
            recipient_type=data["recipient_type"],
            
            first_name=data.get("first_name"),
            
            schedule_time=schedule_time,
            status="scheduled" if schedule_time else "pending"
        )

        # ---------------- ATTACHMENTS ----------------
        attachment_names = data.get("attachment_names", [])
        attachment_files = request.FILES.getlist("attachment_files")

        attachments = []

        for file in attachment_files:
            attachment, _ = EmailAttachment.objects.get_or_create(
                name=file.name,
                useby="Extra-Attachment",
                defaults={"file": file, "size": file.size}
            )
            attachments.append(attachment)

        for name in attachment_names:
            try:
                attachment = EmailAttachment.objects.get(name=name)
                attachments.append(attachment)
            except EmailAttachment.DoesNotExist:
                pass

        email_campaign.attachments.set(attachments)

        # ============================================================
        # ---------------- SINGLE ----------------
        # ============================================================
        if data["recipient_type"] == "single":
            emails = [e.strip() for e in data["recipients"].split(",")]

            # Save in Campaign (if exists)
            if campaign_obj:
                campaign_obj.single_emails = emails
                campaign_obj.save()

            email_campaign.total_emails = len(emails)
            email_campaign.recipient_email = emails[0] if emails else None
            email_campaign.save()

            if schedule_time:
                return Response({"message": "Email scheduled"})

            send_bulk(emails, email_campaign)
            return Response({"message": "Email sent"})

        # ============================================================
        # ---------------- LIST ----------------
        # ============================================================
        if data["recipient_type"] == "list":
            email_list = EmailList.objects.get(list_name=data["recipients"])
            recipients = get_list_recipients(data["recipients"])

            # Save in Campaign (if exists)
            if campaign_obj:
                campaign_obj.list = email_list
                campaign_obj.save()

            email_campaign.list_name = email_list.list_name
            email_campaign.table_name = email_list.table_name
            email_campaign.total_emails = len(recipients)
            email_campaign.save()

            if schedule_time:
                return Response({"message": "All emails scheduled"})

            send_bulk(recipients, email_campaign)
            return Response({"message": "All emails sent"})

        # ============================================================
        # ---------------- UPLOAD ----------------
        # ============================================================
        if data["recipient_type"] == "upload":
            upload = data["recipient_file"]

            # Save in Campaign (if exists)
            if campaign_obj:
                campaign_obj.uploaded_file = upload
                campaign_obj.save()

            email_campaign.uploaded_file = upload
            email_campaign.save()

            recipients = extract_file(upload, email_campaign)

            email_campaign.total_emails = len(recipients)
            email_campaign.save()

            if schedule_time:
                return Response({"message": "All emails scheduled"})

            send_bulk(recipients, email_campaign)
            return Response({"message": "All emails sent"})




# class SendEmailAPIView(APIView):
#     parser_classes = [JSONParser, MultiPartParser, FormParser]

#     def post(self, request):

#         serializer = EmailSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         data = serializer.validated_data

#         schedule_time = get_schedule(data)

#         # -----------------------------------------
#         # CREATE CAMPAIGN
#         # -----------------------------------------
#         campaign = EmailCampaign.objects.create(
#             subject=data["subject"],
#             from_name=data["from_name"],
#             from_email=data["from_email"],
#             reply_to=data.get("reply_to"),
#             body=data["body"],
#             recipient_type=data["recipient_type"],
#             schedule_time=schedule_time,
#             status="scheduled" if schedule_time else "pending"
#         )

#         # -----------------------------
#         # ATTACHMENTS HANDLING
#         # -----------------------------
#         attachment_names = data.get("attachment_names", [])
#         attachment_files = request.FILES.getlist("attachment_files")

#         attachments = []

#         # 1️⃣ Handle uploaded files
#         for file in attachment_files:
#             attachment, _ = EmailAttachment.objects.get_or_create(
#                 name=file.name,
#                 useby="Extra-Attachment",
#                 defaults={
#                     "file": file,
#                     "size": file.size
#                 }
#             )
#             attachments.append(attachment)

#         # 2️⃣ Handle preloaded attachments
#         for name in attachment_names:
#             try:
#                 attachment = EmailAttachment.objects.get(name=name)
#                 attachments.append(attachment)
#             except EmailAttachment.DoesNotExist:
#                 pass

#         # attach to campaign
#         campaign.attachments.set(attachments)

#         # ====================================================
#         # SINGLE
#         # ====================================================
#         if data["recipient_type"] == "single":

#             emails = [e.strip() for e in data["recipients"].split(",")]
#             campaign.total_emails = len(emails)
#             campaign.recipient_email = [e.strip() for e in data["recipients"].split(",")]
#             campaign.save()

#             if schedule_time:
#                 return Response({"message": "email schedule successfully"})

#             send_bulk(emails, campaign)
#             return Response({"message": "email send successfully"})

#         # ====================================================
#         # LIST
#         # ====================================================
#         if data["recipient_type"] == "list":

#             email_list = EmailList.objects.get(list_name=data["recipients"])
#             table_name = email_list.table_name
#             print(table_name)

#             recipients = get_list_recipients(data["recipients"])

#             campaign.list_name = email_list.list_name
#             campaign.table_name = table_name
#             campaign.total_emails = len(recipients)
#             campaign.save()

#             if schedule_time:
#                 return Response({"message": "all emails schedule successfully"})

#             send_bulk(recipients, campaign)
#             return Response({"message": "all emails send successfully"})

#         # ====================================================
#         # CSV / EXCEL
#         # ====================================================
#         if data["recipient_type"] == "upload":

#             upload = data["recipient_file"]
#             campaign.uploaded_file = upload
#             campaign.save()

#             recipients = extract_file(upload, campaign)

#             campaign.total_emails = len(recipients)
#             campaign.save()

#             if schedule_time:
#                 return Response({"message": "all emails schedule successfully"})

#             send_bulk(recipients, campaign)
#             return Response({"message": "all emails send successfully"})



# class SendEmailAPIView(APIView):
#     parser_classes = [JSONParser, MultiPartParser, FormParser]

#     def post(self, request):
#         serializer = EmailSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         data = serializer.validated_data

#         schedule_time = get_schedule(data)

#         # ✅ store template reference OR text
#         if data["email_format"] == "HTML":
#             body = f"TEMPLATE::{data.get('email_template')}"
#         else:
#             body = data.get("email_text")

#         campaign = EmailCampaign.objects.create(
#             subject=data["subject"],
#             from_name=data["from_name"],
#             from_email=data["from_email"],
#             reply_to=data.get("reply_to"),
#             body=body,
#             recipient_type=data["recipient_type"],
#             schedule_time=schedule_time,
#             status="scheduled" if schedule_time else "pending"
#         )

#         # ---------------- ATTACHMENTS ----------------
#         attachment_names = data.get("attachment_names", [])
#         attachment_files = request.FILES.getlist("attachment_files")

#         attachments = []

#         for file in attachment_files:
#             attachment, _ = EmailAttachment.objects.get_or_create(
#                 name=file.name,
#                 useby="Extra-Attachment",
#                 defaults={"file": file, "size": file.size}
#             )
#             attachments.append(attachment)

#         for name in attachment_names:
#             try:
#                 attachment = EmailAttachment.objects.get(name=name)
#                 attachments.append(attachment)
#             except EmailAttachment.DoesNotExist:
#                 pass

#         campaign.attachments.set(attachments)

#         # ---------------- SINGLE ----------------
#         if data["recipient_type"] == "single":
#             emails = [e.strip() for e in data["recipients"].split(",")]
#             campaign.total_emails = len(emails)
#             campaign.recipient_email = emails
#             campaign.save()

#             if schedule_time:
#                 return Response({"message": "Email scheduled"})

#             send_bulk(emails, campaign)
#             return Response({"message": "Email sent"})

#         # ---------------- LIST ----------------
#         if data["recipient_type"] == "list":
#             email_list = EmailList.objects.get(list_name=data["recipients"])
#             recipients = get_list_recipients(data["recipients"])

#             campaign.list_name = email_list.list_name
#             campaign.table_name = email_list.table_name
#             campaign.total_emails = len(recipients)
#             campaign.save()

#             if schedule_time:
#                 return Response({"message": "All emails scheduled"})

#             send_bulk(recipients, campaign)
#             return Response({"message": "All emails sent"})

#         # ---------------- UPLOAD ----------------
#         if data["recipient_type"] == "upload":
#             upload = data["recipient_file"]
#             campaign.uploaded_file = upload
#             campaign.save()

#             recipients = extract_file(upload, campaign)
#             campaign.total_emails = len(recipients)
#             campaign.save()

#             if schedule_time:
#                 return Response({"message": "All emails scheduled"})

#             send_bulk(recipients, campaign)
#             return Response({"message": "All emails sent"})

