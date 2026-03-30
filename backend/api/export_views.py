from django.http import HttpResponse
from rest_framework.decorators import api_view

from registry.models import EXPORT_REGISTRY
from services.export_service import export_to_excel


@api_view(["GET"])
def export_data(request, model_name):
    config = EXPORT_REGISTRY.get(model_name)

    if not config:
        return HttpResponse("Invalid model", status=400)

    queryset = config["model"].objects.all()

    wb = export_to_excel(
        queryset,
        config["serializer"],
        sheet_name=model_name
    )

    response = HttpResponse(
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    response["Content-Disposition"] = f'attachment; filename="{model_name}.xlsx"'

    wb.save(response)
    return response