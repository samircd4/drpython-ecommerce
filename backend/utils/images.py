import os
import io
import piexif
from PIL import Image, ImageDraw, ImageFont
from django.core.files.base import ContentFile
from django.utils.text import slugify
from typing import Tuple, Optional, Union, Any

# Universal Fallback that avoids AttributeError
try:
    from PIL import ImageResampling
    RESAMPLE_MODE = ImageResampling.BICUBIC
except ImportError:
    # Use the integer value 3, which is the constant for BICUBIC in ALL versions
    RESAMPLE_MODE = 3

def process_image_to_webp(
    image_field: Any,
    name_source: str,
    category: str = "",
    brand: str = "",
    description: str = "",
    max_size: Tuple[int, int] = (1200, 1200),
    quality: int = 85,
    add_watermark: bool = False,
    index: Optional[int] = None
) -> Optional[ContentFile]:
    """
    Standardizes images for Sarker Shop (WebP + Renaming + Watermark + Metadata).
    Uses the exact watermark style from the user's provided snippet.
    """
    if not image_field or isinstance(image_field, str):
        return None

    try:
        # 1. Open and Prep Image
        img: Image.Image = Image.open(image_field)
        
        # Resize to max_size while maintaining aspect ratio
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        width, height = img.size

        # 2. Conditional Watermarking (Products only)
        if add_watermark:
            brand_text: str = "SARKER SHOP"
            # Create a transparent RGBA overlay the same size as the image
            overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            draw = ImageDraw.Draw(overlay)
            
            # Use a font sized at about 4% of the image width
            font_size = int(width * 0.04)
            font = None
            font_names = ["arial.ttf", "DejaVuSans.ttf", "Verdana.ttf", "C:\\Windows\\Fonts\\arial.ttf"]
            for name in font_names:
                try:
                    font = ImageFont.truetype(name, font_size)
                    break
                except:
                    continue
            if not font:
                font = ImageFont.load_default()

            watermark_color = (200, 200, 200, 60) # Subtle grey with low opacity (matches snippet)

            # Exact tiling logic from your provided snippet
            text_bbox = draw.textbbox((0, 0), brand_text, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            spacing_x = int(text_width * 1.8)
            spacing_y = int(font_size * 6)
            
            # Draw the text repeatedly in a tiled pattern across the overlay
            for x in range(-width, width * 2, spacing_x):
                for y in range(-height, height * 2, spacing_y):
                    # Exact txt_img buffer and rotation from snippet
                    txt_img = Image.new('RGBA', (int(text_width) + 50, font_size + 50), (0, 0, 0, 0))
                    txt_draw = ImageDraw.Draw(txt_img)
                    txt_draw.text((10, 10), brand_text, font=font, fill=watermark_color)
                    rotated_txt = txt_img.rotate(45, expand=1, resample=RESAMPLE_MODE)
                    overlay.paste(rotated_txt, (x, y), rotated_txt)

            # Composite the overlay over the original image using alpha compositing
            img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
        else:
            # Ensure it's RGB for non-watermarked too
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
