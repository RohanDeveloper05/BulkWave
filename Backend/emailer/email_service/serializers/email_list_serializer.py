from rest_framework import serializers
from ..models import EmailList

class EmailListSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailList
        fields = [
            'id',
            'list_name',
            'list_description',
            'total_records',
            'created_at',
            'updated_at',
        ]