from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import BasePermission

from registry.models import EXPORT_REGISTRY
from services.import_service import import_from_excel


class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser


@api_view(["POST"])
@permission_classes([IsSuperUser])
def import_data(request, model_name):
    config = EXPORT_REGISTRY.get(model_name)

    if not config:
        return Response({"error": "Invalid model"}, status=400)

    file = request.FILES.get("file")

    if not file:
        return Response({"error": "No file provided"}, status=400)

    created, errors = import_from_excel(
        file,
        config["serializer"]
    )

    return Response({
        "created": created,
        "errors": errors
    })