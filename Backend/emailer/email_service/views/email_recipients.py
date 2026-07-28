from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from django.utils.timezone import now
from datetime import timedelta, datetime
from rest_framework.pagination import PageNumberPagination

from ..models import EmailCampaign
from ..serializers.email_recipients_serializer import EmailCampaignLogSerializer


class StandardResultsPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class EmailCampaignLogsAPIView(APIView):
    pagination_class = StandardResultsPagination

    def get(self, request):
        queryset = EmailCampaign.objects.all().order_by("-created_at")

        # ---------------- SEARCH ----------------
        search = request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(subject__icontains=search) |
                Q(from_email__icontains=search) |
                Q(list_name__icontains=search)
            )

        # ---------------- STATUS FILTER ----------------
        VALID_STATUS = [choice[0] for choice in EmailCampaign.STATUS]

        status_param = request.query_params.get("status")
        if status_param:
            status_list = status_param.split(",")

            invalid = [s for s in status_list if s not in VALID_STATUS]
            if invalid:
                return Response(
                    {"error": f"Invalid status: {invalid}"},
                    status=400
                )

            queryset = queryset.filter(status__in=status_list)

        # ---------------- FROM EMAIL ----------------
        from_email = request.query_params.get("from_email")
        if from_email:
            queryset = queryset.filter(from_email__icontains=from_email)

        # ---------------- TOTAL EMAIL RANGE ----------------
        min_emails = request.query_params.get("min_emails")
        max_emails = request.query_params.get("max_emails")

        if min_emails and min_emails.isdigit():
            queryset = queryset.filter(total_emails__gte=int(min_emails))

        if max_emails and max_emails.isdigit():
            queryset = queryset.filter(total_emails__lte=int(max_emails))

        # ---------------- DATE FILTER ----------------
        today = now()
        date_filter = request.query_params.get("date_filter")

        if date_filter == "this_month":
            queryset = queryset.filter(
                created_at__year=today.year,
                created_at__month=today.month
            )

        elif date_filter == "last_month":
            first_day = today.replace(day=1)
            last_month = first_day - timedelta(days=1)

            queryset = queryset.filter(
                created_at__year=last_month.year,
                created_at__month=last_month.month
            )

        elif date_filter == "last_30_days":
            queryset = queryset.filter(
                created_at__gte=today - timedelta(days=30)
            )

        # ---------------- CUSTOM DATE RANGE ----------------
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        if start_date and end_date:
            try:
                start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
                end_date = datetime.strptime(end_date, "%Y-%m-%d").date()

                queryset = queryset.filter(
                    created_at__date__range=(start_date, end_date)
                )
            except ValueError:
                return Response(
                    {"error": "Invalid date format (YYYY-MM-DD required)"},
                    status=400
                )

        # ---------------- SORTING ----------------
        ordering = request.query_params.get("ordering")

        ALLOWED_FIELDS = ["created_at", "total_emails", "status"]

        if ordering:
            field = ordering.replace("-", "")
            if field in ALLOWED_FIELDS:
                queryset = queryset.order_by(ordering)

        # ---------------- PAGINATION ----------------
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)

        results = []
        start_index = paginator.page.start_index()

        for index, campaign in enumerate(page):
            results.append({
                "sno": start_index + index,
                "subject": campaign.subject,
                "recipient_type": campaign.recipient_type,
                "list_name": campaign.list_name,
                "uploaded_file": campaign.uploaded_file.url if campaign.uploaded_file else None,
                "recipients_email": campaign.recipient_email,
                "status": campaign.status,
                "created_at": campaign.created_at,
                "total_emails": campaign.total_emails,
                "from_email": campaign.from_email,
            })

        serializer = EmailCampaignLogSerializer(results, many=True)
        return paginator.get_paginated_response(serializer.data)