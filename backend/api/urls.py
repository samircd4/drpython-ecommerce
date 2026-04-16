from django.urls import path, include
from .views import api_root
from . import analytics
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from django.contrib.auth.decorators import login_required

from .export_views import export_data
from .import_views import import_data
from tracking.views import block_user_view

urlpatterns = [
    path("export/<str:model_name>", export_data, name="export-data"),
    path("import/<str:model_name>", import_data, name="import-data"),

    # Tracking endpoints
    path('tracking/block-user/', block_user_view, name='block-user'),

    path('', api_root, name='api-root'),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', login_required(SpectacularSwaggerView.as_view(url_name='schema',
         template_name='swagger_ui.html')), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    path('chats/', include('chat.urls')),
    path('dashboard/stats/', analytics.DashboardStatsView.as_view(),
         name='dashboard-stats'),
    path('dashboard/analytics/', analytics.AnalyticsDetailView.as_view(),
         name='dashboard-analytics-detail'),
    path('', include('accounts.urls')),
    path('', include('orders.urls')),
    path('', include('products.urls')),
    path('', include('reviews.urls')),
    path('', include('web.urls')),
    path('', include('dev_feedback.urls')),
]
