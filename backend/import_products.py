import os
import django
import json
import tempfile
import urllib.request
from urllib.parse import urlparse
from django.core.files.base import ContentFile

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_api.settings')
django.setup()

from products.models import Product, Category, Brand, ProductSpecification, ProductImage

PRODUCTS_JSON_PATH = 'products.json'

def download_image(url):
    try:
        # Avoid hanging on large images or restricted URLs
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req, timeout=10)
        return ContentFile(response.read())
    except Exception as e:
        print(f"Error downloading image from {url}: {e}")
        return None

def import_products():
    with open(PRODUCTS_JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for item in data:
        print(f"Importing {item.get('name')}...")
        
        # 1. Category
        category_name = item.get('category', 'Uncategorized')
        category_qs = Category.objects.filter(name__iexact=category_name)
        if category_qs.exists():
            category = category_qs.first()
        else:
            category = Category.objects.create(name=category_name)
        
        # 2. Brand
        brand_name = item.get('brand', 'Unknown')
        if not brand_name:
             brand_name = "Unknown"
        brand_qs = Brand.objects.filter(name__iexact=brand_name)
        if brand_qs.exists():
            brand = brand_qs.first()
        else:
            brand = Brand.objects.create(name=brand_name)
        
        # 3. Product
        name = item.get('name')
        price = item.get('price')
        description = item.get('description', '')
        rating = item.get('rating', 0.0)
        reviews_count = item.get('reviews', 0)
        is_featured = item.get('is_featured', False)
        
        # Check if product already exists
        product_qs = Product.objects.filter(name=name)
        if product_qs.exists():
            print(f"Product {name} already exists. Skipping.")
            continue
            
        product = Product(
            name=name,
            price=price,
            category=category,
            brand=brand,
            description=description,
            rating=rating,
            reviews_count=reviews_count,
            is_featured=is_featured,
            stock_quantity=100, # default stock
            is_active=True
        )
        
        # 4. Main Image
        main_image_url = item.get('image')
        if main_image_url:
            print(f"  Downloading main image...")
            content = download_image(main_image_url)
            if content:
                # generate a filename from URL or random string
                try:
                     parsed = urlparse(main_image_url)
                     filename = os.path.basename(parsed.path)
                     if not filename or filename == '':
                          filename = f"{product.slug}_main.jpg"
                except:
                     filename = f"{product.slug}_main.jpg"
                if '.' not in filename:
                     filename += '.jpg'     
                product.image.save(filename, content, save=False)
                
        product.save()
        print(f"  Created Product: {product.product_id}")
        
        # 5. Specifications
        specs = item.get('specifications', {})
        for key, value in specs.items():
            if key and value:
                # don't save Brand or Category again as specs if they match the assigned model fields
                if key.lower() in ['brand', 'category']:
                    continue
                ProductSpecification.objects.create(
                    product=product,
                    key=str(key),
                    value=str(value)
                )
                
        # 6. Additional Images
        images_urls = item.get('images', [])
        # We cap at 5 additional images to prevent excessive downloading if not needed
        for idx, img_url in enumerate(images_urls[:5]):
            print(f"  Downloading additional image {idx+1}/{len(images_urls[:5])}...")
            content = download_image(img_url)
            if content:
                 try:
                     parsed = urlparse(img_url)
                     filename = os.path.basename(parsed.path)
                     if not filename or filename == '':
                          filename = f"{product.slug}_gallery_{idx}.jpg"
                 except:
                     filename = f"{product.slug}_gallery_{idx}.jpg"
                 if '.' not in filename:
                     filename += '.jpg' 
                     
                 pi = ProductImage(product=product, order=idx)
                 pi.image.save(filename, content, save=True)

    print("Import complete!")

if __name__ == '__main__':
    import_products()
