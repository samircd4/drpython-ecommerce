import json
import random
import os

# Categories and Brands for random generation
CATEGORIES = {
    "Mobiles": ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi"],
    "Laptops": ["Apple", "Dell", "HP", "Lenovo", "Asus"],
    "Tablets": ["Apple", "Samsung", "Lenovo", "Microsoft"],
    "Wearables": ["Apple", "Samsung", "Garmin", "Fitbit"],
    "Audio": ["Sony", "Bose", "Sennheiser", "JBL", "Apple"],
    "Accessories": ["Logitech", "Anker", "Belkin", "Spigen"],
    "Gaming": ["Sony", "Microsoft", "Nintendo", "Razer", "Corsair"],
    "Cameras": ["Canon", "Nikon", "Sony", "Fujifilm", "Panasonic"]
}

# Image pool for random product images (using unsplash source for diverse tech images)
IMAGE_IDS = [
    "1505740420928-5e560c06d30e", "1601599561213-832382fd07ba", "1593640408182-31c70c8268f5",
    "1523206489230-c628115fe334", "1546868871-7041f2a55e12", "1526738549149-8e89b222fba2",
    "1585336261022-6a07851ee667", "1611186871340-2396328bc6e6", "1517336714731-489689fd1ca8",
    "1606220576361-cedce7c502da", "1496181133206-80ce9b88a853", "1588872657578-c0f5fcfdcbd0",
    "1600080972464-8e5ceb4a6962", "1504274068536-1c88820c75ff", "1511707171634-5f897ff02aa9",
    "1583394838336-acd977736f90", "1542382103328-8686a34a1795", "1564466809059-eb5e4d2716ee",
    "1486406146926-c627a92ad1ab", "1606813907291-d8ecefa6a374", "1512499616203-05f33333bc7f"
]

def generate_image_url(image_id, width, height):
    return f"https://images.unsplash.com/photo-{image_id}?w={width}&h={height}&fit=crop&q=80"

def generate_product(new_id):
    category = random.choice(list(CATEGORIES.keys()))
    brand = random.choice(CATEGORIES[category])
    name = f"{brand} {category[:-1]} Model {random.randint(100, 999)}"
    
    # Generate 5-8 unique images
    num_images = random.randint(5, 8)
    selected_image_ids = random.sample(IMAGE_IDS, num_images)
    
    main_image_id = selected_image_ids[0]
    image_url = generate_image_url(main_image_id, 400, 400)
    
    # 5-8 gallery images
    images = [generate_image_url(img_id, 800, 800) for img_id in selected_image_ids]
    
    specifications = {
        "Brand": brand,
        "Color": random.choice(["Black", "White", "Silver", "Space Gray", "Midnight Green"]),
        "Warranty": "1 Year Official",
        "Weight": f"{random.randint(150, 2000)}g"
    }

    if category in ["Mobiles", "Tablets"]:
        specifications.update({
            "RAM": random.choice(["4GB", "6GB", "8GB", "12GB"]),
            "Storage": random.choice(["64GB", "128GB", "256GB", "512GB"]),
            "Battery": f"{random.randint(3000, 6000)} mAh"
        })
    elif category == "Laptops":
        specifications.update({
            "Processor": random.choice(["Intel Core i5", "Intel Core i7", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M2"]),
            "RAM": random.choice(["8GB", "16GB", "32GB"]),
            "Storage": random.choice(["256GB SSD", "512GB SSD", "1TB SSD"]),
            "Display": random.choice(["13.3 inch", "14 inch", "15.6 inch", "16 inch"])
        })

    return {
        "id": new_id,
        "name": name,
        "brand": brand, # Custom field that import_products uses
        "price": round(random.uniform(29.99, 1999.99), 2),
        "category": category,
        "image": image_url,
        "images": images,
        "rating": round(random.uniform(3.5, 5.0), 1),
        "reviews": random.randint(10, 500),
        "description": f"This is a premium {category[:-1].lower()} from {brand}. It boasts top-tier performance, elegant design, and cutting edge technology.",
        "is_featured": random.choice([True, False, False]),
        "specifications": specifications
    }

def main():
    json_path = os.path.join("frontend", "src", "data", "products.json")
    backend_json_path = os.path.join("backend", "products.json")
    
    with open(json_path, 'r', encoding='utf-8') as f:
        products = json.load(f)
        
    start_id = max([p.get('id', 0) for p in products]) + 1
    
    print(f"Generating 60 new products starting from ID {start_id}...")
    new_products = [generate_product(start_id + i) for i in range(60)]
    
    products.extend(new_products)
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=4)
        
    print(f"Successfully appended 60 products to {json_path}")
    
    # Maintain parity with the backend copy if it exists
    if os.path.exists(backend_json_path):
        with open(backend_json_path, 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=4)
        print(f"Successfully updated {backend_json_path}")

if __name__ == "__main__":
    main()
