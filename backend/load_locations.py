import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_api.settings')
django.setup()

from accounts.models import Division, District, SubDistrict

def load_data():
    with open('division.json', 'r', encoding='utf-8') as f:
        divisions = json.load(f)
        for d in divisions:
            Division.objects.update_or_create(
                id=d['id'],
                defaults={
                    'name': d['name'],
                    'bn_name': d.get('bn_name', ''),
                    'lat': d.get('lat'),
                    'long': d.get('lon')  # JSON uses 'lon', model uses 'long'
                }
            )
    print("Divisions loaded")

    with open('district.json', 'r', encoding='utf-8') as f:
        districts = json.load(f)
        for d in districts:
            District.objects.update_or_create(
                id=d['id'],
                defaults={
                    'division_id': d['division_id'],
                    'name': d['name'],
                    'bn_name': d.get('bn_name', ''),
                    'lat': d.get('lat'),
                    'long': d.get('lon')
                }
            )
    print("Districts loaded")

    with open('sub-district.json', 'r', encoding='utf-8') as f:
        sub_districts = json.load(f)
        for d in sub_districts:
            SubDistrict.objects.update_or_create(
                id=d['id'],
                defaults={
                    'district_id': d['district_id'],
                    'name': d['name'],
                    'bn_name': d.get('bn_name', '')
                }
            )
    print("SubDistricts loaded")

if __name__ == '__main__':
    load_data()
