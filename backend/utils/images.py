import os
from io import BytesIO
from PIL import Image
from django.core.files.base import ContentFile

def convert_to_webp(image_field, max_size=(1200, 1200), quality=85):
    """
    Converts a Django image field to an optimized WebP format.
    - Resizes to max_size while maintaining aspect ratio.
    - Converts to WebP with specified quality.
    - Returns a ContentFile ready for saving.
    """
    if not image_field:
        return None

    # Open the image
    img = Image.open(image_field)
    
    # Handle transparency/mode conversion
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")
    
    # Resize if larger than max_size
    img.thumbnail(max_size, Image.Resampling.LANCZOS)
    
    # Save to buffer
    buffer = BytesIO()
    img.save(buffer, format="WEBP", quality=quality, optimize=True)
    buffer.seek(0)
    
    # Prepare the new filename
    name = os.path.splitext(os.path.basename(image_field.name))[0]
    new_name = f"{name}.webp"
    
    return ContentFile(buffer.read(), name=new_name)
