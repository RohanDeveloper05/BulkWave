from rest_framework import serializers

class EmailCampaignLogSerializer(serializers.Serializer):
    sno = serializers.IntegerField()
    subject = serializers.CharField()
    recipient_type = serializers.CharField()
    list_name = serializers.CharField(allow_null=True)
    uploaded_file = serializers.CharField(allow_null=True)
    recipients_email = serializers.CharField(allow_null=True)
    status = serializers.CharField()
    created_at = serializers.DateTimeField()
    total_emails = serializers.IntegerField()
    from_email = serializers.EmailField()