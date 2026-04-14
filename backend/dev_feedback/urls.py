from rest_framework.routers import DefaultRouter
from .views import DevFeedbackViewSet

router = DefaultRouter()
router.register(r'dev-feedback', DevFeedbackViewSet, basename='dev-feedback')

urlpatterns = router.urls
