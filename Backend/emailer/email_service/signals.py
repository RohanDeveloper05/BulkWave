# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from channels.layers import get_channel_layer
# from asgiref.sync import async_to_sync
# from .models import SESEmailEvent

# @receiver(post_save, sender=SESEmailEvent)
# def send_ses_live_update(sender, instance, created, **kwargs):
#     print("🔥 SIGNAL TRIGGERED")
#     channel_layer = get_channel_layer()

#     data = {
#         "id": instance.id,
#         "message_id": instance.message_id,
#         "recipient": instance.recipient,
#         "event_type": instance.event_type,
#         "timestamp": instance.timestamp.strftime("%Y-%m-%d %H:%M:%S") if instance.timestamp else None,
#         "created_at": instance.created_at.strftime("%Y-%m-%d %H:%M:%S"),
#     }

#     async_to_sync(channel_layer.group_send)(
#         "dashboard_group",
#         {
#             "type": "send_dashboard_data",
#             "data": data
#         }
#     )