import io
import piexif
from PIL import Image
from django.core.files.base import ContentFile
from django.utils.text import slugify
from typing import Tuple, Optional, Any

def process_image_to_webp(
    image_field: Any,
    name_source: str,
    category: str = "",
    brand: str = "",
    description: str = "",
    max_size: Tuple[int, int] = (1200, 1200),
    quality: int = 85,
    index: Optional[int] = None
) -> Optional[ContentFile]:
    """
    Standardizes images for Sarker Shop (WebP + Renaming + Metadata).
    """
    if not image_field or isinstance(image_field, str):
        return None

    try:
        # 1. Open and Prep Image
        img: Image.Image = Image.open(image_field)
        
        # Resize to max_size while maintaining aspect ratio
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        width, height = img.size

        # 2. Ensure RGB for WebP output
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        # 3. Professional Metadata (EXIF)
        exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}}
        
        # Artist & Copyright
        exif_dict["0th"][piexif.ImageIFD.Artist] = b"Sarker Shop"
        exif_dict["0th"][piexif.ImageIFD.Copyright] = b"Sarker Shop"
        
        # Title & Subject: Product Name
        exif_dict["0th"][piexif.ImageIFD.ImageDescription] = name_source.encode('utf-8')
        
        # Software tag
        exif_dict["0th"][piexif.ImageIFD.Software] = b"Sarker Shop AI Image Processor"
        
        # Tags (XPKeywords for Windows)
        tags_list = ["Sarker Shop", "Online Shopping"]
        if brand: tags_list.insert(0, brand)
        if category: tags_list.insert(1, category)
        tags_str = ", ".join(tags_list)
        
        exif_dict["0th"][piexif.ImageIFD.XPKeywords] = tags_str.encode('utf-16le')
        
        # Comments: Product Description
        comment_text = description if description else f"Product: {name_source} | Shop: sarker.shop"
        exif_dict["Exif"][piexif.ExifIFD.UserComment] = comment_text.encode('utf-8')
        
        exif_bytes = piexif.dump(exif_dict)

        # 4. Save and Rename
        buffer = io.BytesIO()
        img.save(buffer, format="WEBP", exif=exif_bytes, quality=quality, optimize=True)
        
        # Rename logic: product title + optional index
        base_name = slugify(name_source)
        if index:
            new_name = f"{base_name}_{index}.webp"
        else:
            new_name = f"{base_name}.webp"
            
        return ContentFile(buffer.getvalue(), name=new_name)

    except Exception as e:
        print(f"Image conversion failed: {e}")
        return None
