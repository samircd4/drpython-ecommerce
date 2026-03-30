from openpyxl import Workbook

def clean_value(value):
    if value is None:
        return ""

    # dict → convert to string
    if isinstance(value, dict):
        return str(value)

    # list → join
    if isinstance(value, list):
        return ", ".join(map(str, value))

    # objects with url (ImageField/FileField safe handling)
    if hasattr(value, "url"):
        return value.url

    return value


def export_to_excel(queryset, serializer_class, sheet_name="Sheet1"):
    from openpyxl import Workbook

    wb = Workbook()
    ws = wb.active
    ws.title = sheet_name

    serializer = serializer_class()
    fields = list(serializer.get_fields().keys())

    # header
    ws.append(fields)

    for obj in queryset:
        data = serializer_class(obj).data

        row = []
        for f in fields:
            value = data.get(f)
            row.append(clean_value(value))

        ws.append(row)

    return wb