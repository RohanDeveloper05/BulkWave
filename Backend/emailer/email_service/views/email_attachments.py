from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import EmailAttachment


class EmailAttachmentNameListAPIView(APIView):
    def get(self, request):
        attachments = EmailAttachment.objects.filter(
            useby="List-Attachment"
        ).order_by("-created_at")

        attachment_names = [a.name for a in attachments]

        return Response({
            "attachment_names": attachment_names
        })


class EmailAttachmentListAPIView(APIView):
    """
    GET -> List all attachments
    """

    def get(self, request):
        attachments = EmailAttachment.objects.order_by("-created_at").filter(useby = "List-Attachment")

        data = [
            {
                "id": att.id,
                "file_name": att.name,
                "size": att.size,
                "uploaded_file": att.file.url if att.file else None,
                "created_at": att.created_at,
            }
            for att in attachments
        ]

        return Response(
            {"count": len(data), "results": data},
            status=status.HTTP_200_OK,
        )


class EmailAttachmentViewAPIView(APIView):

    def get(self, request, pk):
        try:
            attachment = EmailAttachment.objects.get(pk=pk)

            data = {
                "id": attachment.id,
                "name": attachment.name,
                "attachment_file": (
                    request.build_absolute_uri(attachment.file.url)
                    if attachment.file else None
                ),
            }

            return Response(
                {
                    "success": True,
                    "data": data
                },
                status=status.HTTP_200_OK
            )

        except EmailAttachment.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Attachment not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class EmailAttachmentCreateAPIView(APIView):
    """
    POST -> Upload new attachment
    """

    def post(self, request):
        name = request.data.get("name")
        file = request.FILES.get("file")

        if not name or not file:
            return Response(
                {"error": "name and file are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        attachment = EmailAttachment.objects.create(
            name=name,
            useby="List-Attachment",
            file=file,
            size=file.size,
        )

        return Response(
            {
                "message": "Attachment uploaded successfully",
                "id": attachment.id,
                "file_name": attachment.name,
            },
            status=status.HTTP_201_CREATED,
        )


class EmailAttachmentUpdateAPIView(APIView):
    """
    PUT -> Update attachment
    """

    def put(self, request, pk):
        try:
            attachment = EmailAttachment.objects.get(pk=pk)
        except EmailAttachment.DoesNotExist:
            return Response(
                {"error": "Attachment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        name = request.data.get("name")
        file = request.FILES.get("file")

        if name:
            attachment.name = name

        if file:
            attachment.file = file
            attachment.size = file.size

        attachment.save()

        return Response(
            {"message": "Attachment updated successfully"},
            status=status.HTTP_200_OK,
        )


class EmailAttachmentDeleteAPIView(APIView):
    """
    DELETE -> Delete attachment
    """

    def delete(self, request, pk):
        try:
            attachment = EmailAttachment.objects.get(pk=pk)
        except EmailAttachment.DoesNotExist:
            return Response(
                {"error": "Attachment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        attachment.delete()

        return Response(
            {"message": "Attachment deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )