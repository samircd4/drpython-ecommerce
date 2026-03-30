from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import BasePermission

from registry.models import EXPORT_REGISTRY
from services.import_service import process_import_file


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

    ext = file.name.split('.')[-1].lower() if '.' in file.name else ''
    if ext not in ['csv', 'json', 'xls', 'xlsx']:
        return Response({"error": f"Unsupported file format '{ext}'. Please use csv, json, or excel files."}, status=400)

    created, errors = process_import_file(
        file,
        ext,
        config["serializer"]
    )

    return Response({
        "created": created,
        "errors": errors
    })