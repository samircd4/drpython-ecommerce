import json
import os
from django.core.management.base import BaseCommand
from django.db import transaction

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))


class Command(BaseCommand):
    help = "Seeds the DB with divisions, districts, sub-districts, categories, brands and products from JSON files."

    # ------------------------------------------------------------------ #
    #  Helpers                                                             #
    # ------------------------------------------------------------------ #
    def _load_json(self, filename):
        path = os.path.join(BASE_DIR, filename)
        if not os.path.exists(path):
            self.stdout.write(self.style.ERROR(f"  ✗ File not found: {path}"))
            return []
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    # ------------------------------------------------------------------ #
    #  Entry point                                                         #
    # ------------------------------------------------------------------ #
    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("=== Seeding local database ===\n"))

        self._seed_locations()
        self._seed_products()

        self.stdout.write(self.style.SUCCESS("\n=== Seeding complete! ==="))

    # ------------------------------------------------------------------ #
    #  1. Locations                                                        #
    # ------------------------------------------------------------------ #
    @transaction.atomic
    def _seed_locations(self):
        from accounts.models import Division, District, SubDistrict

        # -- Divisions --
        self.stdout.write("[1/5] Seeding Divisions …")
        divisions_data = self._load_json("division.json")
        div_map = {}  # json_id -> Division instance
        created = updated = 0
        for item in divisions_data:
            div, is_new = Division.objects.update_or_create(
                name=item["name"],
                defaults={"bn_name": item.get("bn_name", "")},
            )
            div_map[str(item["id"])] = div
            if is_new:
                created += 1
            else:
                updated += 1
        self.stdout.write(self.style.SUCCESS(
            f"  ✓ Divisions: {created} created, {updated} updated"
        ))

        # -- Districts --
        self.stdout.write("[2/5] Seeding Districts …")
        districts_data = self._load_json("district.json")
        dist_map = {}  # json_id -> District instance
        created = updated = skipped = 0
        for item in districts_data:
            div_id = str(item["division_id"])
            if div_id not in div_map:
                self.stdout.write(self.style.WARNING(
                    f"  ! District '{item['name']}' references unknown division_id={div_id}, skipping."
                ))
                skipped += 1
                continue
            dist, is_new = District.objects.update_or_create(
                name=item["name"],
                division=div_map[div_id],
                defaults={
                    "bn_name": item.get("bn_name", ""),
                    "lat": item.get("lat", ""),
                    "long": item.get("lon", ""),
                },
            )
            dist_map[str(item["id"])] = dist
            if is_new:
                created += 1
            else:
                updated += 1
        self.stdout.write(self.style.SUCCESS(
            f"  ✓ Districts: {created} created, {updated} updated, {skipped} skipped"
        ))

        # -- Sub-Districts --
        self.stdout.write("[3/5] Seeding Sub-Districts …")
        sub_data = self._load_json("sub-district.json")
        created = updated = skipped = 0
        for item in sub_data:
            dist_id = str(item["district_id"])
            if dist_id not in dist_map:
                self.stdout.write(self.style.WARNING(
                    f"  ! Sub-district '{item['name']}' references unknown district_id={dist_id}, skipping."
                ))
                skipped += 1
                continue
            _, is_new = SubDistrict.objects.update_or_create(
                name=item["name"].strip(),
                district=dist_map[dist_id],
                defaults={"bn_name": item.get("bn_name", "").strip()},
            )
            if is_new:
                created += 1
            else:
                updated += 1
        self.stdout.write(self.style.SUCCESS(
            f"  ✓ Sub-Districts: {created} created, {updated} updated, {skipped} skipped"
        ))

    # ------------------------------------------------------------------ #
    #  2. Products (categories + brands extracted from products.json)     #
    # ------------------------------------------------------------------ #
    @transaction.atomic
    def _seed_products(self):
        from products.models import Category, Brand, Product, ProductSpecification

        products_data = self._load_json("products.json")
        if not products_data:
            return

        # -- Categories (extracted from products.json) --
        self.stdout.write("[4/5] Seeding Categories …")
        category_names = {p["category"] for p in products_data if p.get("category")}
        cat_map = {}  # name -> Category instance
        created = updated = 0
        for cat_name in sorted(category_names):
            cat, is_new = Category.objects.get_or_create(name=cat_name)
            cat_map[cat_name] = cat
            if is_new:
                created += 1
            else:
                updated += 1
        self.stdout.write(self.style.SUCCESS(
            f"  ✓ Categories: {created} created, {updated} already existed  "
            f"({', '.join(sorted(category_names))})"
        ))

        # -- Brands (extracted from products.json, fall back to "Generic") --
        self.stdout.write("[5/5] Seeding Brands, Products & Specifications …")
        brand_names = {p.get("brand", "Generic") for p in products_data}
        brand_names.add("Generic")  # ensure default always exists
        brand_map = {}  # name -> Brand instance
        for brand_name in sorted(brand_names):
            brand, _ = Brand.objects.get_or_create(name=brand_name)
            brand_map[brand_name] = brand

        # -- Products --
        prod_created = prod_updated = spec_count = 0
        for item in products_data:
            cat_name  = item.get("category", "")
            brand_name = item.get("brand", "Generic")

            if cat_name not in cat_map:
                self.stdout.write(self.style.WARNING(
                    f"  ! Product '{item['name']}' has unknown category '{cat_name}', skipping."
                ))
                continue

            category = cat_map[cat_name]
            brand    = brand_map.get(brand_name, brand_map["Generic"])

            product, is_new = Product.objects.update_or_create(
                name=item["name"],
                defaults={
                    "price":           item.get("price"),
                    "category":        category,
                    "brand":           brand,
                    "description":     item.get("description", ""),
                    "short_description": item.get("description", "")[:200],
                    "is_featured":     item.get("is_featured", False),
                    "rating":          min(float(item.get("rating", 0)), 5.0),
                    "reviews_count":   item.get("reviews", 0),
                    "is_active":       True,
                    "stock_quantity":  item.get("stock_quantity", 100),
                },
            )

            # Specifications
            specs = item.get("specifications", {})
            if specs and isinstance(specs, dict):
                # Remove old specs and re-create to stay idempotent
                product.specifications.all().delete()
                for key, value in specs.items():
                    ProductSpecification.objects.create(
                        product=product,
                        key=str(key)[:100],
                        value=str(value)[:500],
                    )
                    spec_count += 1

            if is_new:
                prod_created += 1
            else:
                prod_updated += 1

        self.stdout.write(self.style.SUCCESS(
            f"  ✓ Products : {prod_created} created, {prod_updated} updated"
        ))
        self.stdout.write(self.style.SUCCESS(
            f"  ✓ Specs    : {spec_count} specification entries written"
        ))
        self.stdout.write(self.style.SUCCESS(
            f"  ✓ Brands   : {len(brand_map)} brands ensured  "
            f"({', '.join(sorted(brand_map.keys()))})"
        ))
