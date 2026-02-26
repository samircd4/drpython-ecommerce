# /// script
# dependencies = [
#   "requests",
#   "python-dotenv",
# ]
# ///

import requests
import os
import json
import argparse
import tempfile
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class ProductImporter:
    def __init__(self, base_url: str, username: str = None, password: str = None):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.token = None
        
        if username and password:
            self.login(username, password)

    def login(self, username, password):
        print(f"Logging in as {username}...")
        url = f"{self.base_url}/auth/login/"
        payload = {'username': username, 'password': password}
        if '@' in username:
            payload = {'email': username, 'password': password}

        response = self.session.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            self.token = data.get('access')
            if self.token:
                self.session.headers.update({'Authorization': f'Bearer {self.token}'})
            print("Login successful.")
        else:
            print(f"Login failed: {response.status_code} - {response.text}")
            raise Exception("Authentication failed")

    def get_or_create_resource(self, endpoint: str, name: str) -> Optional[int]:
        if not name:
            return None
            
        name = str(name).strip()
        # Search for existing
        response = self.session.get(f"{self.base_url}/{endpoint}/")
        if response.status_code == 200:
            items = response.json()
            if isinstance(items, dict): # Handle pagination
                items = items.get('results', [])
            
            for item in items:
                if item.get('name').lower() == name.lower():
                    return item.get('id')
        
        # Create new if not found
        print(f"Creating new {endpoint[:-1]}: {name}")
        response = self.session.post(f"{self.base_url}/{endpoint}/", json={'name': name})
        if response.status_code == 201:
            return response.json().get('id')
        return None

    def add_product(self, data: dict, image_url: str = None):
        name = data.get('name')
        print(f"Importing Product: {name}...")

        # Get/Create Category and Brand
        brand_id = self.get_or_create_resource('brands', data.get('brand'))
        category_id = self.get_or_create_resource('categories', data.get('category'))

        # Prepare payload
        payload = {
            'name': name,
            'description': data.get('description', ''),
            'short_description': data.get('short_description', ''),
            'price': data.get('price', 0),
            'stock_quantity': data.get('stock', 10),
            'brand_id': brand_id,
            'category_id': category_id,
            'is_active': True
        }

        files = {}
        temp_file = None

        if image_url:
            print(f"Downloading image from: {image_url}")
            img_res = requests.get(image_url)
            if img_res.status_code == 200:
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
                temp_file.write(img_res.content)
                temp_file.close()
                files = {'image': open(temp_file.name, 'rb')}
            else:
                print(f"Failed to download image: {img_res.status_code}")

        # Post to API
        url = f"{self.base_url}/products/"
        # We use data= instead of json= when sending files (multipart/form-data)
        response = self.session.post(url, data=payload, files=files)

        if temp_file:
            files['image'].close()
            os.unlink(temp_file.name)

        if response.status_code == 201:
            print(f"✅ Successfully imported: {name}")
        else:
            print(f"❌ Failed to import {name}: {response.text}")

if __name__ == "__main__":
    # --- CONFIGURATION ---
    API_URL = "https://sarker.shop/api"
    USER = "admin"
    PASS = "admin" # <--- Change this!
    # ---------------------

    importer = ProductImporter(API_URL, USER, PASS)

    # Example: Adding a single product
    product_data = {
        "name": "Sony WH-1000XM5 Headphones",
        "brand": "Sony",
        "category": "Electronics",
        "price": 350.00,
        "stock": 15,
        "description": "Industry-leading noise canceling with two processors."
    }
    
    # You can change this URL to any image you find online
    IMG_URL = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"

    importer.add_product(product_data, image_url=IMG_URL)
