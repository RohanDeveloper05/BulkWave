from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailList(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="email_lists"
    )

    list_name = models.CharField(max_length=150, unique=True)
    list_description = models.TextField(blank=True)
    emails = models.TextField(blank=True, null=True, help_text="Comma-separated emails")
    table_name = models.CharField(max_length=150, unique=True)

    uploaded_file = models.FileField(upload_to="email_lists/")
    total_records = models.IntegerField(default=0)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.list_name


class EmailAttachment(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="email_attachments"
    )

    name = models.CharField(max_length=255, unique=True)
    file = models.FileField(upload_to="attachments/")
    size = models.PositiveIntegerField(default=0)
    useby = models.CharField(max_length=25, blank=True, null=True)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "email_attachments"

    def __str__(self):
        return self.name


class EmailCampaign(models.Model):

    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="email_campaigns"
    )

    campaign = models.ForeignKey(
        "Campaign",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="email_campaigns"
    )

    RECIPIENT_TYPE = (
        ("single", "Single"),
        ("list", "List"),
        ("upload", "Upload"),
    )

    STATUS = (
        ("pending", "Pending"),
        ("scheduled", "Scheduled"),
        ("sending", "Sending"),
        ("completed", "Completed"),
    )

    subject = models.CharField(max_length=255)
    from_name = models.CharField(max_length=255)
    from_email = models.EmailField(db_index=True)
    reply_to = models.EmailField(blank=True, null=True)
    body = models.TextField()

    attachments = models.ManyToManyField(
        "EmailAttachment",
        blank=True,
        related_name="campaigns"
    )

    recipient_type = models.CharField(max_length=20, choices=RECIPIENT_TYPE)
    recipient_email = models.EmailField(blank=True, null=True)
    first_name = models.CharField(max_length=255, blank=True, null=True)

    list_name = models.CharField(max_length=150, blank=True, null=True)
    table_name = models.CharField(max_length=150, blank=True, null=True)

    uploaded_file = models.FileField(upload_to="campaign_files/", blank=True, null=True)

    schedule_time = models.DateTimeField(blank=True, null=True)

    total_emails = models.IntegerField(default=0)

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="pending",
        db_index=True
    )

    created_at = models.DateTimeField(
        default=timezone.now,
        db_index=True
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "email_campaigns"
        indexes = [
            models.Index(fields=["created_at"]),
            models.Index(fields=["status"]),
            models.Index(fields=["from_email"]),
        ]


class EmailRecipient(models.Model):

    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="email_recipients"
    )

    campaign = models.ForeignKey(
        EmailCampaign,
        on_delete=models.CASCADE,
        related_name="recipients"
    )

    email = models.EmailField()
    name = models.CharField(max_length=150, blank=True, null=True)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "email_recipients"


class EmailLog(models.Model):

    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="email_logs"
    )

    campaign = models.ForeignKey(
        EmailCampaign,
        on_delete=models.CASCADE,
        related_name="logs"
    )

    recipient_email = models.EmailField()
    status = models.CharField(max_length=20, default="sent")
    sent_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "email_logs"


class SendingEmail(models.Model):

    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="sending_emails"
    )

    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sending_email"

    def __str__(self):
        return self.email


class SESEmailEvent(models.Model):

    EVENT_CHOICES = [
        ("send", "Send"),
        ("delivery", "Delivery"),
        ("open", "Open"),
        ("click", "Click"),
        ("bounce", "Bounce"),
        ("complaint", "Complaint"),
        ("reject", "Reject"),
        ("renderingFailure", "Rendering Failure"),
    ]

    message_id = models.CharField(max_length=255, db_index=True)

    recipient = models.EmailField(db_index=True)

    event_type = models.CharField(
        max_length=50,
        choices=EVENT_CHOICES,
        db_index=True
    )

    timestamp = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True
    )

    # full SES payload
    raw_event = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.event_type} - {self.recipient}"


class CodeTemplate(models.Model):
    
    template_name = models.CharField(max_length=255, default="Untitled")
    description = models.TextField(blank=True, null=True)

    html = models.TextField()
    css = models.TextField(blank=True, null=True)
    js = models.TextField(blank=True, null=True)

    emails = models.TextField(blank=True, null=True, help_text="Comma-separated emails")

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="code_templates", null=True, blank=True)

    def __str__(self):
        return self.template_name



class UnsubscribeReasons(models.Model):
    email = models.EmailField()
    reason = models.CharField(max_length=255, blank=True, null=True)

    # store multiple tables
    tables = models.TextField(blank=True, null=True)

    unsubscribed_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


class Campaign(models.Model):
    RECIPIENT_SOURCE = (
        ("single", "Single"),
        ("list", "List"),
        ("upload", "Upload"),
        ("all", "All Emails"),
    )

    # ---------------- BASIC INFO ----------------
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    # ---------------- SOURCE TYPE ----------------
    recipient_source = models.CharField(
        max_length=20,
        choices=RECIPIENT_SOURCE
    )

    # ---------------- RECIPIENT DATA ----------------
    # For SINGLE
    single_emails = models.JSONField(blank=True, null=True)

    # For LIST
    list = models.ForeignKey("EmailList", on_delete=models.SET_NULL, null=True, blank=True)

    # For UPLOAD
    uploaded_file = models.FileField(
        upload_to="campaign_uploads/",
        blank=True,
        null=True
    )

    # ---------------- META ----------------
    total_emails = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Optional: track status
    STATUS = (
        ("draft", "Draft"),
        ("active", "Active"),
        ("completed", "Completed"),
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="draft"
    )

    def __str__(self):
        return self.name