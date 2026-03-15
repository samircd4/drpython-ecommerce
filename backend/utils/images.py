import os
from io import BytesIO
from PIL import Image
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import UploadedFile

def convert_to_webp(image_field, max_size=(1200, 1200), quality=85):
    """
    Converts a Django image field to an optimized WebP format.
    - Resizes to max_size while maintaining aspect ratio.
    - Converts to WebP with specified quality.
    - Returns a ContentFile ready for saving.
    """
    if not image_field:
        return None

    # Defensive check: if it's just a string (as in some API tests), ignore it
    if isinstance(image_field, str):
        return None

    try:
        # Open the image
        img = Image.open(image_field)
        
        # Check if already WebP and fits max size - skip if no change needed
        # (Though re-compressing usually helps size, it costs CPU)
        if img.format == 'WEBP' and img.size[0] <= max_size[0] and img.size[1] <= max_size[1]:
            return None

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
        # Safely get a name, fallback to 'image' if missing
        original_name = getattr(image_field, 'name', 'image.jpg')
        if not original_name:
            original_name = 'image.jpg'
            
        name = os.path.splitext(os.path.basename(original_name))[0]
        new_name = f"{name}.webp"
        
        return ContentFile(buffer.getvalue(), name=new_name)
    except Exception as e:
        print(f"WebP Conversion failed: {e}")
        return None
