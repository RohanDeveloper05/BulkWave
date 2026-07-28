import csv
import io
import smtplib
import time
import pytz
import re
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os
import pandas as pd
from django.db import connection
from django.conf import settings
from email.mime.text import MIMEText
from .models import EmailLog, EmailRecipient, EmailList, CodeTemplate, SESEmailEvent
from django.core import signing
from email_validator import validate_email, EmailNotValidError

SES_RATE = 14
DELAY = 1 / SES_RATE


def generate_unsubscribe_token(email):
    return signing.dumps({"email": email})


def decode_unsubscribe_token(token):
    try:
        data = signing.loads(token, max_age=60*60*24*7)  # 7 days valid
        return data.get("email")
    except Exception:
        return None


def get_schedule(data):

    schedule_date = data.get("schedule_date")
    schedule_time = data.get("schedule_time")

    if not schedule_date or not schedule_time:
        return None

    try:
        dt = datetime.strptime(
            f"{schedule_date} {schedule_time}",
            "%m/%d/%Y %I:%M %p"
        )
        return pytz.UTC.localize(dt)

    except Exception:
        return None


def get_template_content(template_name: str):
    try:
        template = CodeTemplate.objects.get(template_name=template_name)
    except CodeTemplate.DoesNotExist:
        raise Exception(f"Template '{template_name}' not found")

    html = template.html or ""
    css = template.css or ""
    
    final_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
        {css}
        </style>
    </head>
    <body>
        {html}
    </body>
    </html>
    """

    return final_html


VH_PATTERN = re.compile(r"\{\{vh_([a-zA-Z0-9_]+)\}\}")

def normalize_keys(data: dict):
    return {
        str(k).strip().lower().replace(" ", "_"): v
        for k, v in data.items()
    }

def render_template(template: str, data: dict):
    data = normalize_keys(data)

    def replacer(match):
        key = match.group(1).lower()
        return str(data.get(key, ""))

    return VH_PATTERN.sub(replacer, template)


# def send_bulk(recipients, campaign):

#     campaign.status = "sending"
#     campaign.total_emails = len(recipients)
#     campaign.save(update_fields=["status", "total_emails"])

#     SMTP_SERVER = "email-smtp.ap-south-1.amazonaws.com"
#     SMTP_PORT = 587

#     upload_lookup = {}

#     # ✅ Load uploaded file once
#     if campaign.recipient_type == "upload" and campaign.uploaded_file:
#         path = campaign.uploaded_file.path

#         if path.endswith(".csv"):
#             with open(path, encoding="utf-8", errors="ignore") as f:
#                 rows = list(csv.DictReader(f))

#         elif path.endswith((".xls", ".xlsx")):
#             rows = pd.read_excel(path).to_dict(orient="records")

#         else:
#             rows = []

#         # ✅ Build lookup dictionary
#         for row in rows:
#             email_val = str(row.get("email", "")).strip().lower()
#             if email_val:
#                 upload_lookup[email_val] = {
#                     str(k).lower(): v for k, v in row.items()
#                 }

#     with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
#         smtp.starttls()
#         smtp.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)

#         for recipient in recipients:

#             # ---------------- NORMALIZE ----------------
#             if isinstance(recipient, str):
#                 email = recipient.strip().lower()
#                 base_data = {"email": email}
#             else:
#                 email = str(recipient.get("email", "")).strip().lower()
#                 if not email:
#                     continue

#                 base_data = {
#                     str(k).lower(): v for k, v in recipient.items()
#                 }

#             # ---------------- MERGE UPLOAD DATA ----------------
#             upload_data = upload_lookup.get(email, {})
#             data = {**base_data, **upload_data}
            
#             # 🔐 Generate token
#             token = generate_unsubscribe_token(email)

#             # 🔗 Create unsubscribe URL (frontend page)
#             unsubscribe_url = f"{settings.FRONTEND_URL}/email-unsubscribe?token={token}"

#             # inject into template data
#             data["unsubscribe_url"] = unsubscribe_url

#             # ---------------- TEMPLATE LOGIC ----------------
#             if campaign.body.startswith("TEMPLATE::"):
#                 template_name = campaign.body.replace("TEMPLATE::", "").strip()

#                 try:
#                     template_html = get_template_content(template_name)
#                 except Exception:
#                     continue

#                 final_body = render_template(template_html, data)
#             else:
#                 final_body = render_template(campaign.body, data)

#             final_subject = render_template(campaign.subject, data)

#             # ---------------- EMAIL ----------------
#             msg = MIMEMultipart()
#             msg["Subject"] = final_subject
#             msg["From"] = f"{campaign.from_name} <{campaign.from_email}>"
#             msg["To"] = email
#             msg["List-Unsubscribe"] = (
#                 f"<mailto:{campaign.from_email}?subject=unsubscribe>, "
#                 f"<{unsubscribe_url}>"
#             )

#             msg["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click" 

#             # ✅ SES config (kept from old code)
#             msg["X-SES-CONFIGURATION-SET"] = "Set_conf_bulk_wave"
#             msg["Precedence"] = "bulk"
#             msg["Auto-Submitted"] = "auto-generated"

#             # ✅ Body type
#             if final_body.strip().startswith("<"):
#                 msg.attach(MIMEText(final_body, "html"))
#             else:
#                 msg.attach(MIMEText(final_body, "plain"))

#             # ---------------- ATTACHMENTS (OLD LOGIC APPLIED) ----------------
#             for attachment in campaign.attachments.all():
#                 try:
#                     path = attachment.file.path

#                     with open(path, "rb") as f:
#                         part = MIMEBase("application", "octet-stream")
#                         part.set_payload(f.read())

#                     encoders.encode_base64(part)

#                     part.add_header(
#                         "Content-Disposition",
#                         f'attachment; filename="{os.path.basename(path)}"',
#                     )

#                     msg.attach(part)

#                 except Exception:
#                     continue  # skip broken attachment safely

#             # ---------------- SEND ----------------
#             smtp.send_message(msg)

#             EmailLog.objects.create(
#                 campaign=campaign,
#                 recipient_email=email
#             )

#             time.sleep(DELAY)

#     campaign.status = "completed"
#     campaign.save(update_fields=["status"])


def send_bulk(recipients, email_campaign):

    # 🔗 optional campaign object
    campaign_obj = getattr(email_campaign, "campaign", None)

    # ---------------- STATUS UPDATE ----------------
    email_campaign.status = "sending"
    email_campaign.total_emails = len(recipients)
    email_campaign.save(update_fields=["status", "total_emails"])

    if campaign_obj:
        campaign_obj.status = "active"
        campaign_obj.total_emails = len(recipients)
        campaign_obj.save(update_fields=["status", "total_emails"])

    SMTP_SERVER = "email-smtp.ap-south-1.amazonaws.com"
    SMTP_PORT = 587

    upload_lookup = {}

    # ============================================================
    # ---------------- LOAD UPLOAD DATA (ONLY ONCE) ----------------
    # ============================================================
    if email_campaign.recipient_type == "upload" and email_campaign.uploaded_file:
        path = email_campaign.uploaded_file.path

        try:
            if path.endswith(".csv"):
                with open(path, encoding="utf-8", errors="ignore") as f:
                    rows = list(csv.DictReader(f))

            elif path.endswith((".xls", ".xlsx")):
                rows = pd.read_excel(path).to_dict(orient="records")

            else:
                rows = []

            # ✅ FIX: normalize keys (space -> underscore)
            for row in rows:
                email_val = str(row.get("email", "")).strip().lower()
                if email_val:
                    upload_lookup[email_val] = {
                        str(k).lower().replace(" ", "_"): v
                        for k, v in row.items()
                    }

        except Exception:
            upload_lookup = {}

    # ============================================================
    # ---------------- SMTP CONNECTION ----------------
    # ============================================================
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)

        sent_count = 0
        failed_count = 0

        for recipient in recipients:
            try:
                # ---------------- NORMALIZE ----------------
                if isinstance(recipient, str):
                    email = recipient.strip().lower()

                    base_data = {
                        "email": email,
                        "first_name": email_campaign.first_name or ""  # ✅ fallback
                    }

                else:
                    email = str(recipient.get("email", "")).strip().lower()
                    if not email:
                        continue

                    # ✅ FIX: normalize keys
                    base_data = {
                        str(k).lower().replace(" ", "_"): v
                        for k, v in recipient.items()
                    }

                # ---------------- MERGE UPLOAD DATA ----------------
                upload_data = upload_lookup.get(email, {})

                # ✅ FIX: ensure first_name always available
                data = {
                    "email": email,
                    "first_name": email_campaign.first_name or "",
                    **upload_data,
                    **base_data,
                }

                # ---------------- UNSUBSCRIBE ----------------
                token = generate_unsubscribe_token(email)
                unsubscribe_url = f"{settings.FRONTEND_URL}/email-unsubscribe?token={token}"
                data["unsubscribe_url"] = unsubscribe_url

                # ---------------- TEMPLATE ----------------
                if email_campaign.body.startswith("TEMPLATE::"):
                    template_name = email_campaign.body.replace("TEMPLATE::", "").strip()

                    try:
                        template_html = get_template_content(template_name)
                    except Exception:
                        failed_count += 1
                        continue

                    final_body = render_template(template_html, data)
                else:
                    final_body = render_template(email_campaign.body, data)

                final_subject = render_template(email_campaign.subject, data)

                # ---------------- EMAIL BUILD ----------------
                msg = MIMEMultipart()
                msg["Subject"] = final_subject
                msg["From"] = f"{email_campaign.from_name} <{email_campaign.from_email}>"
                msg["To"] = email

                msg["Reply-To"] = email_campaign.reply_to or email_campaign.from_email

                msg["List-Unsubscribe"] = (
                    f"<mailto:{email_campaign.from_email}?subject=unsubscribe>, "
                    f"<{unsubscribe_url}>"
                )
                msg["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"

                msg["X-SES-CONFIGURATION-SET"] = "Set_conf_bulk_wave"
                msg["Precedence"] = "bulk"
                msg["Auto-Submitted"] = "auto-generated"

                # ---------------- BODY TYPE ----------------
                if final_body.strip().startswith("<"):
                    msg.attach(MIMEText(final_body, "html"))
                else:
                    msg.attach(MIMEText(final_body, "plain"))

                # ---------------- ATTACHMENTS ----------------
                for attachment in email_campaign.attachments.all():
                    try:
                        path = attachment.file.path

                        with open(path, "rb") as f:
                            part = MIMEBase("application", "octet-stream")
                            part.set_payload(f.read())

                        encoders.encode_base64(part)

                        part.add_header(
                            "Content-Disposition",
                            f'attachment; filename="{os.path.basename(path)}"',
                        )

                        msg.attach(part)

                    except Exception:
                        continue

                # ---------------- SEND ----------------
                smtp.send_message(msg)

                # ---------------- LOG ----------------
                EmailLog.objects.create(
                    campaign=email_campaign,
                    recipient_email=email,
                    status="sent"
                )

                sent_count += 1
                time.sleep(DELAY)

            except Exception:
                failed_count += 1

                EmailLog.objects.create(
                    campaign=email_campaign,
                    recipient_email=email if 'email' in locals() else None,
                    status="failed"
                )
                continue

    # ============================================================
    # ---------------- FINAL STATUS ----------------
    # ============================================================
    email_campaign.status = "completed"
    email_campaign.save(update_fields=["status"])

    if campaign_obj:
        campaign_obj.status = "completed"
        campaign_obj.save(update_fields=["status"])

    return {
        "sent": sent_count,
        "failed": failed_count,
        "total": len(recipients)
    }
    
    

def extract_file(upload, campaign):

    filename = upload.name.lower()
    seen_emails = set()
    recipients = []

    # ================= CSV =================
    if filename.endswith(".csv"):

        content = upload.read().decode("utf-8", errors="ignore")
        upload.seek(0)

        reader = csv.DictReader(io.StringIO(content))

        email_col = None
        name_col = None

        for field in reader.fieldnames:
            f = field.lower()
            if "email" in f:
                email_col = field
            if "name" in f:
                name_col = field

        if not email_col:
            raise Exception("Email column not found")

        for row in reader:
            email = row.get(email_col)
            if not email:
                continue

            email = email.strip().lower()
            if email in seen_emails:
                continue

            seen_emails.add(email)

            # ✅ Save minimal DB record
            EmailRecipient.objects.create(
                campaign=campaign,
                email=email,
                name=row.get(name_col, "").strip() if name_col else None
            )

            # ✅ Return full row for sending
            clean_row = {k.lower(): v for k, v in row.items()}
            clean_row["email"] = email
            recipients.append(clean_row)

    # ================= EXCEL =================
    elif filename.endswith((".xls", ".xlsx")):

        df = pd.read_excel(upload)

        email_col = None
        name_col = None

        for col in df.columns:
            c = str(col).lower()
            if "email" in c:
                email_col = col
            if "name" in c:
                name_col = col

        if not email_col:
            raise Exception("Email column not found")

        for _, row in df.iterrows():
            email = row.get(email_col)
            if pd.isna(email):
                continue

            email = str(email).strip().lower()
            if email in seen_emails:
                continue

            seen_emails.add(email)

            EmailRecipient.objects.create(
                campaign=campaign,
                email=email,
                name=str(row[name_col]).strip() if name_col else None
            )

            clean_row = {
                str(k).lower(): ("" if pd.isna(v) else v)
                for k, v in row.to_dict().items()
            }
            clean_row["email"] = email
            recipients.append(clean_row)

    else:
        raise Exception("Unsupported file format")

    return recipients


def get_list_recipients(list_name):

    email_list = EmailList.objects.get(list_name=list_name)
    table_name = email_list.table_name

    # 🔐 Protect against SQL injection
    if not re.match(r"^[a-zA-Z0-9_]+$", table_name):
        raise Exception("Invalid table name")

    with connection.cursor() as cursor:

        # 1️⃣ Get column names
        cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
        columns = [row[0].lower() for row in cursor.fetchall()]

        if not columns:
            raise Exception("No columns found in list table")

        # 2️⃣ Detect email column dynamically
        email_column = None
        for col in columns:
            if col in [
                "email",
                "email_id",
                "email_address",
                "user_email",
                "recipient_email"
            ]:
                email_column = col
                break

        if not email_column:
            raise Exception("No email column found in list table")

        # 3️⃣ Fetch ALL data (needed for {ai.column})
        cursor.execute(f"SELECT * FROM `{table_name}`")
        rows = cursor.fetchall()

    recipients = []

    for row in rows:
        data = dict(zip(columns, row))

        email = data.get(email_column)

        # 🚫 Skip empty / invalid emails
        if not email:
            continue

        email = str(email).strip().lower()

        if not email:
            continue

        # ✅ Normalize email key
        data["email"] = email

        recipients.append(data)

    return recipients




## This is For Data Clean 
def clean_email_table(table_name):

    EMAIL_COLUMNS = [
        "email_id",
        "email_id_01",
        "email_id_02"
    ]

    report = {
        "success": True,
        "table_name": table_name,
        "total_rows": 0,
        "invalid_emails": 0,
        "duplicates": 0,
        "blocked_emails": 0,
        "updated": 0,
        "deleted": 0,
    }

    # ------------------------------------
    # Verify table exists
    # ------------------------------------
    with connection.cursor() as cursor:

        cursor.execute("""
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = %s
        """, [table_name])

        columns = [row[0].lower() for row in cursor.fetchall()]

    if not columns:
        return {
            "success": False,
            "message": f"Table '{table_name}' not found"
        }

    # ------------------------------------
    # Keep only email columns that exist
    # ------------------------------------
    EMAIL_COLUMNS = [
        col for col in EMAIL_COLUMNS
        if col.lower() in columns
    ]

    if not EMAIL_COLUMNS:
        return {
            "success": False,
            "message": "No email columns found",
            "columns": columns
        }

    # ------------------------------------
    # Get blocked emails from SES
    # ------------------------------------
    blocked_emails = {
        str(recipient).strip().lower()
        for recipient in SESEmailEvent.objects.filter(
            event_type__in=[
                "bounce",
                "complaint",
                "reject",
                "hard_bounce",
                "soft_bounce",
            ]
        ).values_list("recipient", flat=True)
        if recipient
    }

    # ------------------------------------
    # Fetch rows
    # ------------------------------------
    select_cols = ", ".join(
        [f"`{col}`" for col in EMAIL_COLUMNS]
    )

    with connection.cursor() as cursor:

        cursor.execute(
            f"""
            SELECT id, {select_cols}
            FROM `{table_name}`
            """
        )

        rows = cursor.fetchall()

    report["total_rows"] = len(rows)

    global_seen_emails = set()
    ids_to_delete = []

    # ------------------------------------
    # Clean emails
    # ------------------------------------
    with connection.cursor() as cursor:

        for row in rows:

            row_id = row[0]
            email_values = row[1:]

            row_seen_emails = set()

            cleaned = {
                col: None
                for col in EMAIL_COLUMNS
            }

            has_valid_email = False

            for index, email in enumerate(email_values):

                column_name = EMAIL_COLUMNS[index]

                if not email:
                    continue

                email = str(email).strip().lower()

                try:

                    normalized = validate_email(
                        email,
                        check_deliverability=False
                    ).normalized

                except EmailNotValidError:

                    report["invalid_emails"] += 1
                    continue

                # Blocked email
                if normalized in blocked_emails:

                    report["blocked_emails"] += 1
                    continue

                # Duplicate inside row
                if normalized in row_seen_emails:

                    report["duplicates"] += 1
                    continue

                # Duplicate in entire table
                if normalized in global_seen_emails:

                    report["duplicates"] += 1
                    continue

                row_seen_emails.add(normalized)
                global_seen_emails.add(normalized)

                cleaned[column_name] = normalized
                has_valid_email = True

            # Delete row if no valid emails remain
            if not has_valid_email:
                ids_to_delete.append(row_id)
                continue

            # Update row
            set_clause = ", ".join(
                [f"`{col}`=%s" for col in EMAIL_COLUMNS]
            )

            values = [
                cleaned.get(col)
                for col in EMAIL_COLUMNS
            ]

            values.append(row_id)

            cursor.execute(
                f"""
                UPDATE `{table_name}`
                SET {set_clause}
                WHERE id=%s
                """,
                values
            )

            report["updated"] += 1

        # ------------------------------------
        # Delete bad rows
        # ------------------------------------
        if ids_to_delete:

            placeholders = ",".join(
                ["%s"] * len(ids_to_delete)
            )

            cursor.execute(
                f"""
                DELETE FROM `{table_name}`
                WHERE id IN ({placeholders})
                """,
                ids_to_delete
            )

            report["deleted"] = len(ids_to_delete)

    return report


