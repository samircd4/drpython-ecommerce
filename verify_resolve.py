import os
import sys

# Set up Django environment
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_api.settings')

import django
django.setup()

from django.urls import resolve, Resolver404

def verify_url(path):
    print(f"Verifying path: {path}")
    try:
        match = resolve(path)
        print(f"MATCH SUCCESS!")
        print(f"View: {match.func.__module__}.{match.func.__name__}")
        print(f"Args: {match.args}")
        print(f"Kwargs: {match.kwargs}")
        print(f"Namespace: {match.namespace}")
        print(f"URL Name: {match.url_name}")
    except Resolver404:
        print("MATCH FAILED: 404")

# Test original failing URL
verify_url('/api/data-mgmt/export-file/brands')
# Test with trailing slash (if it was added by mistake)
verify_url('/api/data-mgmt/export-file/brands/')
