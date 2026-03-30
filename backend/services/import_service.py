from openpyxl import load_workbook
from rich import print

def import_from_excel(file, serializer_class):
    wb = load_workbook(file)
    ws = wb.active

    rows = list(ws.iter_rows(values_only=True))
    headers = [h.lower() for h in rows[0]]

    created = 0
    errors = []

    for row in rows[1:]:
        data = dict(zip(headers, row))
        print(data)

        serializer = serializer_class(data=data)
        
        if serializer.is_valid():
            serializer.save()
            created += 1
        else:
            errors.append(serializer.errors)

    return created, errors