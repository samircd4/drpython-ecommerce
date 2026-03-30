from openpyxl import Workbook

def clean_value(value):
    if value is None:
        return ""

    # dict → convert to string
    if isinstance(value, dict):
        import json
        return json.dumps(value)

    # list → join
    if isinstance(value, list):
        return ", ".join(map(str, value))

    # objects with url (ImageField/FileField safe handling)
    if hasattr(value, "url"):
        return value.url

    return value

def get_export_data(queryset, serializer_class, request=None):
    """Returns a list of dictionaries representing the exported data."""
    serializer_context = {'request': request} if request else {}
    
    data_list = []
    serializer_instance = serializer_class(context=serializer_context)
    fields = list(serializer_instance.get_fields().keys())
    
    for obj in queryset:
        # We pass context here to ensure absolute URLs are generated if request is provided
        data = serializer_class(obj, context=serializer_context).data
        
        row_dict = {}
        for f in fields:
            value = data.get(f)
            row_dict[f] = clean_value(value)
        data_list.append(row_dict)
        
    return fields, data_list

def export_to_excel(fields, data_list, sheet_name="Sheet1"):
    wb = Workbook()
    ws = wb.active
    ws.title = sheet_name

    # header
    ws.append(fields)

    for row_dict in data_list:
        row = [row_dict.get(f) for f in fields]
        ws.append(row)

    return wb