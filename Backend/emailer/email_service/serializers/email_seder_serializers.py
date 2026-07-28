# emailer/serializers.py
from rest_framework import serializers

class RecipientSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=["single recipient", "mailing list", "CSV/ Excel"])
    email = serializers.EmailField(required=False)
    list_name = serializers.CharField(required=False)
    file = serializers.FileField(required=False)

class ScheduleSerializer(serializers.Serializer):
    date = serializers.CharField()
    time = serializers.CharField()


class EmailSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=255)
    from_name = serializers.CharField(max_length=255)
    from_email = serializers.EmailField()
    reply_to = serializers.EmailField(required=False, allow_blank=True)

    # ✅ NEW
    email_format = serializers.ChoiceField(choices=["HTML", "TEXT"])
    email_template = serializers.CharField(required=False)  # template name
    email_text = serializers.CharField(required=False)
    
    first_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    is_campaign = serializers.BooleanField(required=False, default=False)

    campaign_name = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    campaign_description = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    recipient_type = serializers.ChoiceField(
        choices=["single", "list", "upload"]
    )

    recipients = serializers.CharField(required=False, allow_blank=True)
    recipient_file = serializers.FileField(required=False)

    attachment_names = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )

    attachment_files = serializers.ListField(
        child=serializers.FileField(),
        required=False
    )

    schedule_date = serializers.CharField(required=False)
    schedule_time = serializers.CharField(required=False)

    def validate(self, data):
        email_format = data.get("email_format")
        r_type = data.get("recipient_type")

        if email_format == "HTML" and not data.get("email_template"):
            raise serializers.ValidationError({
                "email_template": "Template name is required"
            })

        if email_format == "TEXT" and not data.get("email_text"):
            raise serializers.ValidationError({
                "email_text": "Text body is required"
            })

        if r_type in ["single", "list"] and not data.get("recipients"):
            raise serializers.ValidationError({
                "recipients": "Required for single/list"
            })

        if r_type == "upload" and not data.get("recipient_file"):
            raise serializers.ValidationError({
                "recipient_file": "CSV/Excel file required"
            })

        if r_type == "single" and not data.get("first_name"):
            raise serializers.ValidationError({
                "first_name": "First name is required for single recipient"
            })

        if data.get("is_campaign"):
            if not data.get("campaign_name"):
                raise serializers.ValidationError({
                    "campaign_name": "Campaign name is required when is_campaign is true"
                })

        return data