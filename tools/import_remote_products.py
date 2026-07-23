# /// script
# dependencies = [
#   "requests",
#   "python-dotenv",
# ]
# ///

#!/usr/bin/env python3
"""
drpython-ecommerce — External Product Importer Script

Fetches product catalog data from an external API endpoint (such as https://sarker.shop/api/products/)
and imports them into the local drpython-ecommerce API backend, creating required Brands,
Categories, Product Images, and Specifications automatically.

Usage:
  python tools/import_remote_products.py --source-url https://sarker.shop/api/products/ --target-api http://localhost:8002/api --username admin --password admin

Dependencies:
  pip install requests python-dotenv
"""

import os
import sys
import argparse
import tempfile
import json
import requests
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

# Ensure UTF-8 output encoding for Windows terminal compatibility
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

load_dotenv()

# ==============================================================================
# ⚙️ CONFIGURATION - Set your source, target API, and credentials here
# ==============================================================================
SOURCE_URL = "https://sarker.shop/api/products/"
TARGET_API = "http://localhost:8002"
USERNAME   = "admin"
PASSWORD   = "admin"

MAX_PAGES   = None  # Set an integer (e.g. 5) to limit pages, or None for all
LIMIT_ITEMS = None  # Set an integer (e.g. 10) to limit items, or None for all
# ==============================================================================


class ProductImporter:
    def __init__(self, target_api_url: str, username: str = None, password: str = None):
        self.target_api_url = target_api_url.rstrip('/')
        self.session = requests.Session()
        self.token = None

        if username and password:
            self.login(username, password)

    def login(self, username: str, password: str):
        """Authenticate against the target API to obtain a JWT access token."""
        print(f"🔑 Authenticating with target API ({self.target_api_url}) as '{username}'...")
        login_url = f"{self.target_api_url}/auth/login/"
        payload = {'username': username, 'password': password}
        if '@' in username:
            payload = {'email': username, 'password': password}

        res = self.session.post(login_url, json=payload)
        if res.status_code == 200:
            data = res.json()
            self.token = data.get('access') or data.get('token')
            if self.token:
                self.session.headers.update({'Authorization': f'Bearer {self.token}'})
            print("✅ Login successful.")
        else:
            print(f"⚠️ Warning: Auth failed ({res.status_code}): {res.text}")
            print("   Proceeding without authentication token (requests may fail if auth is required).")

    def get_or_create_brand(self, brand_data: Optional[Dict[str, Any]]) -> Optional[int]:
        """Find an existing Brand by name or create a new one."""
        if not brand_data or not brand_data.get('name'):
            return None

        name = brand_data['name'].strip()
        slug = brand_data.get('slug', '').strip()

        # Check existing brands
        res = self.session.get(f"{self.target_api_url}/brands/")
        if res.status_code == 200:
            items = res.json()
            if isinstance(items, dict):
                items = items.get('results', [])
            for item in items:
                if item.get('name', '').lower() == name.lower():
                    return item.get('id')

        # Create new Brand
        print(f"  🏷️ Creating brand: '{name}'")
        logo_url = brand_data.get('logo')
        files = {}
        temp_logo = None

        if logo_url:
            try:
                r = requests.get(logo_url, timeout=10)
                if r.status_code == 200:
                    temp_logo = tempfile.NamedTemporaryFile(delete=False, suffix='.webp')
                    temp_logo.write(r.content)
                    temp_logo.close()
                    files = {'logo': open(temp_logo.name, 'rb')}
            except Exception as e:
                print(f"     Failed to download brand logo: {e}")

        payload = {'name': name}
        if slug:
            payload['slug'] = slug

        if files:
            res = self.session.post(f"{self.target_api_url}/brands/", data=payload, files=files)
            files['logo'].close()
            if temp_logo:
                os.unlink(temp_logo.name)
        else:
            res = self.session.post(f"{self.target_api_url}/brands/", json=payload)

        if res.status_code in (200, 201):
            return res.json().get('id')
        else:
            print(f"     Failed to create brand '{name}': {res.text}")
            return None

    def get_or_create_category(self, cat_data: Optional[Dict[str, Any]]) -> Optional[int]:
        """Find an existing Category by name or create a new one."""
        if not cat_data or not cat_data.get('name'):
            return None

        name = cat_data['name'].strip()
        slug = cat_data.get('slug', '').strip()

        # Check existing categories
        res = self.session.get(f"{self.target_api_url}/categories/")
        if res.status_code == 200:
            items = res.json()
            if isinstance(items, dict):
                items = items.get('results', [])
            for item in items:
                if item.get('name', '').lower() == name.lower():
                    return item.get('id')

        # Create new Category
        print(f"  📁 Creating category: '{name}'")
        logo_url = cat_data.get('logo')
        files = {}
        temp_logo = None

        if logo_url:
            try:
                r = requests.get(logo_url, timeout=10)
                if r.status_code == 200:
                    temp_logo = tempfile.NamedTemporaryFile(delete=False, suffix='.webp')
                    temp_logo.write(r.content)
                    temp_logo.close()
                    files = {'logo': open(temp_logo.name, 'rb')}
            except Exception as e:
                print(f"     Failed to download category logo: {e}")

        payload = {'name': name}
        if slug:
            payload['slug'] = slug

        if files:
            res = self.session.post(f"{self.target_api_url}/categories/", data=payload, files=files)
            files['logo'].close()
            if temp_logo:
                os.unlink(temp_logo.name)
        else:
            res = self.session.post(f"{self.target_api_url}/categories/", json=payload)

        if res.status_code in (200, 201):
            return res.json().get('id')
        else:
            print(f"     Failed to create category '{name}': {res.text}")
            return None

    def import_product(self, raw_item: Dict[str, Any]) -> bool:
        """Process and import a single remote product item dict into the local API."""
        name = raw_item.get('name', 'Unnamed Product')
        sku = raw_item.get('sku') or raw_item.get('product_id') or ''
        print(f"\n📦 Processing: {name} (SKU: {sku})")

        # 1. Resolve Brand & Category
        brand_id = self.get_or_create_brand(raw_item.get('brand'))
        category_id = self.get_or_create_category(raw_item.get('category'))

        # 2. Prepare payload fields
        payload = {
            'name': name,
            'description': raw_item.get('description', ''),
            'short_description': raw_item.get('short_description', ''),
            'price': raw_item.get('price', 0),
            'stock_quantity': raw_item.get('stock_quantity', 10),
            'product_type': raw_item.get('product_type', 'simple'),
            'is_featured': str(raw_item.get('is_featured', False)).lower(),
            'is_bestseller': str(raw_item.get('is_bestseller', False)).lower(),
            'is_active': str(raw_item.get('is_active', True)).lower(),
        }

        if sku:
            payload['sku'] = sku
        if raw_item.get('discount_price'):
            payload['discount_price'] = raw_item['discount_price']
        if brand_id:
            payload['brand_id'] = brand_id
        if category_id:
            payload['category_id'] = category_id

        # Pass specifications as JSON string if available
        specs = raw_item.get('specifications', [])
        if specs and isinstance(specs, list):
            payload['specs_input'] = json.dumps(specs)

        # 3. Download primary image & gallery images
        files_list = []
        temp_files = []

        main_img_url = raw_item.get('image')
        if main_img_url:
            try:
                r = requests.get(main_img_url, timeout=15)
                if r.status_code == 200:
                    tf = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
                    tf.write(r.content)
                    tf.close()
                    temp_files.append(tf.name)
                    fh = open(tf.name, 'rb')
                    files_list.append(('image', ('main.jpg', fh, 'image/jpeg')))
            except Exception as e:
                print(f"  ⚠️ Main image download failed: {e}")

        # Download gallery images (using tuple list format for Django request.FILES.getlist('uploaded_images'))
        gallery = raw_item.get('gallery_images', [])
        for idx, g_item in enumerate(gallery):
            g_url = g_item.get('image') if isinstance(g_item, dict) else g_item
            if g_url:
                try:
                    r = requests.get(g_url, timeout=15)
                    if r.status_code == 200:
                        tf = tempfile.NamedTemporaryFile(delete=False, suffix=f'_g{idx}.jpg')
                        tf.write(r.content)
                        tf.close()
                        temp_files.append(tf.name)
                        fh = open(tf.name, 'rb')
                        files_list.append(('uploaded_images', (f'gallery_{idx}.jpg', fh, 'image/jpeg')))
                except Exception as e:
                    print(f"  ⚠️ Gallery image #{idx} download failed: {e}")

        # 4. POST to local target API endpoint
        url = f"{self.target_api_url}/products/"
        try:
            if files_list:
                response = self.session.post(url, data=payload, files=files_list)
            else:
                response = self.session.post(url, data=payload)

            if response.status_code in (200, 201):
                print(f"  ✅ Imported successfully: {name}")
                success = True
            else:
                print(f"  ❌ Failed ({response.status_code}): {response.text}")
                success = False
        except Exception as e:
            print(f"  ❌ Request error: {e}")
            success = False
        finally:
            # Clean up open file handles and temp files
            for _, item_tuple in files_list:
                try:
                    item_tuple[1].close()
                except Exception:
                    pass
            for fpath in temp_files:
                try:
                    os.unlink(fpath)
                except Exception:
                    pass

        return success

    def fetch_and_import(self, source_url: str, max_pages: int = None, limit: int = None):
        """Paginate through the source API and import all products."""
        current_url = source_url
        page_count = 0
        total_imported = 0
        total_failed = 0

        print(f"\n🚀 Starting import from: {source_url}")
        print("=" * 60)

        while current_url:
            page_count += 1
            print(f"\n📄 Fetching Page #{page_count}: {current_url}")
            try:
                res = requests.get(current_url, timeout=30)
                if res.status_code != 200:
                    print(f"❌ Failed to fetch page #{page_count}: {res.status_code} {res.text}")
                    break

                data = res.json()
                results = data.get('results', []) if isinstance(data, dict) else data

                print(f"Found {len(results)} items on page #{page_count}.")
                for item in results:
                    if limit and (total_imported + total_failed) >= limit:
                        print(f"\n🛑 Reached specified item limit of {limit}.")
                        return

                    success = self.import_product(item)
                    if success:
                        total_imported += 1
                    else:
                        total_failed += 1

                current_url = data.get('next') if isinstance(data, dict) else None

                if max_pages and page_count >= max_pages:
                    print(f"\n🛑 Reached maximum page limit of {max_pages}.")
                    break

            except Exception as e:
                print(f"❌ Error processing page #{page_count}: {e}")
                break

        print("\n" + "=" * 60)
        print("🎉 IMPORT COMPLETE SUMMARY:")
        print(f"   Pages Processed:       {page_count}")
        print(f"   Successfully Imported: {total_imported}")
        print(f"   Failed Imports:        {total_failed}")
        print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="Import products from an external API into local drpython-ecommerce."
    )
    parser.add_argument(
        "--source-url",
        default=SOURCE_URL,
        help=f"External API endpoint URL returning JSON product catalog (default: {SOURCE_URL})"
    )
    parser.add_argument(
        "--target-api",
        default=os.getenv("TARGET_API_URL", TARGET_API),
        help=f"Target local API endpoint URL (default: {TARGET_API})"
    )
    parser.add_argument(
        "--username",
        default=os.getenv("TARGET_API_USER", USERNAME),
        help=f"Target API admin username (default: {USERNAME})"
    )
    parser.add_argument(
        "--password",
        default=os.getenv("TARGET_API_PASS", PASSWORD),
        help="Target API admin password"
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=MAX_PAGES,
        help="Maximum number of pages to fetch from source API"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=LIMIT_ITEMS,
        help="Maximum total number of products to import"
    )

    args = parser.parse_args()

    importer = ProductImporter(
        target_api_url=args.target_api,
        username=args.username,
        password=args.password
    )
    importer.fetch_and_import(
        source_url=args.source_url,
        max_pages=args.max_pages,
        limit=args.limit
    )


if __name__ == "__main__":
    main()
