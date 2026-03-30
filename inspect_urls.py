import os
import sys

# Set up Django environment
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_api.settings')

import django
django.setup()

from django.urls import get_resolver

def list_urls(lis, prefix=''):
    for entry in lis:
        if hasattr(entry, 'url_patterns'):
            list_urls(entry.url_patterns, prefix + str(entry.pattern))
        else:
            print(f"{prefix}{str(entry.pattern)} -> {entry.name}")

resolver = get_resolver()
list_urls(resolver.url_patterns)
