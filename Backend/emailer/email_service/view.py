from django.http import HttpResponse
from django.utils import timezone
from django.conf import settings

def home(request):
    utc_time = timezone.now()
    # ist_time = timezone.localtime()

    print("UTC Time:", utc_time)
    # print("IST Time:", ist_time)
    # print("Timezone:", ist_time.tzinfo)
    
    return HttpResponse("Chithi Email Service is running 🚀")
