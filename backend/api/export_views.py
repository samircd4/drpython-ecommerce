import csv
import json
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from registry.models import EXPORT_REGISTRY
from services.export_service import get_export_data, export_to_excel

@api_view(["GET"])
@permission_classes([AllowAny])
def export_data(request, model_name):
    print(f"\n--- EXPORT DEBUG START ---")
    print(f"Model: {model_name}")
    try:
        config = EXPORT_REGISTRY.get(model_name)
        if not config:
            print(f"Error: Model '{model_name}' not found in registry.")
            return Response({"error": f"Model '{model_name}' no found in registry."}, status=400)

        export_format = request.query_params.get("format", "xlsx").lower()
        print(f"Format: {export_format}")

        queryset = config["model"].objects.all()
        print(f"Queryset count: {queryset.count()}")

        # Pass request to get absolute URLs automatically via Serializer context
        fields, data_list = get_export_data(
            queryset,
            config["serializer"],
            request=request
        )
        print(f"Serializer processed {len(data_list)} rows.")

        if export_format == "json":
            response = JsonResponse(data_list, safe=False)
            response["Content-Disposition"] = f'attachment; filename="{model_name}.json"'
            return response

        elif export_format == "csv":
            response = HttpResponse(content_type="text/csv")
            response["Content-Disposition"] = f'attachment; filename="{model_name}.csv"'
            
            writer = csv.DictWriter(response, fieldnames=fields)
            writer.writeheader()
            writer.writerows(data_list)
            return response

        else:  # Default to XLSX
            wb = export_to_excel(fields, data_list, sheet_name=model_name)
            
            response = HttpResponse(
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
            response["Content-Disposition"] = f'attachment; filename="{model_name}.xlsx"'
            wb.save(response)
            return response
            
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(f"CRITICAL EXPORT ERROR:\n{error_msg}")
        return Response({
            "error": "Internal server error during export",
            "details": str(e),
            "traceback": error_msg if settings.DEBUG else None
        }, status=500)
    finally:
        print(f"--- EXPORT DEBUG END ---\n")