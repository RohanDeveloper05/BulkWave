from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import connection
from ..models import EmailList, UnsubscribeReasons
from ..services import decode_unsubscribe_token


class UnsubscribeAPIView(APIView):

    def post(self, request):
        token = request.data.get("token")
        reason = request.data.get("reason", "")

        email = decode_unsubscribe_token(token)

        if not email:
            return Response({"error": "Invalid or expired token"}, status=400)

        # 🔥 your existing logic here
        tables_updated = []
        total_updated = 0

        email_lists = EmailList.objects.all()

        with connection.cursor() as cursor:
            for email_list in email_lists:
                table_name = email_list.table_name

                cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
                columns = [col[0] for col in cursor.fetchall()]

                email_columns = [c for c in columns if "email" in c.lower()]
                if not email_columns:
                    continue

                conditions = " OR ".join(
                    [f"`{col}` = %s" for col in email_columns]
                )

                sql = f"""
                    UPDATE `{table_name}`
                    SET unsubscribe = 1
                    WHERE {conditions}
                """

                cursor.execute(sql, [email] * len(email_columns))

                if cursor.rowcount > 0:
                    tables_updated.append(table_name)
                    total_updated += cursor.rowcount

        # save reason
        UnsubscribeReasons.objects.create(
            email=email,
            reason=reason,
            tables=", ".join(tables_updated),
            unsubscribed_count=total_updated
        )

        return Response({
            "message": "Unsubscribed successfully",
            "email": email
        })