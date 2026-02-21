import os
import sys
import json
import django

sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_api.settings')
django.setup()

from accounts.models import Division, District, SubDistrict
from django.db import connection

# ── helpers ──────────────────────────────────────────────────────────────────

def load(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

# ── 1. Divisions ─────────────────────────────────────────────────────────────

print("\n── Importing Divisions ──")
divisions = load('/app/division.json')
for d in divisions:
    obj, created = Division.objects.update_or_create(
        id=int(d['id']),
        defaults={
            'name':    d['name'],
            'bn_name': d['bn_name'],
        }
    )
    print(f"  {'Created' if created else 'Updated'} Division [{obj.id}]: {obj.name}")

# Fix the sequence so next auto-insert won't clash
with connection.cursor() as cur:
    cur.execute("SELECT setval(pg_get_serial_sequence('accounts_division','id'), MAX(id)) FROM accounts_division")
print(f"  ✓ Sequence updated ({Division.objects.count()} divisions total)")

# ── 2. Districts ──────────────────────────────────────────────────────────────

print("\n── Importing Districts ──")
districts = load('/app/district.json')
for d in districts:
    obj, created = District.objects.update_or_create(
        id=int(d['id']),
        defaults={
            'division_id': int(d['division_id']),
            'name':        d['name'],
            'bn_name':     d['bn_name'],
            'lat':         d.get('lat', ''),
            'long':        d.get('lon', ''),   # note: JSON uses 'lon', model uses 'long'
        }
    )
    print(f"  {'Created' if created else 'Updated'} District [{obj.id}]: {obj.name}")

with connection.cursor() as cur:
    cur.execute("SELECT setval(pg_get_serial_sequence('accounts_district','id'), MAX(id)) FROM accounts_district")
print(f"  ✓ Sequence updated ({District.objects.count()} districts total)")

# ── 3. Sub-Districts ──────────────────────────────────────────────────────────

print("\n── Importing Sub-Districts (Upazilas) ──")
upazilas = load('/app/sub-district.json')
for u in upazilas:
    obj, created = SubDistrict.objects.update_or_create(
        id=int(u['id']),
        defaults={
            'district_id': int(u['district_id']),
            'name':        u['name'],
            'bn_name':     u['bn_name'],
        }
    )
    print(f"  {'Created' if created else 'Updated'} SubDistrict [{obj.id}]: {obj.name}")

with connection.cursor() as cur:
    cur.execute("SELECT setval(pg_get_serial_sequence('accounts_subdistrict','id'), MAX(id)) FROM accounts_subdistrict")
print(f"  ✓ Sequence updated ({SubDistrict.objects.count()} upazilas total)")

print("\n✅ Import complete!")
