from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import CodeTemplate
from django.db.models import F
from django.db.models import QuerySet


class CodeTemplateListAPIView(APIView):
    
    def get(self, request):
        templates = CodeTemplate.objects.select_related("created_by").values(
            "id",
            "template_name",
            "description",
            "created_at",
            # created_by=F("created_by__username")
        ).order_by("-created_at")

        return Response({
            "status": True,
            "data": list(templates)
        })


class CodeTemplateOneAPIView(APIView):
    
    def get(self, request, id):
        
        template = CodeTemplate.objects.filter(id=id).values(
            "id",
            "template_name",
            "description",
            "html",
            "css",
            "js",
            "created_at",
            # created_by=F("created_by__username")
        )
        
        return Response({
            "status": status.HTTP_200_OK,
            "data": template
        })




class CodeTemplateCreateAPIView(APIView):

    def post(self, request):
        try:
            template_name = request.data.get("template_name", "Untitled")
            description = request.data.get("description")
            html = request.data.get("html")
            css = request.data.get("css")
            js = request.data.get("js")
            emails = request.data.get("emails")

            # Basic validation
            if not html:
                return Response({
                    "status": False,
                    "message": "HTML code is required"
                }, status=status.HTTP_400_BAD_REQUEST)

            template = CodeTemplate.objects.create(
                template_name=template_name,
                description=description,
                html=html,
                css=css,
                js=js,
                emails=emails,
                created_by=request.user if request.user.is_authenticated else None
            )

            return Response({
                "status": True,
                "message": "Template created successfully",
                "data": {
                    "id": template.id,
                    "template_name": template.template_name
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CodeTemplateUpdateAPIView(APIView):

    def put(self, request, id):
        try:
            try:
                template = CodeTemplate.objects.get(id=id)
            except CodeTemplate.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "Template not found"
                }, status=status.HTTP_404_NOT_FOUND)

            template_name = request.data.get("template_name")
            description = request.data.get("description")
            html = request.data.get("html")
            css = request.data.get("css")
            js = request.data.get("js")
            emails = request.data.get("emails")

            # Validation (same logic as create)
            if html is not None and html == "":
                return Response({
                    "status": False,
                    "message": "HTML code cannot be empty"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Update only provided fields
            if template_name is not None:
                template.template_name = template_name

            if description is not None:
                template.description = description

            if html is not None:
                template.html = html

            if css is not None:
                template.css = css

            if js is not None:
                template.js = js

            if emails is not None:
                template.emails = emails

            template.save()

            return Response({
                "status": True,
                "message": "Template updated successfully",
                "data": {
                    "id": template.id,
                    "template_name": template.template_name
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CodeTemplateDeleteAPIView(APIView):

    def delete(self, request, id):
        try:
            try:
                template = CodeTemplate.objects.get(id=id)
            except CodeTemplate.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "Template not found"
                }, status=status.HTTP_404_NOT_FOUND)

            template.delete()

            return Response({
                "status": True,
                "message": "Template deleted successfully"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TemplatesNameAPIView(APIView):
    """
    API to fetch list of code templates with optional email filtering.
    Pass ?email=test@example.com
    """

    def get(self, request):
        try:
            email = request.query_params.get("email")

            templates = CodeTemplate.objects.only(
                "id", "template_name", "html", "css", "js", "emails"
            )

            # Apply filtering if email is provided
            if email:
                templates = templates.filter(emails__icontains=email)

            templates = templates.values(
                "id", "template_name", "html", "css", "js"
            )

            return Response(
                {
                    "success": True,
                    "message": "Templates fetched successfully.",
                    "count": templates.count(),
                    "data": list(templates),
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Something went wrong while fetching templates.",
                    "error": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )