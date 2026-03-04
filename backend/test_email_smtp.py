import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_api.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_email():
    print("--- Django Email Diagnostic ---")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"EMAIL_USE_SSL: {settings.EMAIL_USE_SSL}")
    print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    
    recipient = input("Enter recipient email address to test: ")
    
    try:
        print(f"\nSending test email to {recipient}...")
        send_mail(
            'Sarker Shop - SMTP Test',
            'This is a diagnostic email from Sarker Shop backend. If you received this, your SMTP settings are working correctly.',
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=False,
        )
        print("✅ SUCCESS: Email sent successfully!")
    except Exception as e:
        print(f"❌ FAILED: Error sending email: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_email()
