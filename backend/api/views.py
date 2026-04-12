from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse
from drf_spectacular.utils import extend_schema


@extend_schema(exclude=True)
@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request, format=None):
    """
    Sarker Shop API Root
    
    This endpoint provides a comprehensive index of all available API services 
    categorized by their functional area. 
    """
    return Response({
        'system': {
            'status': 'online',
            'version': '2026.1.0',
            'schema': reverse('schema', request=request, format=format),
            'swagger': reverse('swagger-ui', request=request, format=format),
            'redoc': reverse('redoc', request=request, format=format),
        },
        'auth': {
            'login': reverse('token_obtain_pair', request=request, format=format),
            'register': reverse('auth_register', request=request, format=format),
            'refresh': reverse('token_refresh', request=request, format=format),
            'logout': reverse('auth_logout', request=request, format=format),
            'change_password': reverse('change_password', request=request, format=format),
            'forgot_password': reverse('forgot_password', request=request, format=format),
            'reset_password': reverse('reset_password', request=request, format=format),
            'verify_email': reverse('verify_email', request=request, format=format),
            'resend_verification': reverse('resend_verification_email', request=request, format=format),
            'google_login': reverse('google_login', request=request, format=format),
            'facebook_login': reverse('facebook_login', request=request, format=format),
        },
        'accounts': {
            'customers': reverse('customer-list', request=request, format=format),
            'addresses': reverse('address-list', request=request, format=format),
            'users': reverse('user-list', request=request, format=format),
            'groups': reverse('group-list', request=request, format=format),
            'permissions': reverse('permission-list', request=request, format=format),
            'divisions': reverse('division-list', request=request, format=format),
            'districts': reverse('district-list', request=request, format=format),
            'sub_districts': reverse('sub-district-list', request=request, format=format),
        },
        'catalog': {
            'products': reverse('product-list', request=request, format=format),
            'categories': reverse('category-list', request=request, format=format),
            'brands': reverse('brand-list', request=request, format=format),
        },
        'orders_shopping': {
            'orders': reverse('order-list', request=request, format=format),
            'cart': reverse('cart-list', request=request, format=format),
            'cart_items': reverse('cart-item-list', request=request, format=format),
            'checkout': reverse('checkout-list', request=request, format=format),
            'coupons': reverse('coupon-list', request=request, format=format),
            'payments': reverse('payment-list', request=request, format=format),
        },
        'engagement': {
            'reviews': reverse('review-list', request=request, format=format),
            'questions': reverse('question-list', request=request, format=format),
            'contact': reverse('contact-list', request=request, format=format),
            'subscribe': reverse('subscribe-list', request=request, format=format),
            'notifications': reverse('notifications-list', request=request, format=format),
            'store_configuration': reverse('configuration', request=request, format=format),
        },
        'chat': {
            'conversations': reverse('conversation-list', request=request, format=format),
            'init_chat': reverse('customer-chat-init', request=request, format=format),
            'upload_files': reverse('chat-upload', request=request, format=format),
        },
        'dashboard_analytics': {
            'stats': reverse('dashboard-stats', request=request, format=format),
            'detailed_analytics': reverse('dashboard-analytics-detail', request=request, format=format),
        },
        'data_tools': {
            'export': reverse('export-data', args=['products'], request=request, format=format),
            'import': reverse('import-data', args=['products'], request=request, format=format),
        },
    })
