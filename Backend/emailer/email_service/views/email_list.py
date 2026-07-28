import re
import csv
import io
import pandas as pd
from django.db.models import Q
from ..models import EmailList
from ..services import clean_email_table
from django.db import connection, transaction
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
from ..serializers.email_list_serializer import EmailListSerializer
from rest_framework.pagination import PageNumberPagination
from django.http import HttpResponse
from urllib.parse import unquote


class StandardResultsPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

{
# class UploadListCreateTableAPIView(APIView):
#     parser_classes = [MultiPartParser, FormParser]

#     def post(self, request):
#         list_name = request.data.get("list_name")
#         list_description = request.data.get("list_description", "")
#         file = request.FILES.get("list_file")

#         # ✅ FIX: get multiple emails from FormData
#         manual_emails = request.data.getlist("emails")

#         if not list_name or not file:
#             return Response(
#                 {"error": "list_name and list_file are required"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # ------------------------------------------------
#         # ✅ SAFE TABLE NAME
#         # ------------------------------------------------
#         table_name = re.sub(r"[^a-zA-Z0-9_]", "_", list_name.lower()).strip("_")

#         if not table_name:
#             return Response({"error": "Invalid list_name"}, status=400)

#         if EmailList.objects.filter(table_name=table_name).exists():
#             return Response(
#                 {"error": "List with similar name already exists"},
#                 status=400
#             )

#         # ------------------------------------------------
#         # ✅ READ FILE
#         # ------------------------------------------------
#         try:
#             if file.name.endswith(".csv"):
#                 raw_data = file.read()

#                 try:
#                     decoded_data = raw_data.decode("utf-8")
#                 except UnicodeDecodeError:
#                     decoded_data = raw_data.decode("cp1252", errors="ignore")

#                 df = pd.read_csv(io.StringIO(decoded_data))

#                 df = df.applymap(
#                     lambda x: str(x).replace("\xa0", " ").strip() if isinstance(x, str) else x
#                 )

#             elif file.name.endswith((".xlsx", ".xls")):
#                 df = pd.read_excel(file)

#             else:
#                 return Response(
#                     {"error": "Only CSV or Excel allowed"},
#                     status=400
#                 )

#         except Exception as e:
#             return Response({"error": f"File read error: {str(e)}"}, status=400)

#         # ------------------------------------------------
#         # ✅ CLEAN DATA
#         # ------------------------------------------------
#         df = df.where(pd.notnull(df), None)

#         df.columns = [
#             re.sub(r"[^a-zA-Z0-9_]", "_", c.strip().lower())
#             for c in df.columns
#         ]

#         if "email" not in df.columns:
#             return Response(
#                 {"error": "File must contain 'email' column"},
#                 status=400
#             )

#         # ------------------------------------------------
#         # ✅ MERGE EMAILS (FILE + MANUAL)
#         # ------------------------------------------------
#         file_emails = df["email"].dropna().astype(str).str.strip().str.lower().tolist()

#         # clean manual emails
#         manual_emails = [e.strip().lower() for e in manual_emails if e.strip()]

#         # merge + remove duplicates
#         all_emails = list(set(file_emails + manual_emails))

#         # ------------------------------------------------
#         # ✅ CREATE TABLE + INSERT
#         # ------------------------------------------------
#         try:
#             with transaction.atomic():
#                 with connection.cursor() as cursor:

#                     columns_sql = ", ".join(
#                         [f"`{col}` TEXT" for col in df.columns]
#                     )

#                     create_table_sql = f"""
#                         CREATE TABLE `{table_name}` (
#                             id INT AUTO_INCREMENT PRIMARY KEY,
#                             {columns_sql},
#                             unsubscribe TINYINT(1) DEFAULT 0
#                         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
#                     """

#                     cursor.execute(create_table_sql)

#                     cols = ",".join([f"`{c}`" for c in df.columns])
#                     values = ",".join(["%s"] * len(df.columns))

#                     insert_sql = f"""
#                         INSERT INTO `{table_name}` ({cols})
#                         VALUES ({values})
#                     """

#                     rows_to_insert = [
#                         [
#                             None if (v is None or pd.isna(v)) else str(v)
#                             for v in row
#                         ]
#                         for row in df.values
#                     ]

#                     cursor.executemany(insert_sql, rows_to_insert)

#         except Exception as e:
#             return Response(
#                 {"error": f"Database error: {str(e)}"},
#                 status=500
#             )

#         # ------------------------------------------------
#         # ✅ SAVE METADATA (WITH EMAILS)
#         # ------------------------------------------------
#         EmailList.objects.create(
#             list_name=list_name,
#             list_description=list_description,
#             uploaded_file=file,
#             table_name=table_name,
#             total_records=len(all_emails),  # ✅ FIXED
#             emails=",".join(all_emails)     # ✅ FIXED
#         )

#         return Response({
#             "message": "Table created successfully",
#             "table_name": table_name,
#             "total_emails": len(all_emails),
#             "columns": list(df.columns)
#         }, status=201)
}

class UploadListCreateTableAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):

        list_name = request.data.get("list_name")
        list_description = request.data.get("list_description", "")
        file = request.FILES.get("list_file")
        
        manual_emails = request.data.getlist("emails")

        if not list_name or not file:
            return Response(
                {"error": "list_name and list_file are required"},
                status=400
            )

        # ------------------------------------------------
        # MySQL-safe table name
        # ------------------------------------------------
        table_name = re.sub(
            r"[^a-zA-Z0-9_]",
            "_",
            list_name.lower()
        )

        if not table_name:
            return Response({"error": "Invalid list_name"}, status=400)

        if EmailList.objects.filter(table_name=table_name).exists():
            return Response(
                {"error": "List with similar name already exists"},
                status=400
            )

        # ------------------------------------------------
        # Read CSV / Excel
        # ------------------------------------------------
        try:
            if file.name.endswith(".csv"):
                df = pd.read_csv(file)
            elif file.name.endswith((".xlsx", ".xls")):
                df = pd.read_excel(file)
            else:
                return Response(
                    {"error": "Only CSV or Excel allowed"},
                    status=400
                )
        except Exception as e:
            return Response({"error": str(e)}, status=400)

        if df.empty:
            return Response({"error": "File has no rows"}, status=400)

        # ------------------------------------------------
        # 🔥 HARD FIX: Remove NaN completely
        # ------------------------------------------------
        df = df.where(pd.notnull(df), None)

        # ------------------------------------------------
        # Clean column names
        # ------------------------------------------------
        df.columns = [
            re.sub(r"[^a-zA-Z0-9_]", "_", c.strip().lower())
            for c in df.columns
        ]

        # ------------------------------------------------
        # CREATE MYSQL TABLE
        # ------------------------------------------------
        columns_sql = ", ".join(
            [f"`{col}` VARCHAR(255)" for col in df.columns]
        )

        create_table_sql = f"""
            CREATE TABLE IF NOT EXISTS `{table_name}` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                {columns_sql},
                unsubscribe TINYINT(1) DEFAULT 0
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """

        with connection.cursor() as cursor:
            cursor.execute(create_table_sql)

            # ------------------------------------------------
            # INSERT DATA (SAFE)
            # ------------------------------------------------
            cols = ",".join([f"`{c}`" for c in df.columns])
            values = ",".join(["%s"] * len(df.columns))

            insert_sql = f"""
                INSERT INTO `{table_name}` ({cols})
                VALUES ({values})
            """

            rows_to_insert = []
            for _, row in df.iterrows():
                clean_row = [
                    None if (v is None or pd.isna(v)) else str(v)
                    for v in row.tolist()
                ]
                rows_to_insert.append(clean_row)

            if rows_to_insert:
                cursor.executemany(insert_sql, rows_to_insert)

        # ------------------------------------------------
        # SAVE FILE METADATA
        # ------------------------------------------------
        EmailList.objects.create(
            list_name=list_name,
            list_description=list_description,
            uploaded_file=file,
            table_name=table_name,
            total_records=len(df),
            emails=",".join(manual_emails)
        )

        return Response({
            "message": "MySQL table created successfully",
            "table_name": table_name,
            "rows_inserted": len(df),
            "columns": list(df.columns)
        })


class AllListTableAPIView(APIView):
    """
    Fetch all email lists with pagination, search & ordering
    """
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get('search')
        ordering = request.query_params.get('ordering', '-created_at')

        queryset = EmailList.objects.all()

        # 🔍 Search
        if search:
            queryset = queryset.filter(
                Q(list_name__icontains=search) |
                Q(list_description__icontains=search)
            )

        # ↕ Ordering
        queryset = queryset.order_by(ordering)

        # 📄 Pagination
        paginator = StandardResultsPagination()
        paginated_qs = paginator.paginate_queryset(queryset, request)

        serializer = EmailListSerializer(paginated_qs, many=True)

        return paginator.get_paginated_response(serializer.data)


class ListEntrysAPIView(APIView):
    """
    Fetch entries of a specific email list (dynamic table)
    """
    # permission_classes = [IsAuthenticated]

    def get(self, request, id):
        search = request.query_params.get('search', '')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))

        # --------------------------------------------------
        # 1. Fetch list info 
        # --------------------------------------------------
        try:
            email_list = EmailList.objects.get(id=id)
        except EmailList.DoesNotExist:
            return Response(
                {"detail": "Email list not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        table_name = email_list.table_name

        # --------------------------------------------------
        # 2. Fetch data from dynamic table
        # --------------------------------------------------
        with connection.cursor() as cursor:
            cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
            columns = [col[0] for col in cursor.fetchall()]

            where_clause = ""
            params = []

            if search:
                like_conditions = [
                    f"`{col}` LIKE %s" for col in columns
                ]
                where_clause = "WHERE " + " OR ".join(like_conditions)
                params = [f"%{search}%"] * len(columns)

            # Count
            cursor.execute(
                f"SELECT COUNT(*) FROM `{table_name}` {where_clause}",
                params
            )
            total_records = cursor.fetchone()[0]

            offset = (page - 1) * page_size

            # Data
            cursor.execute(
                f"""
                SELECT * FROM `{table_name}`
                {where_clause}
                LIMIT %s OFFSET %s
                """,
                params + [page_size, offset]
            )

            rows = cursor.fetchall()

        # --------------------------------------------------
        # 3. Convert rows to dict
        # --------------------------------------------------
        data = [
            dict(zip(columns, row))
            for row in rows
        ]

        # --------------------------------------------------
        # 4. Response
        # --------------------------------------------------
        return Response({
            "list": {
                "id": email_list.id,
                "name": email_list.list_name,
                "description": email_list.list_description,
            },
            "pagination": {
                "total_records": total_records,
                "page": page,
                "page_size": page_size,
                "total_pages": (total_records + page_size - 1) // page_size
            },
            "results": data
        }, status=status.HTTP_200_OK)


# class AllMergedEmailDataAPIView(APIView):

#     def get(self, request):
#         email_map = {}

#         # ----------------------------------------
#         # 1. Get all lists
#         # ----------------------------------------
#         email_lists = EmailList.objects.all()
#         print(email_lists)

#         for email_list in email_lists:
#             table_name = email_list.table_name
#             list_name = email_list.list_name

#             with connection.cursor() as cursor:
#                 # Get columns
#                 cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
#                 columns = [col[0] for col in cursor.fetchall()]

#                 # Fetch all rows
#                 cursor.execute(f"SELECT * FROM `{table_name}`")
#                 rows = cursor.fetchall()

#             for row in rows:
#                 row_data = dict(zip(columns, row))

#                 # ----------------------------------------
#                 # 2. Extract all possible emails
#                 # ----------------------------------------
#                 emails = [
#                     row_data.get("Email_id"),
#                     row_data.get("Email_id_01"),
#                     row_data.get("Email_id_02"),
#                 ]

#                 emails = [e for e in emails if e]

#                 for email in emails:

#                     if email not in email_map:
#                         # New entry
#                         email_map[email] = {
#                             "First_Name": row_data.get("First_Name"),
#                             "Last_Name": row_data.get("Last_Name"),
#                             "Designation": row_data.get("Designation"),
#                             "Mobile": row_data.get("Mobile"),
#                             "Mobile_01": row_data.get("Mobile_01"),
#                             "Mobile_02": row_data.get("Mobile_02"),
#                             "Email_id": email,
#                             "Email_id_01": row_data.get("Email_id_01"),
#                             "Email_id_02": row_data.get("Email_id_02"),
#                             "Company_Name": row_data.get("Company_Name"),
#                             "Address": row_data.get("Address"),
#                             "State": row_data.get("State"),
#                             "City": row_data.get("City"),
#                             "Locality": row_data.get("Locality"),
#                             "Pincode": row_data.get("Pincode"),
#                             "Father_Name": row_data.get("Father_Name"),
#                             "list_names": [list_name]
#                         }
#                     else:
#                         # Duplicate email → append list name
#                         if list_name not in email_map[email]["list_names"]:
#                             email_map[email]["list_names"].append(list_name)

#         # ----------------------------------------
#         # 3. Convert to list
#         # ----------------------------------------
#         final_data = list(email_map.values())

#         return Response({
#             "total_unique_emails": len(final_data),
#             "results": final_data
#         })




class AllMergedEmailDataAPIView(APIView):

    def get(self, request):
        email_map = {}

        # ----------------------------------------
        # Query Params
        # ----------------------------------------
        page = int(request.GET.get("page", 1))
        page_size = int(request.GET.get("page_size", 30))

        search = request.GET.get("search", "").lower()

        list_filter = request.GET.getlist("list_names")
        subscribers = request.GET.get("subscribers")
        list_usage = request.GET.getlist("list_usage")

        min_lists = request.GET.get("min_lists")
        max_lists = request.GET.get("max_lists")

        min_lists = int(min_lists) if min_lists else None
        max_lists = int(max_lists) if max_lists else None

        start_index = (page - 1) * page_size
        end_index = start_index + page_size

        # ----------------------------------------
        # Filter EmailList (DB level)
        # ----------------------------------------
        email_lists = EmailList.objects.all()

        if list_filter:
            query = Q()
            for name in list_filter:
                query |= Q(list_name__icontains=name.strip())
            email_lists = email_lists.filter(query)

        if list_usage:
            email_lists = email_lists.filter(usage__in=list_usage)  # adjust field if needed

        # ----------------------------------------
        # Loop all lists
        # ----------------------------------------
        for email_list in email_lists:
            table_name = email_list.table_name
            list_name = email_list.list_name

            with connection.cursor() as cursor:

                # Get columns
                cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
                columns = [col[0] for col in cursor.fetchall()]
                col_map = {col.lower(): col for col in columns}

                needed_cols = [
                    "first_name", "last_name", "designation",
                    "mobile", "mobile_01", "mobile_02",
                    "email_id", "email_id_01", "email_id_02",
                    "company_name", "address", "state", "city",
                    "locality", "pincode", "father_name", "unsubscribe"
                ]

                selected_keys = [c for c in needed_cols if c in col_map]
                if not selected_keys:
                    continue

                select_cols = [f"`{col_map[c]}`" for c in selected_keys]

                cursor.execute(f"""
                    SELECT {', '.join(select_cols)}
                    FROM `{table_name}`
                """)

                while True:
                    rows = cursor.fetchmany(1000)
                    if not rows:
                        break

                    for row in rows:
                        row_data = dict(zip(selected_keys, row))

                        emails = [
                            row_data.get("email_id"),
                            row_data.get("email_id_01"),
                            row_data.get("email_id_02"),
                        ]
                        emails = [e for e in emails if e]

                        for email in emails:
                            if email not in email_map:
                                email_map[email] = {
                                    "First_Name": row_data.get("first_name"),
                                    "Last_Name": row_data.get("last_name"),
                                    "Designation": row_data.get("designation"),
                                    "Mobile": row_data.get("mobile"),
                                    "Mobile_01": row_data.get("mobile_01"),
                                    "Mobile_02": row_data.get("mobile_02"),
                                    "Email_id": email,
                                    "Email_id_01": row_data.get("email_id_01"),
                                    "Email_id_02": row_data.get("email_id_02"),
                                    "Company_Name": row_data.get("company_name"),
                                    "Address": row_data.get("address"),
                                    "State": row_data.get("state"),
                                    "City": row_data.get("city"),
                                    "Locality": row_data.get("locality"),
                                    "Pincode": row_data.get("pincode"),
                                    "Father_Name": row_data.get("father_name"),
                                    "Unsubscribe": row_data.get("unsubscribe"),
                                    "list_names": [list_name],
                                }
                            else:
                                if list_name not in email_map[email]["list_names"]:
                                    email_map[email]["list_names"].append(list_name)

        # ----------------------------------------
        # Convert to list
        # ----------------------------------------
        final_data = list(email_map.values())

        # ----------------------------------------
        # Add list_count
        # ----------------------------------------
        for item in final_data:
            item["list_count"] = len(item.get("list_names", []))

        # ----------------------------------------
        # FILTER FUNCTIONS
        # ----------------------------------------
        def matches_search(item):
            if not search:
                return True

            combined = " ".join([
                str(item.get("First_Name", "")),
                str(item.get("Last_Name", "")),
                str(item.get("Email_id", "")),
                str(item.get("Email_id_01", "")),
                str(item.get("Email_id_02", "")),
                str(item.get("Mobile", "")),
                str(item.get("Mobile_01", "")),
                str(item.get("Mobile_02", "")),
                str(item.get("Company_Name", "")),
                str(item.get("Address", "")),
                str(item.get("State", "")),
                str(item.get("City", "")),
                str(item.get("Locality", "")),
                str(item.get("Pincode", "")),
            ]).lower()

            return search in combined

        def matches_subscriber(item):
            if not subscribers:
                return True

            if subscribers == "subscribed":
                return not item.get("Unsubscribe")
            elif subscribers == "unsubscribed":
                return bool(item.get("Unsubscribe"))

            return True

        def matches_list(item):
            if not list_filter:
                return True

            item_lists = [l.lower() for l in item.get("list_names", [])]

            return any(
                any(f.lower() in item_list for item_list in item_lists)
                for f in list_filter
            )

        def matches_list_count(item):
            count = item.get("list_count", 0)

            if min_lists is not None and count < min_lists:
                return False

            if max_lists is not None and count > max_lists:
                return False

            return True

        # ----------------------------------------
        # APPLY FILTERS
        # ----------------------------------------
        final_data = [
            item for item in final_data
            if matches_search(item)
            and matches_subscriber(item)
            and matches_list(item)
            and matches_list_count(item)
        ]

        # ----------------------------------------
        # Pagination
        # ----------------------------------------
        total_records = len(final_data)
        paginated_data = final_data[start_index:end_index]

        # ----------------------------------------
        # Response
        # ----------------------------------------
        return Response({
            "pagination": {
                "total_records": total_records,
                "page": page,
                "page_size": page_size,
                "total_pages": (total_records + page_size - 1) // page_size,
                "has_next": end_index < total_records,
                "has_previous": start_index > 0
            },
            "results": paginated_data
        })


class DownloadListCSVAPIView(APIView):
    """
    Download full email list as CSV
    """

    def get(self, request, id):
        search = request.query_params.get('search', '')

        # --------------------------------------------------
        # 1. Fetch list info
        # --------------------------------------------------
        try:
            email_list = EmailList.objects.get(id=id)
        except EmailList.DoesNotExist:
            return Response(
                {"detail": "Email list not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        table_name = email_list.table_name

        # --------------------------------------------------
        # 2. Fetch data from dynamic table
        # --------------------------------------------------
        with connection.cursor() as cursor:
            cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
            columns = [col[0] for col in cursor.fetchall()]

            where_clause = ""
            params = []

            if search:
                like_conditions = [
                    f"`{col}` LIKE %s" for col in columns
                ]
                where_clause = "WHERE " + " OR ".join(like_conditions)
                params = [f"%{search}%"] * len(columns)

            cursor.execute(
                f"""
                SELECT * FROM `{table_name}`
                {where_clause}
                """,
                params
            )

            rows = cursor.fetchall()

        # --------------------------------------------------
        # 3. Create CSV response
        # --------------------------------------------------
        response = HttpResponse(content_type='text/csv')
        file_name = f"{email_list.list_name.replace(' ', '_')}.csv"
        response['Content-Disposition'] = f'attachment; filename="{file_name}"'

        writer = csv.writer(response)

        # Write header
        writer.writerow(columns)

        # Write rows
        for row in rows:
            writer.writerow(row)

        return response


class ListByEmailAPIView(APIView):

    def get(self, request):
        email = request.query_params.get("email")

        if not email:
            return Response({"error": "Email is required"}, status=400)

        # Decode + normalize
        email = unquote(email).strip().lower()

        # 🔥 Exact match handling inside comma-separated field
        queryset = EmailList.objects.filter(
            Q(emails__iexact=email) |                    # only email
            Q(emails__istartswith=email + ",") |         # start
            Q(emails__iendswith="," + email) |           # end
            Q(emails__icontains="," + email + ",")       # middle
        ).distinct()

        serializer = EmailListSerializer(queryset, many=True)

        return Response({
            "email": email,
            "total_lists": queryset.count(),
            "lists": serializer.data
        })


class DeleteEmailListAPIView(APIView):

    def delete(self, request, list_id):
        try:
            # ---------------------------------------------
            # GET OBJECT
            # ---------------------------------------------
            email_list = EmailList.objects.get(id=list_id)
            table_name = email_list.table_name

            # ---------------------------------------------
            # SAFETY CHECK (avoid SQL injection)
            # ---------------------------------------------
            if not table_name or not table_name.replace("_", "").isalnum():
                return Response(
                    {"error": "Invalid table name"},
                    status=400
                )

            # ---------------------------------------------
            # DROP TABLE
            # ---------------------------------------------
            with connection.cursor() as cursor:
                cursor.execute(f"DROP TABLE IF EXISTS `{table_name}`")

            # ---------------------------------------------
            # DELETE FILE (optional but recommended)
            # ---------------------------------------------
            if email_list.uploaded_file:
                email_list.uploaded_file.delete(save=False)

            # ---------------------------------------------
            # DELETE MODEL ENTRY
            # ---------------------------------------------
            email_list.delete()

            return Response({
                "message": "List and table deleted successfully",
                "deleted_table": table_name
            })

        except EmailList.DoesNotExist:
            return Response(
                {"error": "List not found"},
                status=404
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=500
            )

# This is for Data Clean
class CleanListAPIView(APIView):

    def post(self, request):

        table_name = request.data.get("table_name")

        if not table_name:
            return Response(
                {"error": "table_name required"},
                status=400
            )

        report = clean_email_table(table_name)

        return Response({
            "success": True,
            "report": report
        })