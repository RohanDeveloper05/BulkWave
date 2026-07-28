# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from asgiref.sync import sync_to_async
# from .models import SESEmailEvent

# class DashboardConsumer(AsyncWebsocketConsumer):

#     async def connect(self):
#         await self.accept()

#         # ✅ Join group (YOU FORGOT THIS)
#         self.group_name = "dashboard_group"
#         await self.channel_layer.group_add(
#             self.group_name,
#             self.channel_name
#         )

#         # ✅ Fetch data using sync_to_async
#         data = await self.get_initial_data()

#         await self.send(text_data=json.dumps({
#             "type": "initial_data",
#             "data": data
#         }))

#     # ✅ DB function wrapped properly
#     @sync_to_async
#     def get_initial_data(self):
#         data = list(SESEmailEvent.objects.values()[:])

#         # ✅ Convert datetime to string
#         for item in data:
#             if item.get("timestamp"):
#                 item["timestamp"] = item["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
#             if item.get("created_at"):
#                 item["created_at"] = item["created_at"].strftime("%Y-%m-%d %H:%M:%S")

#         return data

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             self.group_name,
#             self.channel_name
#         )

#     async def send_dashboard_data(self, event):
#         await self.send(text_data=json.dumps({
#             "type": "ses_event",
#             "data": event["data"]
#         }))