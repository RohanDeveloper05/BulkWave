from django.urls import path
from email_service.view import *
from email_service.views.email_seder import *
from email_service.views.test import *
from email_service.views.email_list import *
from email_service.views.email_recipients import *
from email_service.views.email_attachments import *
from email_service.views.email_dashboard import *
from email_service.views.email_templates import *
from email_service.views.email_unsubscribe import *
from email_service.ses_webhook import SESWebhookAPIView
from django.conf.urls.static import static
urlpatterns = [
    path('home/',home, name='home'),
    path('send_email/', SendEmailAPIView.as_view(), name='send_email'),
    path('ses-speed-test/', SesSpeedTestAPIView.as_view(), name='send_email'),
    
    path('list-name/', ListByEmailAPIView.as_view(), name='list_name'),
    path('list-email/', AllListTableAPIView.as_view(), name='list_email'),
    path('view-list-entry/<int:id>/', ListEntrysAPIView.as_view(), name='list_entry'),
    path('upload-list-email/', UploadListCreateTableAPIView.as_view(), name='send_email'),
    path('email-recipients/', EmailCampaignLogsAPIView.as_view(), name='email_recipients'),
    path('all-list-email/', AllMergedEmailDataAPIView.as_view(), name='all_list_email'),
    path('lists/<int:id>/download-csv/', DownloadListCSVAPIView.as_view(), name='list-download-csv'),
    path("delete-list/<int:list_id>/", DeleteEmailListAPIView.as_view(), name='delete-list'),
    path("clean-list/", CleanListAPIView.as_view(), name='clean-list-data'),
    
    path("attachments-view/<int:pk>/", EmailAttachmentViewAPIView.as_view(), name='attachments_view'),
    path("attachments-list/", EmailAttachmentListAPIView.as_view(), name='attachments_list'),
    path("attachments-create/", EmailAttachmentCreateAPIView.as_view(), name='attachments_create'),
    path("attachments-update/<int:pk>/", EmailAttachmentUpdateAPIView.as_view(), name='attachments_update'),
    path("attachments-delete/<int:pk>/", EmailAttachmentDeleteAPIView.as_view(), name='attachments_delete'),
    path("attachments-name/", EmailAttachmentNameListAPIView.as_view(), name='attachments_name'),
    
    path("data/track/", DashboardTrackingAPIView.as_view(), name="email_data"),
    path("data/30daystrack/", Last30DaysTrackingAPIView.as_view(), name="email_data_30days"),
    path("data/kpicard/", KPICardInfoAPIView.as_view(), name="KPICard"),
    path("data/emaillimit/", SESDailyLimitAPIView.as_view(), name='Email_Limit'),
    
    path('templates-name/', TemplatesNameAPIView.as_view(), name='template-name'),
    path('templates-list/', CodeTemplateListAPIView.as_view(), name='template-list'),
    path('template-one/<int:id>/', CodeTemplateOneAPIView.as_view(), name='template-one'),
    path('templates-create/', CodeTemplateCreateAPIView.as_view(), name='template-create'),
    path('template-update/<int:id>/', CodeTemplateUpdateAPIView.as_view(), name='template-update'),
    path('template-delete/<int:id>/', CodeTemplateDeleteAPIView.as_view(), name='template-delete'),
    
    path('unsubscribe-email/', UnsubscribeAPIView.as_view(), name='unsubscribe-email'),
    
    path("re/updates/", SESWebhookAPIView.as_view(), name='ses_webhook'),
]

# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)