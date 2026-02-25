import os
import requests
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from products.models import Category, Product, Brand, ProductVariant, ProductSpecification, ProductImage

class Command(BaseCommand):
    help = 'Syncs categories, brands, and products from the production API to the local database.'

    PROD_API_URL = "https://sarker.shop/api"
    PROD_MEDIA_URL = "https://sarker.shop/media"
    session = requests.Session()

    def download_image(self, image_url, model_instance, field_name):
        if not image_url: 
            return
            
        # Handle cases where image_url might be a full URL or a relative path
        if not image_url.startswith('http'):
            # Remove leading slash if it exists
            clean_path = image_url.lstrip('/')
            # If it starts with media/, remove it as PROD_MEDIA_URL likely includes it
            if clean_path.startswith('media/'):
                clean_path = clean_path[6:]
            image_url = f"{self.PROD_MEDIA_URL.rstrip('/')}/{clean_path}"

        self.stdout.write(f"      Downloading: {image_url}")
        try:
            # Added verify=False to bypass SSL issues if any
            response = self.session.get(image_url, stream=True, timeout=15, verify=False)
            if response.status_code == 200:
                filename = os.path.basename(image_url.split('?')[0])
                content = response.content
                if content:
                    # Save with save=True to ensure DB update immediately
                    getattr(model_instance, field_name).save(filename, ContentFile(content), save=True)
                    self.stdout.write(self.style.SUCCESS(f"      ✓ Successfully synced: {filename}"))
                else:
                    self.stdout.write(self.style.WARNING(f"      ! Empty image content for: {filename}"))
            else:
                self.stdout.write(self.style.WARNING(f"      ✗ Failed (Status {response.status_code}): {image_url}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"      ✗ Error downloading {image_url}: {e}"))

    def get_all_results(self, endpoint):
        results = []
        url = f"{self.PROD_API_URL}/{endpoint}"
        if not url.endswith('/'): url += '/'
        
        while url:
            response = self.session.get(url, timeout=10)
            if response.status_code != 200: break
            data = response.json()
            if isinstance(data, dict) and 'results' in data:
                results.extend(data['results'])
                url = data.get('next')
            else:
                results = data ; break
        return results

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("=== Starting Sync from Production ==="))

        # 1. Brands
        self.stdout.write("\n[1/3] Syncing Brands...")
        brands = self.get_all_results("brands")
        for b_data in brands:
            brand, _ = Brand.objects.update_or_create(
                id=b_data['id'],
                defaults={'name': b_data['name'], 'slug': b_data.get('slug')}
            )
            if b_data.get('logo'): self.download_image(b_data['logo'], brand, 'logo')
            brand.save()

        # 2. Categories
        self.stdout.write("\n[2/3] Syncing Categories...")
        categories = self.get_all_results("categories")
        for cat_data in categories:
            cat, _ = Category.objects.update_or_create(
                id=cat_data['id'],
                defaults={'name': cat_data['name'], 'slug': cat_data.get('slug')}
            )
            if cat_data.get('logo'): self.download_image(cat_data['logo'], cat, 'logo')
            cat.save()
        for cat_data in categories:
            if cat_data.get('parent'):
                Category.objects.filter(id=cat_data['id']).update(parent_id=cat_data['parent'])

        # 3. Products
        self.stdout.write("\n[3/3] Syncing Products...")
        product_list = self.get_all_results("products")
        for p_brief in product_list:
            p_id = p_brief['id']
            self.stdout.write(f"  Fetching: {p_brief['name']}")
            res = self.session.get(f"{self.PROD_API_URL}/products/{p_id}/")
            if res.status_code != 200: continue
            p_data = res.json()
            
            product, _ = Product.objects.update_or_create(
                id=p_id,
                defaults={
                    'name': p_data['name'],
                    'slug': p_data['slug'],
                    'price': p_data.get('price'),
                    'wholesale_price': p_data.get('wholesale_price'),
                    'discount_price': p_data.get('discount_price'),
                    'stock_quantity': p_data.get('stock_quantity', 0),
                    'product_type': p_data.get('product_type', 'simple'),
                    'category_id': p_data['category']['id'] if isinstance(p_data['category'], dict) else p_data['category'],
                    'brand_id': p_data['brand']['id'] if isinstance(p_data['brand'], dict) else p_data['brand'],
                    'short_description': p_data.get('short_description', ''),
                    'description': p_data.get('description', ''),
                    'is_active': p_data.get('is_active', True),
                    'is_featured': p_data.get('is_featured', False),
                    'is_bestseller': p_data.get('is_bestseller', False),
                }
            )
            if p_data.get('image'): self.download_image(p_data['image'], product, 'image')
            Product.objects.filter(id=product.id).update(sku=p_data['sku'], product_id=p_data['product_id'])
            product.save()

            # Specs & Variants
            ProductSpecification.objects.filter(product=product).delete()
            for spec in p_data.get('specifications', []):
                ProductSpecification.objects.create(product=product, key=spec['key'], value=spec['value'])
            
            ProductVariant.objects.filter(product=product).delete()
            for v in p_data.get('variants', []):
                ProductVariant.objects.create(id=v['id'], product=product, sku=v['sku'], price=v['price'], 
                                              ram=v.get('ram'), storage=v.get('storage'), color=v.get('color',''),
                                              stock_quantity=v.get('stock_quantity', 0))

        self.stdout.write(self.style.SUCCESS("\n=== Sync Complete! ==="))
