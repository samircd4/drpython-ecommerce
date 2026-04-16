from tracking.consumers import VisitorConsumer
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.middleware.csrf import csrf_exempt
import json

logger = logging.getLogger(__name__)

# Import the consumer to access blocked users management


class TrackingViewSet(viewsets.ViewSet):
    """
    API endpoints for tracking management.
    """
    permission_classes = [IsAdminUser]  # Only admin can manage blocks

    @action(detail=False, methods=['post'])
    def block_user(self, request):
        """
        Block a user by email (logged-in) or IP address (guest).

        Expected data:
        {
            "user_id": "tamppic@gmail.com",  # Email or IP
            "is_blocked": true,              # Block or unblock
            "identifier": "email" or "ip"    # Type of identifier
        }
        """
        try:
            user_id = request.data.get('user_id')
            is_blocked = request.data.get('is_blocked', False)
            identifier_type = request.data.get('identifier', 'email')

            if not user_id:
                return Response(
                    {'error': 'user_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if is_blocked:
                if identifier_type == 'email':
                    VisitorConsumer.add_blocked_user(email=user_id)
                    logger.info(
                        f"[TRACKING BLOCK] Blocked user email: {user_id}")
                elif identifier_type == 'ip':
                    VisitorConsumer.add_blocked_user(ip_address=user_id)
                    logger.info(f"[TRACKING BLOCK] Blocked user IP: {user_id}")
            else:
                if identifier_type == 'email':
                    VisitorConsumer.remove_blocked_user(email=user_id)
                    logger.info(
                        f"[TRACKING UNBLOCK] Unblocked user email: {user_id}")
                elif identifier_type == 'ip':
                    VisitorConsumer.remove_blocked_user(ip_address=user_id)
                    logger.info(
                        f"[TRACKING UNBLOCK] Unblocked user IP: {user_id}")

            return Response(
                {
                    'success': True,
                    'message': f"User {'blocked' if is_blocked else 'unblocked'} successfully",
                    'user_id': user_id,
                    'is_blocked': is_blocked,
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error in block_user: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Fallback view for direct HTTP endpoint (without DRF)
@csrf_exempt
@require_http_methods(["POST"])
def block_user_view(request):
    """
    Direct HTTP endpoint for blocking users.
    Used as fallback if DRF viewset doesn't work.
    """
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        is_blocked = data.get('is_blocked', False)
        identifier_type = data.get('identifier', 'email')

        if not user_id:
            return JsonResponse(
                {'error': 'user_id is required'},
                status=400
            )

        if is_blocked:
            if identifier_type == 'email':
                VisitorConsumer.add_blocked_user(email=user_id)
                logger.info(f"[TRACKING BLOCK] Blocked user email: {user_id}")
            elif identifier_type == 'ip':
                VisitorConsumer.add_blocked_user(ip_address=user_id)
                logger.info(f"[TRACKING BLOCK] Blocked user IP: {user_id}")
        else:
            if identifier_type == 'email':
                VisitorConsumer.remove_blocked_user(email=user_id)
                logger.info(
                    f"[TRACKING UNBLOCK] Unblocked user email: {user_id}")
            elif identifier_type == 'ip':
                VisitorConsumer.remove_blocked_user(ip_address=user_id)
                logger.info(f"[TRACKING UNBLOCK] Unblocked user IP: {user_id}")

        return JsonResponse(
            {
                'success': True,
                'message': f"User {'blocked' if is_blocked else 'unblocked'} successfully",
                'user_id': user_id,
                'is_blocked': is_blocked,
            },
            status=200
        )
    except Exception as e:
        logger.error(f"Error in block_user_view: {str(e)}")
        return JsonResponse(
            {'error': str(e)},
            status=500
        )
