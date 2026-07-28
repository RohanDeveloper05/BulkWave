from ..models import SESEmailEvent, EmailLog
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from django.db.models.functions import TruncDate
from django.utils.dateparse import parse_date
from django.core.paginator import Paginator, EmptyPage
from datetime import datetime, time
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
import boto3
from django.conf import settings

class DashboardTrackingAPIView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request):

        filter_type = request.GET.get("filter", "this_month")
        now = timezone.now()

        # Default ranges
        start_date = None
        end_date = now

        # THIS MONTH
        if filter_type == "this_month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # LAST MONTH
        elif filter_type == "last_month":
            current_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end_date = current_start - timedelta(seconds=1)
            start_date = end_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # LAST 30 DAYS
        elif filter_type == "last_30_days":
            start_date = now - timedelta(days=30)

        # CUSTOM RANGE
        elif filter_type == "custom":
            start_date_str = request.GET.get("start_date")
            end_date_str = request.GET.get("end_date")

            if not start_date_str or not end_date_str:
                return Response(
                    {"error": "start_date and end_date required for custom filter"},
                    status=400
                )

            # ✅ Convert to date objects
            start_date = parse_date(start_date_str)
            end_date = parse_date(end_date_str)

            if not start_date or not end_date:
                return Response({"error": "Invalid date format"}, status=400)

            # ✅ Convert to datetime (IMPORTANT)
            start_date = datetime.combine(start_date, time.min)
            end_date = datetime.combine(end_date, time.max)

        # Queryset for current filter
        current_qs = SESEmailEvent.objects.filter(
            timestamp__gte=start_date,
            timestamp__lte=end_date
        )

        # Previous period logic (for comparison)
        duration = end_date - start_date
        prev_start = start_date - duration
        prev_end = start_date

        last_qs = SESEmailEvent.objects.filter(
            timestamp__gte=prev_start,
            timestamp__lt=prev_end
        )

        # Aggregation
        def get_stats(qs):
            return qs.aggregate(
                sent=Count('id', filter=Q(event_type='send')),
                failed=Count('id', filter=Q(event_type__in=['bounce', 'reject', 'renderingFailure'])),
                spam=Count('id', filter=Q(event_type='complaint')),
                open=Count('id', filter=Q(event_type='open')),
                click=Count('id', filter=Q(event_type='click')),
            )

        current = get_stats(current_qs)
        last = get_stats(last_qs)

        # % change
        def calc_rate(curr, prev):
            if prev == 0:
                return "new" if curr > 0 else 0
            return round(((curr - prev) / prev) * 100, 2)

        response = {}

        for key in current.keys():
            response[key] = {
                "current": current[key],
                "last": last[key],
                "change_percent": calc_rate(current[key], last[key])
            }

        return Response(response)


class Last30DaysTrackingAPIView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request):

        now = timezone.now()
        last_30_days = now - timedelta(days=30)

        # Group by date
        queryset = (
            SESEmailEvent.objects
            .filter(timestamp__gte=last_30_days, timestamp__lte=now)
            .annotate(date=TruncDate('timestamp'))
            .values('date')
            .annotate(

                sent=Count('id', filter=Q(event_type='send')),

                failed=Count(
                    'id',
                    filter=Q(event_type__in=['bounce', 'reject', 'renderingFailure'])
                ),

                spam=Count('id', filter=Q(event_type='complaint')),

                open=Count('id', filter=Q(event_type='open')),

                click=Count('id', filter=Q(event_type='click')),
            )
            .order_by('-date')
        )

        # Convert to desired format
        result = {}

        for item in queryset:
            formatted_date = item['date'].strftime("%d %B %Y")  # e.g. 20 March 2026

            result[formatted_date] = {
                "sent": item["sent"],
                "failed": item["failed"],
                "spam": item["spam"],
                "open": item["open"],
                "click": item["click"],
            }

        return Response(result)



class SESDailyLimitAPIView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        try:
            client = boto3.client(
                "ses",
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            )

            quota = client.get_send_quota()

            max_24h = float(quota["Max24HourSend"])
            sent_24h = float(quota["SentLast24Hours"])
            # sent_24h = float("2000")
            remaining = max_24h - sent_24h

            return Response({
                "status": "success",
                "daily_limit": int(max_24h),
                "sent_last_24_hours": int(sent_24h),
                "remaining": int(remaining),
                "max_send_rate_per_sec": quota["MaxSendRate"]
            })

        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            })




class KPICardPagination(PageNumberPagination):
    page_size = 10  # default items per page
    page_size_query_param = 'page_size'
    max_page_size = 100


class KPICardInfoAPIView(APIView):
    permission_classes = []
    authentication_classes = []

    KPI_FILTERS = {
        "send": ["send"],
        "failed": ["bounce", "reject", "renderingFailure"],
        "spam": ["complaint"],
        "open": ["open"],
    }

    def get(self, request):
        try:
            kpi_card = request.GET.get("KPICard", "").lower()
            search = request.GET.get("search", "").strip()

            # Filter type
            filter_type = request.GET.get("filter", "this_month")
            now = timezone.now()

            start_date = None
            end_date = now

            # THIS MONTH
            if filter_type == "this_month":
                start_date = now.replace(
                    day=1,
                    hour=0,
                    minute=0,
                    second=0,
                    microsecond=0
                )

            # LAST MONTH
            elif filter_type == "last_month":
                current_start = now.replace(
                    day=1,
                    hour=0,
                    minute=0,
                    second=0,
                    microsecond=0
                )

                end_date = current_start - timedelta(seconds=1)

                start_date = end_date.replace(
                    day=1,
                    hour=0,
                    minute=0,
                    second=0,
                    microsecond=0
                )

            # LAST 30 DAYS
            elif filter_type == "last_30_days":
                start_date = now - timedelta(days=30)

            # CUSTOM DATE RANGE
            elif filter_type == "custom":
                start_date_str = request.GET.get("start_date")
                end_date_str = request.GET.get("end_date")

                if not start_date_str or not end_date_str:
                    return Response(
                        {
                            "status": "error",
                            "message": "start_date and end_date are required for custom filter."
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                start_date = parse_date(start_date_str)
                end_date = parse_date(end_date_str)

                if not start_date or not end_date:
                    return Response(
                        {
                            "status": "error",
                            "message": "Invalid date format."
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                start_date = datetime.combine(start_date, time.min)
                end_date = datetime.combine(end_date, time.max)

            else:
                return Response(
                    {
                        "status": "error",
                        "message": "Invalid filter value."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate KPI card
            if kpi_card not in self.KPI_FILTERS:
                return Response(
                    {
                        "status": "error",
                        "message": "Invalid KPICard value",
                        "valid_options": list(self.KPI_FILTERS.keys())
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Base queryset
            queryset = SESEmailEvent.objects.filter(
                event_type__in=self.KPI_FILTERS[kpi_card],
                timestamp__gte=start_date,
                timestamp__lte=end_date
            )

            # Search filter
            if search:
                queryset = queryset.filter(
                    Q(recipient__icontains=search) |
                    Q(event_type__icontains=search) |
                    Q(raw_event__mail__source__icontains=search) |
                    Q(raw_event__mail__commonHeaders__subject__icontains=search)
                )

            queryset = queryset.order_by("-timestamp")

            # Pagination
            paginator = KPICardPagination()
            paginated_qs = paginator.paginate_queryset(queryset, request)

            data = []

            for obj in paginated_qs:
                raw = obj.raw_event or {}

                data.append({
                    "recipient": obj.recipient,
                    "event_type": obj.event_type,
                    "source": raw.get("mail", {}).get("source"),
                    "subject": raw.get("mail", {}).get("commonHeaders", {}).get("subject"),
                    "timestamp": obj.timestamp,
                })

            return paginator.get_paginated_response({
                "status": "success",
                "filter": filter_type,
                "KPICard": kpi_card,
                "data": data
            })

        except Exception as e:
            return Response(
                {
                    "status": "error",
                    "message": "Something went wrong",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )